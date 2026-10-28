import pytest
from backend.app.schemas.process import ProcessCreate, ProcessState
from backend.app.schemas.simulation import SimulationConfig, SchedulerType, SimulationStatus
from backend.app.simulation.engine import SimulationEngine


def test_simultaneous_arrivals_and_gantt():
    config = SimulationConfig(scheduler_algorithm=SchedulerType.FCFS)
    engine = SimulationEngine(config)

    # 3 processes arrive at same tick 0
    workload = [
        ProcessCreate(pid=1, name="P1", arrival_time=0, burst_time=2, memory=10, priority=5),
        ProcessCreate(pid=2, name="P2", arrival_time=0, burst_time=2, memory=10, priority=5),
        ProcessCreate(pid=3, name="P3", arrival_time=0, burst_time=2, memory=10, priority=5),
    ]
    engine.load_workload(workload)
    engine.status = SimulationStatus.RUNNING

    for _ in range(6):
        engine.step()

    snapshot = engine.get_snapshot()
    assert snapshot.status == SimulationStatus.COMPLETED
    assert snapshot.metrics.completed_process_count == 3
    assert snapshot.metrics.cpu_busy_time == 6
    assert snapshot.metrics.cpu_idle_time == 0


def test_idle_period_between_processes():
    config = SimulationConfig(scheduler_algorithm=SchedulerType.FCFS)
    engine = SimulationEngine(config)

    # P1 arrives at 0, bursts for 2 -> finishes at 2
    # P2 arrives at 5, bursts for 2 -> runs 5 to 7
    # CPU should be IDLE between ticks 2 and 5 (3 ticks of idle)
    workload = [
        ProcessCreate(pid=1, name="P1", arrival_time=0, burst_time=2, memory=10, priority=5),
        ProcessCreate(pid=2, name="P2", arrival_time=5, burst_time=2, memory=10, priority=5),
    ]
    engine.load_workload(workload)
    engine.status = SimulationStatus.RUNNING

    for _ in range(7):
        engine.step()

    snapshot = engine.get_snapshot()
    assert snapshot.status == SimulationStatus.COMPLETED
    assert snapshot.metrics.cpu_busy_time == 4
    assert snapshot.metrics.cpu_idle_time == 3
    # Check that Gantt log contains an IDLE interval
    idle_intervals = [g for g in snapshot.gantt_log if g.pid is None or g.process_name == "IDLE"]
    assert len(idle_intervals) > 0
    assert any(g.start_time == 2 and g.end_time == 5 for g in idle_intervals)


def test_duplicate_pid_rejection():
    engine = SimulationEngine()
    workload = [
        ProcessCreate(pid=1, name="P1", arrival_time=0, burst_time=2, memory=10, priority=5),
        ProcessCreate(pid=1, name="P1_Duplicate", arrival_time=1, burst_time=2, memory=10, priority=5),
    ]
    with pytest.raises(ValueError, match="Duplicate PID"):
        engine.load_workload(workload)


def test_reset_and_repeatability():
    config = SimulationConfig(scheduler_algorithm=SchedulerType.ROUND_ROBIN, time_quantum=2, random_seed=999)
    engine = SimulationEngine(config)

    workload = [
        ProcessCreate(pid=1, name="P1", arrival_time=0, burst_time=5, memory=50, priority=3),
        ProcessCreate(pid=2, name="P2", arrival_time=1, burst_time=4, memory=50, priority=2),
    ]

    # Run 1
    engine.load_workload(workload)
    engine.status = SimulationStatus.RUNNING
    for _ in range(9):
        engine.step()
    snap1 = engine.get_snapshot()

    # Reset and Run 2
    engine.reset()
    engine.load_workload(workload)
    engine.status = SimulationStatus.RUNNING
    for _ in range(9):
        engine.step()
    snap2 = engine.get_snapshot()

    assert snap1.metrics.avg_waiting_time == snap2.metrics.avg_waiting_time
    assert snap1.metrics.avg_turnaround_time == snap2.metrics.avg_turnaround_time
    assert snap1.metrics.throughput == snap2.metrics.throughput
    assert len(snap1.gantt_log) == len(snap2.gantt_log)
