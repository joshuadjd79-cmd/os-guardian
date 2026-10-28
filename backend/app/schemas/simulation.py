from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, field_validator, model_validator
from .process import ProcessModel
from .metrics import SystemMetrics
from .anomaly import AnomalyAlert
from .recovery import RecoveryDecisionRecord


class SimulationStatus(str, Enum):
    STOPPED = "STOPPED"
    RUNNING = "RUNNING"
    PAUSED = "PAUSED"
    COMPLETED = "COMPLETED"


class SchedulerType(str, Enum):
    FCFS = "FCFS"
    SJF = "SJF"
    ROUND_ROBIN = "ROUND_ROBIN"
    PRIORITY = "PRIORITY"
    ADAPTIVE = "ADAPTIVE"


class SimulationConfig(BaseModel):
    scheduler_algorithm: SchedulerType = SchedulerType.ROUND_ROBIN
    time_quantum: int = Field(3, ge=1, le=50, description="Round Robin time quantum (ticks)")
    memory_capacity: int = Field(1024, ge=64, le=16384, description="Simulated memory capacity in MB")
    context_switch_overhead: int = Field(0, ge=0, le=5, description="Context switch cost in ticks")
    
    # Priority Aging settings
    enable_aging: bool = True
    aging_threshold: int = Field(8, ge=1, le=100, description="Wait ticks before priority improves")
    aging_step: int = Field(1, ge=1, le=10, description="Priority points improved per aging cycle")
    min_priority_bound: int = Field(1, ge=1, description="Highest allowed priority value (1 is top priority)")
    max_priority_bound: int = Field(100, le=100, description="Lowest allowed priority value")
    
    # Recovery Mode
    auto_recovery: bool = True
    manual_approval_required: bool = False
    random_seed: int = 42
    speed_ms: int = Field(250, ge=50, le=2000, description="Playback tick interval in ms")
    
    # Anomaly Detection Thresholds
    sustained_cpu_threshold: float = Field(85.0, ge=10.0, le=100.0)
    sustained_cpu_window: int = Field(5, ge=2, le=50)
    memory_pressure_threshold: float = Field(80.0, ge=10.0, le=100.0)
    excessive_wait_threshold: int = Field(20, ge=5, le=200)
    unresponsive_threshold: int = Field(12, ge=3, le=100)
    starvation_threshold: int = Field(25, ge=5, le=200)
    cooldown_period: int = Field(8, ge=1, le=50)
    
    # Recovery Scoring Weights (w1..w6)
    w_responsiveness: float = Field(0.30, ge=0.0, le=1.0)
    w_resource_relief: float = Field(0.25, ge=0.0, le=1.0)
    w_fairness: float = Field(0.20, ge=0.0, le=1.0)
    w_cost: float = Field(0.10, ge=0.0, le=1.0)
    w_fairness_harm: float = Field(0.05, ge=0.0, le=1.0)
    w_risk: float = Field(0.10, ge=0.0, le=1.0)
    min_utility_threshold: float = Field(0.12, ge=0.0, le=1.0)

    @field_validator("time_quantum")
    @classmethod
    def validate_quantum(cls, v: int) -> int:
        if v < 1:
            raise ValueError("Time quantum must be >= 1")
        return v

    @model_validator(mode="after")
    def validate_bounds_and_weights(self) -> "SimulationConfig":
        if self.min_priority_bound > self.max_priority_bound:
            raise ValueError(
                f"min_priority_bound ({self.min_priority_bound}) cannot exceed max_priority_bound ({self.max_priority_bound})"
            )
        total_weight = (
            self.w_responsiveness
            + self.w_resource_relief
            + self.w_fairness
            + self.w_cost
            + self.w_fairness_harm
            + self.w_risk
        )
        if total_weight <= 0:
            raise ValueError("Total sum of recovery scoring weights must be positive")
        return self


class GanttInterval(BaseModel):
    start_time: int
    end_time: int
    pid: Optional[int] = None  # None indicates IDLE
    process_name: Optional[str] = "IDLE"
    is_recovery_overhead: bool = False


class SimulationSnapshot(BaseModel):
    status: SimulationStatus
    current_time: int
    config: SimulationConfig
    running_process: Optional[ProcessModel] = None
    ready_queue: List[ProcessModel] = Field(default_factory=list)
    blocked_queue: List[ProcessModel] = Field(default_factory=list)
    active_processes: List[ProcessModel] = Field(default_factory=list)
    completed_processes: List[ProcessModel] = Field(default_factory=list)
    metrics: SystemMetrics
    gantt_log: List[GanttInterval] = Field(default_factory=list)
    active_alerts: List[AnomalyAlert] = Field(default_factory=list)
    recent_recovery_decisions: List[RecoveryDecisionRecord] = Field(default_factory=list)
    recent_events: List[Dict[str, Any]] = Field(default_factory=list)
