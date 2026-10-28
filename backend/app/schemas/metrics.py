from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class JainFairnessDetails(BaseModel):
    index: float = Field(1.0, ge=0.0, le=1.0, description="Jain's Fairness Index between 0 and 1")
    population_size: int = 0
    definition: str = "J = (sum(x_i)^2) / (N * sum(x_i^2)) using normalized CPU service received"
    allocations: Dict[int, float] = {}


class ProcessMetrics(BaseModel):
    pid: int
    name: str
    arrival_time: int
    burst_time: int
    cpu_service_received: int
    waiting_time: int
    turnaround_time: Optional[int] = None
    response_time: Optional[int] = None
    memory_used: int
    reclaimable_memory: int = 0
    normalized_service: float = 0.0


class SystemMetrics(BaseModel):
    simulation_time: int = 0
    elapsed_time: int = 0
    cpu_busy_time: int = 0
    cpu_idle_time: int = 0
    cpu_utilization: float = Field(0.0, ge=0.0, le=100.0, description="CPU Utilization %")
    
    memory_capacity: int = 1024
    memory_used: int = 0
    memory_utilization: float = Field(0.0, ge=0.0, le=100.0, description="Memory Utilization %")
    
    ready_queue_length: int = 0
    blocked_queue_length: int = 0
    active_process_count: int = 0
    completed_process_count: int = 0
    
    throughput: float = 0.0  # completed processes / elapsed time
    avg_waiting_time: float = 0.0
    avg_turnaround_time: float = 0.0
    avg_response_time: float = 0.0
    
    jains_fairness: JainFairnessDetails = Field(default_factory=JainFairnessDetails)
    
    recovery_action_count: int = 0
    recovery_overhead_ticks: int = 0
    
    # Rolling averages over recent window (e.g. 10 ticks)
    window_cpu_utilization: float = 0.0
    window_memory_utilization: float = 0.0
