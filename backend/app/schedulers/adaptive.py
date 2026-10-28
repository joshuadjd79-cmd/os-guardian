from typing import List, Optional
from .base import BaseScheduler
from ..simulation.process import SimulatedProcess


class AdaptiveScheduler(BaseScheduler):
    """
    Adaptive Recovery-Aware Scheduler.
    Dynamically balances responsiveness, throughput, and fairness based on system load,
    starvation risks, and recovery suggestions.
    """

    def __init__(self, config):
        super().__init__(config)
        self.current_slice_used: int = 0
        self.dynamic_quantum: int = config.time_quantum

    @property
    def name(self) -> str:
        return f"Adaptive Recovery-Aware (Dynamic Quantum={self.dynamic_quantum})"

    def update_dynamic_parameters(self, ready_count: int, cpu_util: float) -> None:
        """Adapts quantum size based on ready queue pressure and CPU load."""
        if ready_count > 6 or cpu_util > 90.0:
            # Under heavy contention, use smaller quantum to preserve responsiveness
            self.dynamic_quantum = max(2, self.config.time_quantum - 1)
        elif ready_count <= 2:
            # Light load: use slightly larger quantum to minimize context-switching overhead
            self.dynamic_quantum = self.config.time_quantum + 1
        else:
            self.dynamic_quantum = self.config.time_quantum

    def select_next(
        self,
        ready_queue: List[SimulatedProcess],
        running_process: Optional[SimulatedProcess],
        current_time: int
    ) -> Optional[SimulatedProcess]:
        self.update_dynamic_parameters(len(ready_queue), 50.0)

        # Check if running process still has slice
        if running_process is not None and running_process.remaining_time > 0:
            if self.current_slice_used < self.dynamic_quantum:
                # Check for critical starvation preemption
                starving_candidates = [
                    p for p in ready_queue
                    if p.ticks_in_ready_queue >= self.config.starvation_threshold
                ]
                if not starving_candidates:
                    return running_process

        if not ready_queue:
            if running_process is not None and running_process.remaining_time > 0:
                return running_process
            return None

        # Check for starving processes first (urgent fairness relief)
        starving = [p for p in ready_queue if p.ticks_in_ready_queue >= self.config.starvation_threshold]
        if starving:
            # Pick the most starved process
            return max(starving, key=lambda p: (p.ticks_in_ready_queue, -p.effective_priority))

        # Otherwise evaluate hybrid heuristic: effective priority + shortest remaining work
        def adaptive_score(p: SimulatedProcess) -> float:
            # Lower score = higher selection priority
            # Balances priority, remaining burst, and wait time credit
            wait_relief = p.ticks_in_ready_queue * 0.5
            return p.effective_priority * 2.0 + p.remaining_time - wait_relief

        return min(ready_queue, key=adaptive_score)

    def on_tick(
        self,
        ready_queue: List[SimulatedProcess],
        running_process: Optional[SimulatedProcess],
        current_time: int
    ) -> None:
        if running_process is not None:
            self.current_slice_used += 1

        # Accelerated aging for starving processes
        for p in ready_queue:
            if p.ticks_in_ready_queue > 0 and (p.ticks_in_ready_queue % max(2, self.config.aging_threshold // 2) == 0):
                if p.effective_priority > self.config.min_priority_bound:
                    p.effective_priority = max(self.config.min_priority_bound, p.effective_priority - self.config.aging_step)

    def reset_quantum(self) -> None:
        self.current_slice_used = 0
