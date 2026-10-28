from typing import Dict, List, Optional
from ..simulation.process import SimulatedProcess
from ..schemas.metrics import SystemMetrics, ProcessMetrics, JainFairnessDetails
from ..schemas.process import ProcessState


def calculate_jains_fairness(processes: List[SimulatedProcess]) -> JainFairnessDetails:
    """
    Computes Jain's Fairness Index:
    J = (sum(x_i)^2) / (N * sum(x_i^2))
    where x_i is normalized CPU service ratio: (service_received / burst_time).
    """
    if not processes:
        return JainFairnessDetails(index=1.0, population_size=0, allocations={})

    # Filter to processes that have arrived
    eligible = [p for p in processes if p.state != ProcessState.NEW]
    n = len(eligible)
    if n == 0:
        return JainFairnessDetails(index=1.0, population_size=0, allocations={})

    allocations: Dict[int, float] = {}
    sum_x = 0.0
    sum_x_squared = 0.0

    for p in eligible:
        # Normalized service ratio in [0, 1]
        x_i = p.cpu_service_received / max(1, p.burst_time)
        allocations[p.pid] = round(x_i, 4)
        sum_x += x_i
        sum_x_squared += (x_i * x_i)

    if sum_x_squared == 0.0:
        # All have received 0 service -> completely equal (all 0)
        return JainFairnessDetails(index=1.0, population_size=n, allocations=allocations)

    denominator = n * sum_x_squared
    index = (sum_x * sum_x) / denominator
    index = max(0.0, min(1.0, index))

    return JainFairnessDetails(
        index=round(index, 4),
        population_size=n,
        allocations=allocations
    )


class MetricsTracker:
    """Authoritative metrics calculator and history tracker."""

    def __init__(self, memory_capacity: int = 1024, rolling_window_size: int = 10):
        self.memory_capacity: int = memory_capacity
        self.rolling_window_size: int = rolling_window_size
        self.cpu_history: List[int] = []  # 1 for busy, 0 for idle
        self.memory_history: List[int] = []
        self.recovery_action_count: int = 0
        self.recovery_overhead_ticks: int = 0

    def record_tick(self, is_cpu_busy: bool, memory_used: int) -> None:
        self.cpu_history.append(1 if is_cpu_busy else 0)
        self.memory_history.append(memory_used)

    def record_recovery_action(self, overhead_ticks: int = 1) -> None:
        self.recovery_action_count += 1
        self.recovery_overhead_ticks += overhead_ticks

    def compute_metrics(
        self,
        current_time: int,
        all_processes: List[SimulatedProcess],
        ready_queue: List[SimulatedProcess],
        blocked_queue: List[SimulatedProcess]
    ) -> SystemMetrics:
        elapsed = current_time
        busy_ticks = sum(self.cpu_history)
        idle_ticks = elapsed - busy_ticks if elapsed >= busy_ticks else 0

        cpu_util = (busy_ticks / elapsed * 100.0) if elapsed > 0 else 0.0
        cpu_util = max(0.0, min(100.0, round(cpu_util, 2)))

        # Rolling window CPU util
        recent_window = self.cpu_history[-self.rolling_window_size:] if self.cpu_history else []
        window_cpu = (sum(recent_window) / len(recent_window) * 100.0) if recent_window else 0.0
        window_cpu = max(0.0, min(100.0, round(window_cpu, 2)))

        # Memory calculations
        active_processes = [p for p in all_processes if p.state in {ProcessState.READY, ProcessState.RUNNING, ProcessState.BLOCKED}]
        current_memory_used = sum(p.memory for p in active_processes)
        mem_util = (current_memory_used / self.memory_capacity * 100.0) if self.memory_capacity > 0 else 0.0
        mem_util = max(0.0, min(100.0, round(mem_util, 2)))

        recent_mem = self.memory_history[-self.rolling_window_size:] if self.memory_history else []
        window_mem = (sum(recent_mem) / len(recent_mem) / self.memory_capacity * 100.0) if (recent_mem and self.memory_capacity > 0) else 0.0
        window_mem = max(0.0, min(100.0, round(window_mem, 2)))

        # Completed processes metrics
        completed = [p for p in all_processes if p.state == ProcessState.TERMINATED]
        num_completed = len(completed)

        if num_completed > 0:
            avg_tat = sum(p.turnaround_time for p in completed if p.turnaround_time is not None) / num_completed
            avg_wt = sum(p.waiting_time for p in completed) / num_completed
            avg_rt = sum(p.response_time for p in completed if p.response_time is not None) / num_completed
        else:
            avg_tat = 0.0
            avg_wt = 0.0
            avg_rt = 0.0

        throughput = (num_completed / elapsed) if elapsed > 0 else 0.0

        jains = calculate_jains_fairness(all_processes)

        return SystemMetrics(
            simulation_time=current_time,
            elapsed_time=elapsed,
            cpu_busy_time=busy_ticks,
            cpu_idle_time=idle_ticks,
            cpu_utilization=cpu_util,
            memory_capacity=self.memory_capacity,
            memory_used=current_memory_used,
            memory_utilization=mem_util,
            ready_queue_length=len(ready_queue),
            blocked_queue_length=len(blocked_queue),
            active_process_count=len(active_processes),
            completed_process_count=num_completed,
            throughput=round(throughput, 4),
            avg_waiting_time=round(avg_wt, 2),
            avg_turnaround_time=round(avg_tat, 2),
            avg_response_time=round(avg_rt, 2),
            jains_fairness=jains,
            recovery_action_count=self.recovery_action_count,
            recovery_overhead_ticks=self.recovery_overhead_ticks,
            window_cpu_utilization=window_cpu,
            window_memory_utilization=window_mem
        )
