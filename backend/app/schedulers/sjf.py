from typing import List, Optional
from .base import BaseScheduler
from ..simulation.process import SimulatedProcess


class SJFScheduler(BaseScheduler):
    """Shortest Job First (SJF) Non-Preemptive Scheduler."""

    @property
    def name(self) -> str:
        return "Shortest Job First (SJF Non-Preemptive)"

    def select_next(
        self,
        ready_queue: List[SimulatedProcess],
        running_process: Optional[SimulatedProcess],
        current_time: int
    ) -> Optional[SimulatedProcess]:
        # Non-preemptive: keep executing current process
        if running_process is not None and running_process.remaining_time > 0:
            return running_process

        if not ready_queue:
            return None

        # Select process with shortest remaining burst time. Tie-breaker: arrival time, then PID.
        return min(ready_queue, key=lambda p: (p.remaining_time, p.arrival_time, p.pid))
