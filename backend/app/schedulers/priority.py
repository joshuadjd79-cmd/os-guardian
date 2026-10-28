from typing import List, Optional
from .base import BaseScheduler
from ..simulation.process import SimulatedProcess


class PriorityScheduler(BaseScheduler):
    """
    Preemptive Priority Scheduler with Starvation Prevention (Aging).
    Convention: Lower numerical value = Higher logical priority (1 is highest).
    """

    @property
    def name(self) -> str:
        aging_status = f"with Aging (threshold={self.config.aging_threshold})" if self.config.enable_aging else "without Aging"
        return f"Priority Scheduler ({aging_status})"

    def select_next(
        self,
        ready_queue: List[SimulatedProcess],
        running_process: Optional[SimulatedProcess],
        current_time: int
    ) -> Optional[SimulatedProcess]:
        if not ready_queue and running_process is None:
            return None

        # Build candidate pool: currently running process + ready queue
        candidates = list(ready_queue)
        if running_process is not None and running_process.remaining_time > 0:
            candidates.append(running_process)

        if not candidates:
            return None

        # Sort by effective priority (ascending: 1 is top), then arrival time, then PID
        best_process = min(
            candidates,
            key=lambda p: (p.effective_priority, p.arrival_time, p.pid)
        )
        return best_process

    def on_tick(
        self,
        ready_queue: List[SimulatedProcess],
        running_process: Optional[SimulatedProcess],
        current_time: int
    ) -> None:
        """Applies priority aging to all processes waiting in ready queue."""
        if not self.config.enable_aging:
            return

        for p in ready_queue:
            # Check if process has waited long enough to earn priority boost
            if p.ticks_in_ready_queue > 0 and (p.ticks_in_ready_queue % self.config.aging_threshold == 0):
                if p.effective_priority > self.config.min_priority_bound:
                    p.effective_priority = max(
                        self.config.min_priority_bound,
                        p.effective_priority - self.config.aging_step
                    )
