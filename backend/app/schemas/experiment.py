from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from .process import ProcessCreate
from .metrics import SystemMetrics
from .simulation import SchedulerType


class WorkloadType(str, Enum):
    BALANCED = "BALANCED"
    CPU_HEAVY = "CPU_HEAVY"
    MEMORY_PRESSURE = "MEMORY_PRESSURE"
    STARVATION_RISK = "STARVATION_RISK"
    MIXED_ARRIVALS = "MIXED_ARRIVALS"
    NO_WORKLOAD_IDLE = "NO_WORKLOAD_IDLE"
    RECOVERY_REGRESSION = "RECOVERY_REGRESSION"
    CUSTOM = "CUSTOM"


class ExperimentScenario(BaseModel):
    id: str
    name: str
    workload_type: WorkloadType
    description: str
    processes: List[ProcessCreate]
    total_ticks: int = 100
    random_seed: int = 42


class PolicyRunResult(BaseModel):
    policy_name: str
    scheduler_type: SchedulerType
    auto_recovery: bool
    total_ticks_elapsed: int
    completed_processes: int
    total_processes: int
    throughput: float
    cpu_utilization: float
    memory_utilization: float
    avg_waiting_time: float
    avg_turnaround_time: float
    avg_response_time: float
    jains_fairness_index: float
    recovery_action_count: int
    recovery_overhead_ticks: int
    anomalies_detected: int
    anomalies_resolved: int


class BenchmarkComparison(BaseModel):
    scenario_id: str
    scenario_name: str
    workload_type: WorkloadType
    timestamp: str
    random_seed: int
    runs_count: int
    baseline_result: PolicyRunResult
    adaptive_result: PolicyRunResult
    
    # Differential analysis
    throughput_delta_pct: float
    waiting_time_delta_pct: float
    turnaround_delta_pct: float
    fairness_delta_pct: float
    memory_delta_pct: float = 0.0
    net_improvement: bool
    findings_summary: str
    limitations_notes: str


class ExperimentResult(BaseModel):
    id: str
    created_at: str
    comparisons: List[BenchmarkComparison] = Field(default_factory=list)
