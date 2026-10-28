import pytest
from backend.app.schemas.process import ProcessCreate, ProcessState
from backend.app.schemas.simulation import SimulationConfig, SchedulerType
from backend.app.simulation.process import SimulatedProcess
from backend.app.schedulers import (
    FCFSScheduler,
    SJFScheduler,
    RoundRobinScheduler,
    PriorityScheduler,
    create_scheduler
)


def test_fcfs_order():
    config = SimulationConfig(scheduler_algorithm=SchedulerType.FCFS)
    scheduler = FCFSScheduler(config)

    p1 = SimulatedProcess(ProcessCreate(pid=1, name="P1", arrival_time=5, burst_time=4, memory=10, priority=5))
    p2 = SimulatedProcess(ProcessCreate(pid=2, name="P2", arrival_time=2, burst_time=10, memory=10, priority=5))
    p3 = SimulatedProcess(ProcessCreate(pid=3, name="P3", arrival_time=2, burst_time=2, memory=10, priority=5))

    ready_queue = [p1, p2, p3]
    # P2 and P3 arrived at 2. Tie breaker: PID 2 comes before PID 3
    selected = scheduler.select_next(ready_queue, None, 5)
    assert selected.pid == 2


def test_sjf_non_preemptive_order():
    config = SimulationConfig(scheduler_algorithm=SchedulerType.SJF)
    scheduler = SJFScheduler(config)

    p1 = SimulatedProcess(ProcessCreate(pid=1, name="P1", arrival_time=0, burst_time=10, memory=10, priority=5))
    p2 = SimulatedProcess(ProcessCreate(pid=2, name="P2", arrival_time=0, burst_time=3, memory=10, priority=5))
    p3 = SimulatedProcess(ProcessCreate(pid=3, name="P3", arrival_time=0, burst_time=6, memory=10, priority=5))

    ready_queue = [p1, p2, p3]
    # P2 has shortest burst (3)
    selected = scheduler.select_next(ready_queue, None, 0)
    assert selected.pid == 2


def test_round_robin_quantum_preemption():
    config = SimulationConfig(scheduler_algorithm=SchedulerType.ROUND_ROBIN, time_quantum=2)
    scheduler = RoundRobinScheduler(config)

    p1 = SimulatedProcess(ProcessCreate(pid=1, name="P1", arrival_time=0, burst_time=6, memory=10, priority=5))
    p2 = SimulatedProcess(ProcessCreate(pid=2, name="P2", arrival_time=0, burst_time=6, memory=10, priority=5))
    ready_queue = [p2]

    # Tick 1: P1 runs
    scheduler.on_tick(ready_queue, p1, 0)
    assert scheduler.current_slice_used == 1
    # Still P1
    assert scheduler.select_next(ready_queue, p1, 1).pid == 1

    # Tick 2: P1 runs
    scheduler.on_tick(ready_queue, p1, 1)
    assert scheduler.current_slice_used == 2
    # Quantum expired (>= 2): should switch to head of ready queue (P2)
    assert scheduler.select_next(ready_queue, p1, 2).pid == 2


def test_priority_with_aging():
    config = SimulationConfig(
        scheduler_algorithm=SchedulerType.PRIORITY,
        enable_aging=True,
        aging_threshold=3,
        aging_step=1,
        min_priority_bound=1
    )
    scheduler = PriorityScheduler(config)

    # P1 has high priority (2), P2 has low priority (5)
    p1 = SimulatedProcess(ProcessCreate(pid=1, name="P1", arrival_time=0, burst_time=10, memory=10, priority=2))
    p2 = SimulatedProcess(ProcessCreate(pid=2, name="P2", arrival_time=0, burst_time=5, memory=10, priority=5))

    p2.state = ProcessState.READY
    ready_queue = [p2]

    # After 3 ticks in ready queue, P2's priority should age from 5 to 4
    for _ in range(3):
        p2.tick_in_ready_queue()
    scheduler.on_tick(ready_queue, p1, 3)
    assert p2.effective_priority == 4

    # After 6 ticks, P2's priority should age to 3
    for _ in range(3):
        p2.tick_in_ready_queue()
    scheduler.on_tick(ready_queue, p1, 6)
    assert p2.effective_priority == 3
