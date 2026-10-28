from typing import List, Optional
from .base import BaseScheduler
from ..simulation.process import SimulatedProcess


class RoundRobinScheduler(BaseScheduler):
    """Round Robin (RR) Preemptive Scheduler with configurable quantum."""

    def __init__(self, config):
        super().__init__(config)
        self.current_slice_used: int = 0

    @property
    def name(self) -> str:
        return f"Round Robin (Quantum = {self.config.time_quantum})"

    def select_next(
        self,
        ready_queue: List[SimulatedProcess],
        running_process: Optional[SimulatedProcess],
        current_time: int
    ) -> Optional[SimulatedProcess]:
        # If a process is running and hasn't consumed its quantum and hasn't finished
        if running_process is not None and running_process.remaining_time > 0:
            if self.current_slice_used < self.config.time_quantum:
                return running_process
            else:
                # Quantum expired; will be preempted by engine
                pass

        if not ready_queue:
            if running_process is not None and running_process.remaining_time > 0:
                # Still can run if no other process is waiting
                return running_process
            return None

        # Take front of ready queue (FIFO queue order maintained by engine)
        return ready_queue[0]

    def on_tick(
        self,
        ready_queue: List[SimulatedProcess],
        running_process: Optional[SimulatedProcess],
        current_time: int
    ) -> None:
        if running_process is not None:
            self.current_slice_used += 1

    def reset_quantum(self) -> None:
        self.current_slice_used = 0
