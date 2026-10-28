import random
from typing import Any, Dict, List, Optional
from ..schemas.simulation import (
    SimulationConfig,
    SimulationStatus,
    SimulationSnapshot,
    GanttInterval,
    SchedulerType
)
from ..schemas.process import ProcessCreate, ProcessState, ProcessModel
from ..schemas.anomaly import AnomalyAlert
from ..schemas.recovery import RecoveryDecisionRecord
from .clock import SimulationClock
from .process import SimulatedProcess
from ..schedulers import BaseScheduler, create_scheduler, RoundRobinScheduler, AdaptiveScheduler
from ..monitoring.metrics import MetricsTracker
from ..monitoring.detector import AnomalyDetector
from ..recovery.policy import RecoveryPolicyEngine


class SimulationEngine:
    """Authoritative deterministic discrete-time OS Simulation Engine."""

    def __init__(self, config: Optional[SimulationConfig] = None):
        self._initial_config: SimulationConfig = (config or SimulationConfig()).model_copy(deep=True)
        self.config: SimulationConfig = self._initial_config.model_copy(deep=True)
        self.clock: SimulationClock = SimulationClock(0)
        self.status: SimulationStatus = SimulationStatus.STOPPED
        
        # In-memory process tables
        self.all_processes: List[SimulatedProcess] = []
        self.ready_queue: List[SimulatedProcess] = []
        self.blocked_queue: List[SimulatedProcess] = []
        self.running_process: Optional[SimulatedProcess] = None
        
        # Subsystems
        self.scheduler: BaseScheduler = create_scheduler(self.config.scheduler_algorithm, self.config)
        self.metrics_tracker: MetricsTracker = MetricsTracker(
            memory_capacity=self.config.memory_capacity,
            rolling_window_size=self.config.sustained_cpu_window
        )
        self.detector: AnomalyDetector = AnomalyDetector(self.config)
        self.recovery_engine: RecoveryPolicyEngine = RecoveryPolicyEngine(self.config)
        
        # Logs and Gantt chart
        self.gantt_log: List[GanttInterval] = []
        self.event_log: List[Dict[str, Any]] = []
        self._current_gantt_slice: Optional[GanttInterval] = None
        
        # Seed generator for reproducibility
        self.set_random_seed(self.config.random_seed)

    def set_random_seed(self, seed: int) -> None:
        self.config.random_seed = seed
        random.seed(seed)

    def reset(self, new_config: Optional[SimulationConfig] = None) -> None:
        """Completely resets simulation state with zero leaked references."""
        if new_config:
            self._initial_config = new_config.model_copy(deep=True)
            self.config = new_config
        else:
            self.config = self._initial_config.model_copy(deep=True)
        self.clock.reset(0)
        self.status = SimulationStatus.STOPPED
        self.all_processes.clear()
        self.ready_queue.clear()
        self.blocked_queue.clear()
        self.running_process = None
        
        self.scheduler = create_scheduler(self.config.scheduler_algorithm, self.config)
        self.metrics_tracker = MetricsTracker(
            memory_capacity=self.config.memory_capacity,
            rolling_window_size=self.config.sustained_cpu_window
        )
        self.detector = AnomalyDetector(self.config)
        self.recovery_engine = RecoveryPolicyEngine(self.config)
        
        self.gantt_log.clear()
        self.event_log.clear()
        self._current_gantt_slice = None
        self.set_random_seed(self.config.random_seed)

    def load_workload(self, processes: List[ProcessCreate]) -> None:
        """Loads a list of processes into the simulation."""
        self.reset()
        seen_pids = set()
        for p in processes:
            if p.pid in seen_pids:
                raise ValueError(f"Duplicate PID detected: {p.pid}")
            seen_pids.add(p.pid)
            sim_p = SimulatedProcess(p)
            self.all_processes.append(sim_p)

        self._record_event(
            timestamp=0,
            event_type="WORKLOAD_LOADED",
            description=f"Loaded workload with {len(processes)} processes",
            data={"process_count": len(processes)}
        )

    def step(self) -> SimulationSnapshot:
        """Advances the simulation by exactly 1 discrete clock tick."""
        current_tick = self.clock.current_time

        # 1. Check process arrivals at current_tick
        newly_arrived = [
            p for p in self.all_processes
            if p.state == ProcessState.NEW and p.arrival_time <= current_tick
        ]
        # Sort arrivals by arrival time, then PID for determinism
        newly_arrived.sort(key=lambda p: (p.arrival_time, p.pid))
        for p in newly_arrived:
            p.transition_to(ProcessState.READY, current_tick, reason=f"Arrived at tick {current_tick}")
            self.ready_queue.append(p)
            self._record_event(
                timestamp=current_tick,
                event_type="PROCESS_ARRIVED",
                description=f"Process {p.name} (PID: {p.pid}) arrived",
                data={"pid": p.pid, "burst": p.burst_time, "priority": p.effective_priority}
            )

        # 2. Advance processes in BLOCKED queue
        unblocked = []
        for p in list(self.blocked_queue):
            finished_io = p.tick_in_blocked(current_tick)
            if finished_io:
                self.blocked_queue.remove(p)
                self.ready_queue.append(p)
                unblocked.append(p)
                self._record_event(
                    timestamp=current_tick,
                    event_type="IO_COMPLETED",
                    description=f"Process {p.name} (PID: {p.pid}) unblocked from I/O",
                    data={"pid": p.pid}
                )

        # 3. Synchronize scheduler type with config if changed externally
        if (
            (isinstance(self.scheduler, RoundRobinScheduler) and self.config.scheduler_algorithm != SchedulerType.ROUND_ROBIN) or
            (isinstance(self.scheduler, AdaptiveScheduler) and self.config.scheduler_algorithm != SchedulerType.ADAPTIVE) or
            (not isinstance(self.scheduler, (RoundRobinScheduler, AdaptiveScheduler)) and self.scheduler.name.split()[0] != self.config.scheduler_algorithm.value)
        ):
            self.scheduler = create_scheduler(self.config.scheduler_algorithm, self.config)

        # 4. Scheduling selection
        next_process = self.scheduler.select_next(self.ready_queue, self.running_process, current_tick)

        # Handle preemption or context switch
        if self.running_process is not None and next_process != self.running_process:
            # Preempt current running process if still has remaining time
            if self.running_process.remaining_time > 0 and self.running_process.state == ProcessState.RUNNING:
                self.running_process.transition_to(
                    ProcessState.READY,
                    current_tick,
                    reason=f"Preempted in favor of PID {next_process.pid if next_process else 'IDLE'}"
                )
                self.ready_queue.append(self.running_process)
                if isinstance(self.scheduler, (RoundRobinScheduler, AdaptiveScheduler)):
                    self.scheduler.reset_quantum()
            self.running_process = None

        if next_process is not None:
            if next_process in self.ready_queue:
                self.ready_queue.remove(next_process)
            next_process.transition_to(ProcessState.RUNNING, current_tick, reason="Dispatched to CPU")
            self.running_process = next_process

        # 5. Execute 1 tick on CPU or log IDLE
        is_cpu_busy = False
        if self.running_process is not None:
            is_cpu_busy = True
            completed = self.running_process.execute_one_tick(current_tick + 1)
            self._record_gantt_tick(
                start_time=current_tick,
                end_time=current_tick + 1,
                pid=self.running_process.pid,
                process_name=self.running_process.name
            )
            if completed:
                self._record_event(
                    timestamp=current_tick + 1,
                    event_type="PROCESS_TERMINATED",
                    description=f"Process {self.running_process.name} (PID: {self.running_process.pid}) finished execution",
                    data={
                        "pid": self.running_process.pid,
                        "turnaround_time": self.running_process.turnaround_time,
                        "waiting_time": self.running_process.waiting_time,
                        "response_time": self.running_process.response_time
                    }
                )
                self.running_process = None
                if isinstance(self.scheduler, (RoundRobinScheduler, AdaptiveScheduler)):
                    self.scheduler.reset_quantum()
            elif self.running_process.state == ProcessState.BLOCKED:
                self.blocked_queue.append(self.running_process)
                self._record_event(
                    timestamp=current_tick + 1,
                    event_type="IO_STARTED",
                    description=f"Process {self.running_process.name} (PID: {self.running_process.pid}) initiated simulated I/O",
                    data={"pid": self.running_process.pid, "io_duration": self.running_process.io_duration}
                )
                self.running_process = None
                if isinstance(self.scheduler, (RoundRobinScheduler, AdaptiveScheduler)):
                    self.scheduler.reset_quantum()
            else:
                # Still running: check quantum expiration
                if isinstance(self.scheduler, RoundRobinScheduler):
                    if self.scheduler.current_slice_used + 1 >= self.config.time_quantum:
                        # Will be preempted next tick
                        pass
        else:
            self._record_gantt_tick(
                start_time=current_tick,
                end_time=current_tick + 1,
                pid=None,
                process_name="IDLE"
            )

        # 6. Advance ready queue waiting counters and apply scheduler on_tick (e.g. aging)
        for p in self.ready_queue:
            p.tick_in_ready_queue()
        self.scheduler.on_tick(self.ready_queue, self.running_process, current_tick)

        # 7. Record metrics for this tick
        active_memory = sum(
            p.memory for p in self.all_processes
            if p.state in {ProcessState.READY, ProcessState.RUNNING, ProcessState.BLOCKED}
        )
        self.metrics_tracker.record_tick(is_cpu_busy=is_cpu_busy, memory_used=active_memory)
        
        # Advance clock to next discrete time
        self.clock.tick(1)
        next_tick = self.clock.current_time

        # Compute updated metrics
        computed_metrics = self.metrics_tracker.compute_metrics(
            current_time=next_tick,
            all_processes=self.all_processes,
            ready_queue=self.ready_queue,
            blocked_queue=self.blocked_queue
        )

        # 8. Check for anomalies
        alerts = self.detector.check_anomalies(
            current_time=next_tick,
            metrics=computed_metrics,
            all_processes=self.all_processes,
            ready_queue=self.ready_queue,
            blocked_queue=self.blocked_queue,
            last_recovery_failed=self.recovery_engine.last_recovery_failed,
            failed_recovery_info=self.recovery_engine.failed_recovery_info
        )

        # 9. Trigger Explainable Recovery Engine if enabled
        if self.config.auto_recovery:
            decision = self.recovery_engine.evaluate_and_recover(
                current_time=next_tick,
                alerts=list(self.detector.active_alerts.values()),
                metrics=computed_metrics,
                all_processes=self.all_processes,
                ready_queue=self.ready_queue
            )
            if decision and decision.was_applied:
                self.metrics_tracker.record_recovery_action(overhead_ticks=1)
                self._record_event(
                    timestamp=next_tick,
                    event_type="RECOVERY_APPLIED",
                    description=f"Applied recovery action: {decision.chosen_action.action_type.value}",
                    data={"decision_id": decision.decision_id, "score": decision.chosen_action.score}
                )

        # 10. Advance pending recovery outcome evaluations
        self.recovery_engine.advance_and_evaluate_outcomes(
            current_time=next_tick,
            metrics=computed_metrics,
            all_processes=self.all_processes
        )

        # 11. Check termination condition
        all_completed = len(self.all_processes) > 0 and all(
            p.state == ProcessState.TERMINATED for p in self.all_processes
        )
        if all_completed and self.status == SimulationStatus.RUNNING:
            self.status = SimulationStatus.COMPLETED
            self._record_event(
                timestamp=next_tick,
                event_type="SIMULATION_COMPLETED",
                description="All processes in workload completed execution",
                data={"total_ticks": next_tick}
            )

        return self.get_snapshot()

    def _record_gantt_tick(self, start_time: int, end_time: int, pid: Optional[int], process_name: str) -> None:
        """Coalesces consecutive Gantt intervals for clean visualization."""
        if self._current_gantt_slice is not None:
            if self._current_gantt_slice.pid == pid and self._current_gantt_slice.end_time == start_time:
                # Extend current interval
                self._current_gantt_slice.end_time = end_time
                return
            else:
                self.gantt_log.append(self._current_gantt_slice)

        self._current_gantt_slice = GanttInterval(
            start_time=start_time,
            end_time=end_time,
            pid=pid,
            process_name=process_name
        )

    def _record_event(self, timestamp: int, event_type: str, description: str, data: Dict[str, Any]) -> None:
        self.event_log.append({
            "timestamp": timestamp,
            "type": event_type,
            "description": description,
            "data": data
        })

    def get_snapshot(self) -> SimulationSnapshot:
        """Returns authoritative snapshot of current simulation state."""
        current_gantt = list(self.gantt_log)
        if self._current_gantt_slice is not None:
            current_gantt.append(self._current_gantt_slice)

        metrics = self.metrics_tracker.compute_metrics(
            current_time=self.clock.current_time,
            all_processes=self.all_processes,
            ready_queue=self.ready_queue,
            blocked_queue=self.blocked_queue
        )

        active = [p.to_model() for p in self.all_processes if p.state in {ProcessState.READY, ProcessState.RUNNING, ProcessState.BLOCKED}]
        completed = [p.to_model() for p in self.all_processes if p.state == ProcessState.TERMINATED]

        return SimulationSnapshot(
            status=self.status,
            current_time=self.clock.current_time,
            config=self.config,
            running_process=self.running_process.to_model() if self.running_process else None,
            ready_queue=[p.to_model() for p in self.ready_queue],
            blocked_queue=[p.to_model() for p in self.blocked_queue],
            active_processes=active,
            completed_processes=completed,
            metrics=metrics,
            gantt_log=current_gantt,
            active_alerts=list(self.detector.active_alerts.values()),
            recent_recovery_decisions=list(self.recovery_engine.decisions_history[-20:]),
            recent_events=list(self.event_log[-50:])
        )
