from .base import BaseScheduler
from .fcfs import FCFSScheduler
from .sjf import SJFScheduler
from .round_robin import RoundRobinScheduler
from .priority import PriorityScheduler
from .adaptive import AdaptiveScheduler
from ..schemas.simulation import SchedulerType, SimulationConfig


def create_scheduler(scheduler_type: SchedulerType, config: SimulationConfig) -> BaseScheduler:
    """Factory to instantiate schedulers based on configuration."""
    if scheduler_type == SchedulerType.FCFS:
        return FCFSScheduler(config)
    elif scheduler_type == SchedulerType.SJF:
        return SJFScheduler(config)
    elif scheduler_type == SchedulerType.ROUND_ROBIN:
        return RoundRobinScheduler(config)
    elif scheduler_type == SchedulerType.PRIORITY:
        return PriorityScheduler(config)
    elif scheduler_type == SchedulerType.ADAPTIVE:
        return AdaptiveScheduler(config)
    else:
        raise ValueError(f"Unknown scheduler type: {scheduler_type}")


__all__ = [
    "BaseScheduler",
    "FCFSScheduler",
    "SJFScheduler",
    "RoundRobinScheduler",
    "PriorityScheduler",
    "AdaptiveScheduler",
    "create_scheduler",
]
