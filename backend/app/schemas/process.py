from enum import Enum
from typing import List, Optional, Tuple
from pydantic import BaseModel, Field, field_validator


class ProcessState(str, Enum):
    NEW = "NEW"
    READY = "READY"
    RUNNING = "RUNNING"
    BLOCKED = "BLOCKED"
    TERMINATED = "TERMINATED"


class StateTransitionRecord(BaseModel):
    timestamp: int
    from_state: ProcessState
    to_state: ProcessState
    reason: str


class ProcessCreate(BaseModel):
    pid: int = Field(..., ge=1, le=100000, description="Unique Process ID")
    name: str = Field(..., min_length=1, max_length=64, description="Process Name")
    arrival_time: int = Field(0, ge=0, le=100000, description="Arrival Time (ticks)")
    burst_time: int = Field(..., ge=1, le=10000, description="Total CPU burst required (ticks)")
    memory: int = Field(..., ge=1, le=65536, description="Simulated memory allocation (MB)")
    priority: int = Field(10, ge=1, le=100, description="Base Priority (lower number = higher priority)")
    io_frequency: int = Field(0, ge=0, le=10000, description="Ticks of CPU work before I/O block (0 = CPU bound, no I/O)")
    io_duration: int = Field(0, ge=0, le=10000, description="Duration in BLOCKED state during I/O (ticks)")
    reclaimable_memory: int = Field(0, ge=0, le=65536, description="Amount of memory eligible for non-destructive reclamation (MB)")

    @field_validator("reclaimable_memory")
    @classmethod
    def check_reclaimable_within_memory(cls, v: int, info) -> int:
        mem = info.data.get("memory") if info.data else None
        if mem is not None and v > mem:
            raise ValueError(f"Reclaimable memory ({v} MB) cannot exceed total allocated memory ({mem} MB)")
        return v


class ProcessModel(BaseModel):
    pid: int
    name: str
    arrival_time: int
    burst_time: int
    remaining_time: int
    memory: int
    reclaimable_memory: int = 0
    base_priority: int
    effective_priority: int
    state: ProcessState = ProcessState.NEW
    
    # Timing and accounting
    first_response_time: Optional[int] = None
    start_time: Optional[int] = None
    finish_time: Optional[int] = None
    
    waiting_time: int = 0
    turnaround_time: Optional[int] = None
    response_time: Optional[int] = None
    cpu_service_received: int = 0
    
    # I/O simulation attributes
    io_frequency: int = 0
    io_duration: int = 0
    current_io_remaining: int = 0
    ticks_since_last_io: int = 0
    
    # Starvation and aging tracking
    ticks_in_ready_queue: int = 0
    penalized_count: int = 0
    
    # Audit trail
    state_history: List[StateTransitionRecord] = []

    @field_validator("remaining_time")
    @classmethod
    def check_non_negative_remaining(cls, v: int) -> int:
        if v < 0:
            raise ValueError("Remaining CPU work cannot be negative")
        return v
