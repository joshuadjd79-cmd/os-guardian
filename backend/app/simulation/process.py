from typing import List, Optional
from ..schemas.process import ProcessCreate, ProcessModel, ProcessState, StateTransitionRecord


class SimulatedProcess:
    """Encapsulates a single simulated process and enforces lifecycle state invariants."""

    VALID_TRANSITIONS = {
        ProcessState.NEW: {ProcessState.READY},
        ProcessState.READY: {ProcessState.RUNNING},
        ProcessState.RUNNING: {ProcessState.READY, ProcessState.BLOCKED, ProcessState.TERMINATED},
        ProcessState.BLOCKED: {ProcessState.READY},
        ProcessState.TERMINATED: set(),
    }

    def __init__(self, spec: ProcessCreate):
        if spec.burst_time <= 0:
            raise ValueError(f"Process burst time must be positive, got {spec.burst_time}")
        if spec.memory <= 0:
            raise ValueError(f"Process memory must be positive, got {spec.memory}")
        if spec.arrival_time < 0:
            raise ValueError(f"Process arrival time cannot be negative, got {spec.arrival_time}")

        self.pid: int = spec.pid
        self.name: str = spec.name
        self.arrival_time: int = spec.arrival_time
        self.burst_time: int = spec.burst_time
        self.remaining_time: int = spec.burst_time
        self.memory: int = spec.memory
        self.reclaimable_memory: int = spec.reclaimable_memory
        self.base_priority: int = spec.priority
        self.effective_priority: int = spec.priority
        
        self.state: ProcessState = ProcessState.NEW
        
        # Timing metrics
        self.start_time: Optional[int] = None
        self.finish_time: Optional[int] = None
        self.first_response_time: Optional[int] = None
        self.waiting_time: int = 0
        self.cpu_service_received: int = 0
        
        # I/O behavior
        self.io_frequency: int = spec.io_frequency
        self.io_duration: int = spec.io_duration
        self.current_io_remaining: int = 0
        self.ticks_since_last_io: int = 0
        
        # Scheduling & starvation tracking
        self.ticks_in_ready_queue: int = 0
        self.penalized_count: int = 0
        self.state_history: List[StateTransitionRecord] = []

    def transition_to(self, new_state: ProcessState, timestamp: int, reason: str = "") -> None:
        """Transitions process to new state enforcing valid state transitions."""
        if new_state != self.state:
            allowed = self.VALID_TRANSITIONS.get(self.state, set())
            if new_state not in allowed:
                raise ValueError(
                    f"Illegal process state transition for PID {self.pid} from {self.state.value} to {new_state.value}"
                )
            record = StateTransitionRecord(
                timestamp=timestamp,
                from_state=self.state,
                to_state=new_state,
                reason=reason
            )
            self.state_history.append(record)
            self.state = new_state

        if new_state == ProcessState.RUNNING:
            if self.first_response_time is None:
                self.first_response_time = timestamp
            if self.start_time is None:
                self.start_time = timestamp
            self.ticks_in_ready_queue = 0
        elif new_state == ProcessState.TERMINATED:
            self.finish_time = timestamp

    def execute_one_tick(self, timestamp: int) -> bool:
        """Executes 1 tick on CPU. Returns True if process completed."""
        if self.state != ProcessState.RUNNING:
            raise RuntimeError(f"Cannot execute process {self.pid} while in state {self.state}")
        if self.remaining_time <= 0:
            raise RuntimeError(f"Process {self.pid} remaining CPU work already exhausted")

        self.remaining_time -= 1
        self.cpu_service_received += 1
        self.ticks_since_last_io += 1

        if self.remaining_time == 0:
            self.transition_to(ProcessState.TERMINATED, timestamp, reason="CPU burst completed")
            return True

        # Check I/O trigger
        if self.io_frequency > 0 and self.ticks_since_last_io >= self.io_frequency:
            self.ticks_since_last_io = 0
            self.current_io_remaining = self.io_duration
            self.transition_to(ProcessState.BLOCKED, timestamp, reason="Triggered simulated I/O burst")
            return False

        return False

    def tick_in_ready_queue(self) -> None:
        """Increments waiting time while residing in READY queue."""
        if self.state == ProcessState.READY:
            self.waiting_time += 1
            self.ticks_in_ready_queue += 1

    def tick_in_blocked(self, timestamp: int) -> bool:
        """Advances I/O block duration. Returns True if I/O finished and moved to READY."""
        if self.state != ProcessState.BLOCKED:
            return False
        
        self.current_io_remaining -= 1
        if self.current_io_remaining <= 0:
            self.current_io_remaining = 0
            self.transition_to(ProcessState.READY, timestamp, reason="Simulated I/O completed")
            return True
        return False

    @property
    def turnaround_time(self) -> Optional[int]:
        if self.finish_time is not None:
            return self.finish_time - self.arrival_time
        return None

    @property
    def response_time(self) -> Optional[int]:
        if self.first_response_time is not None:
            return self.first_response_time - self.arrival_time
        return None

    def to_model(self) -> ProcessModel:
        return ProcessModel(
            pid=self.pid,
            name=self.name,
            arrival_time=self.arrival_time,
            burst_time=self.burst_time,
            remaining_time=self.remaining_time,
            memory=self.memory,
            reclaimable_memory=self.reclaimable_memory,
            base_priority=self.base_priority,
            effective_priority=self.effective_priority,
            state=self.state,
            first_response_time=self.first_response_time,
            start_time=self.start_time,
            finish_time=self.finish_time,
            waiting_time=self.waiting_time,
            turnaround_time=self.turnaround_time,
            response_time=self.response_time,
            cpu_service_received=self.cpu_service_received,
            io_frequency=self.io_frequency,
            io_duration=self.io_duration,
            current_io_remaining=self.current_io_remaining,
            ticks_since_last_io=self.ticks_since_last_io,
            ticks_in_ready_queue=self.ticks_in_ready_queue,
            penalized_count=self.penalized_count,
            state_history=list(self.state_history),
        )
