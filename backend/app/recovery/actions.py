import copy
from typing import Any, Dict, List, Optional, Tuple
from ..simulation.process import SimulatedProcess
from ..schemas.simulation import SimulationConfig, SchedulerType
from ..schemas.recovery import RecoveryActionType


class ActionExecutionResult:
    def __init__(self, success: bool, message: str, pre_state_snapshot: Dict[str, Any]):
        self.success = success
        self.message = message
        self.pre_state_snapshot = pre_state_snapshot


class RecoveryActionHandler:
    """Safely applies and reverts recovery actions inside the simulator."""

    @staticmethod
    def apply_action(
        action_type: RecoveryActionType,
        target_pids: List[int],
        parameters: Dict[str, Any],
        all_processes: List[SimulatedProcess],
        ready_queue: List[SimulatedProcess],
        config: SimulationConfig,
        current_time: int
    ) -> ActionExecutionResult:
        snapshot: Dict[str, Any] = {
            "action_type": action_type.value,
            "target_pids": list(target_pids),
            "timestamp": current_time,
            "process_priorities": {p.pid: p.effective_priority for p in all_processes},
            "process_memories": {p.pid: p.memory for p in all_processes},
            "reclaimable_memories": {p.pid: p.reclaimable_memory for p in all_processes},
            "scheduler_algorithm": config.scheduler_algorithm.value,
            "time_quantum": config.time_quantum,
        }

        if action_type == RecoveryActionType.ADJUST_PRIORITY:
            # Boost priority of target_pids (e.g. starving processes)
            boost = parameters.get("boost_amount", 2)
            applied_pids = []
            for p in all_processes:
                if p.pid in target_pids:
                    # Remember: lower value = higher priority, bounded by min_priority_bound
                    old_p = p.effective_priority
                    p.effective_priority = max(config.min_priority_bound, p.effective_priority - boost)
                    applied_pids.append((p.pid, old_p, p.effective_priority))
            return ActionExecutionResult(
                success=True,
                message=f"Boosted priority for PID(s) {[p[0] for p in applied_pids]} (priorities adjusted: {applied_pids})",
                pre_state_snapshot=snapshot
            )

        elif action_type == RecoveryActionType.APPLY_AGING:
            # Immediate priority aging step for all processes waiting in ready queue
            aged_count = 0
            for p in ready_queue:
                if p.effective_priority > config.min_priority_bound:
                    p.effective_priority = max(config.min_priority_bound, p.effective_priority - config.aging_step)
                    aged_count += 1
            return ActionExecutionResult(
                success=True,
                message=f"Applied immediate aging step (-{config.aging_step}) across {aged_count} processes in READY queue",
                pre_state_snapshot=snapshot
            )

        elif action_type == RecoveryActionType.SWITCH_SCHEDULER:
            new_scheduler = parameters.get("target_scheduler", SchedulerType.ROUND_ROBIN.value)
            config.scheduler_algorithm = SchedulerType(new_scheduler)
            return ActionExecutionResult(
                success=True,
                message=f"Switched active scheduler algorithm to {config.scheduler_algorithm.value}",
                pre_state_snapshot=snapshot
            )

        elif action_type == RecoveryActionType.ADJUST_TIME_QUANTUM:
            new_quantum = parameters.get("new_quantum", 2)
            new_quantum = max(1, min(20, int(new_quantum)))
            old_q = config.time_quantum
            config.time_quantum = new_quantum
            return ActionExecutionResult(
                success=True,
                message=f"Adjusted Round Robin time quantum from {old_q} to {new_quantum} ticks",
                pre_state_snapshot=snapshot
            )

        elif action_type == RecoveryActionType.RECLAIM_MEMORY:
            # Reclaim explicitly reclaimable memory (caches, buffers) without killing processes
            reclaimed_total = 0
            for p in all_processes:
                if p.reclaimable_memory > 0:
                    amount = min(p.reclaimable_memory, parameters.get("target_reclaim_mb", p.reclaimable_memory))
                    p.reclaimable_memory -= amount
                    p.memory = max(1, p.memory - amount)
                    reclaimed_total += amount
            return ActionExecutionResult(
                success=reclaimed_total > 0,
                message=f"Reclaimed {reclaimed_total} MB of non-essential simulated memory across active processes",
                pre_state_snapshot=snapshot
            )

        elif action_type == RecoveryActionType.THROTTLE_ADMISSION:
            # Delay newly arriving processes by staggering their arrival times
            delay_ticks = parameters.get("delay_ticks", 5)
            delayed_count = 0
            for p in all_processes:
                if p.arrival_time > current_time:
                    p.arrival_time += delay_ticks
                    delayed_count += 1
            return ActionExecutionResult(
                success=True,
                message=f"Throttled admission rate: staggered {delayed_count} pending process arrivals by +{delay_ticks} ticks",
                pre_state_snapshot=snapshot
            )

        elif action_type == RecoveryActionType.NO_INTERVENTION:
            return ActionExecutionResult(
                success=True,
                message="No intervention applied: expected cost/risk exceeded potential benefits.",
                pre_state_snapshot=snapshot
            )

        return ActionExecutionResult(
            success=False,
            message=f"Unknown recovery action type: {action_type}",
            pre_state_snapshot=snapshot
        )

    @staticmethod
    def revert_action(
        snapshot: Dict[str, Any],
        all_processes: List[SimulatedProcess],
        config: SimulationConfig
    ) -> bool:
        """Restores state from pre-action snapshot if action produced a regression."""
        try:
            priorities = snapshot.get("process_priorities", {})
            for p in all_processes:
                if p.pid in priorities:
                    p.effective_priority = priorities[p.pid]

            memories = snapshot.get("process_memories", {})
            reclaimables = snapshot.get("reclaimable_memories", {})
            for p in all_processes:
                if p.pid in memories:
                    p.memory = memories[p.pid]
                if p.pid in reclaimables:
                    p.reclaimable_memory = reclaimables[p.pid]

            if "scheduler_algorithm" in snapshot:
                config.scheduler_algorithm = SchedulerType(snapshot["scheduler_algorithm"])
            if "time_quantum" in snapshot:
                config.time_quantum = snapshot["time_quantum"]

            return True
        except Exception:
            return False
