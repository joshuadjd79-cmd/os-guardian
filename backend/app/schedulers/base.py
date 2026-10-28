from abc import ABC, abstractmethod
from typing import List, Optional
from ..simulation.process import SimulatedProcess
from ..schemas.simulation import SimulationConfig


class BaseScheduler(ABC):
    """Abstract base class for all simulated scheduling algorithms."""

    def __init__(self, config: SimulationConfig):
        self.config: SimulationConfig = config

    @property
    @abstractmethod
    def name(self) -> str:
        """Human-readable scheduler name."""
        pass

    @abstractmethod
    def select_next(
        self,
        ready_queue: List[SimulatedProcess],
        running_process: Optional[SimulatedProcess],
        current_time: int
    ) -> Optional[SimulatedProcess]:
        """
        Selects the next process to run from the ready queue or keeps current process.
        Returns the process to run, or None if ready queue is empty and no process is running.
        """
        pass

    def on_tick(
        self,
        ready_queue: List[SimulatedProcess],
        running_process: Optional[SimulatedProcess],
        current_time: int
    ) -> None:
        """Called every simulation tick for internal accounting (e.g. aging)."""
        pass

    def on_quantum_expired(self, process: SimulatedProcess) -> None:
        """Hook when time quantum expires."""
        pass
