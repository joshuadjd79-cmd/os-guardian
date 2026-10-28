from typing import List, Optional
from .base import BaseScheduler
from ..simulation.process import SimulatedProcess


class FCFSScheduler(BaseScheduler):
    """First-Come, First-Served (FCFS) Non-Preemptive Scheduler."""

    @property
    def name(self) -> str:
        return "First-Come, First-Served (FCFS)"

    def select_next(
        self,
        ready_queue: List[SimulatedProcess],
        running_process: Optional[SimulatedProcess],
        current_time: int
    ) -> Optional[SimulatedProcess]:
        # Non-preemptive: keep running until completion or blocking
        if running_process is not None and running_process.remaining_time > 0:
            return running_process

        if not ready_queue:
            return None

        # Select process that arrived earliest. Tie breaker: lowest PID.
        return min(ready_queue, key=lambda p: (p.arrival_time, p.pid))
