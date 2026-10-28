import pytest
from backend.app.schemas.process import ProcessCreate
from backend.app.schemas.simulation import SimulationConfig
from backend.app.simulation.process import SimulatedProcess
from backend.app.monitoring.metrics import calculate_jains_fairness, MetricsTracker
from backend.app.experiments.runner import BenchmarkRunner


def test_turnaround_waiting_response_time_hand_calculated():
    """
    Hand-calculated example:
    Process 1: Arrival = 0, Burst = 5
      Starts at tick 0 -> First Response Time = 0 - 0 = 0
      Executes until tick 5 -> Finish Time = 5
      TAT = 5 - 0 = 5
      WT = TAT - Burst = 5 - 5 = 0
      RT = First Response - Arrival = 0 - 0 = 0

    Process 2: Arrival = 2, Burst = 4
      Starts at tick 5 -> First Response Time = 5 - 2 = 3
      Executes until tick 9 -> Finish Time = 9
      TAT = 9 - 2 = 7
      WT = TAT - Burst = 7 - 4 = 3
      RT = 5 - 2 = 3

    Average TAT = (5 + 7) / 2 = 6.0
    Average WT = (0 + 3) / 2 = 1.5
    Average RT = (0 + 3) / 2 = 1.5
    Throughput at tick 9 = 2 / 9 = 0.2222
    """
    p1 = SimulatedProcess(ProcessCreate(pid=1, name="P1", arrival_time=0, burst_time=5, memory=100, priority=5))
    p2 = SimulatedProcess(ProcessCreate(pid=2, name="P2", arrival_time=2, burst_time=4, memory=100, priority=5))

    # Simulate P1 running 0 -> 5
    p1.transition_to(p1.VALID_TRANSITIONS[p1.state].copy().pop(), 0, "arrived")
    p1.transition_to(p1.VALID_TRANSITIONS[p1.state].copy().pop(), 0, "dispatched")
    for t in range(5):
        p1.execute_one_tick(t + 1)

    assert p1.finish_time == 5
    assert p1.turnaround_time == 5
    assert p1.waiting_time == 0
    assert p1.response_time == 0

    # Simulate P2 waiting from tick 2 to 5, then running 5 -> 9
    p2.transition_to(p2.VALID_TRANSITIONS[p2.state].copy().pop(), 2, "arrived")
    for _ in range(3):
        p2.tick_in_ready_queue()
    p2.transition_to(p2.VALID_TRANSITIONS[p2.state].copy().pop(), 5, "dispatched")
    for t in range(5, 9):
        p2.execute_one_tick(t + 1)

    assert p2.finish_time == 9
    assert p2.turnaround_time == 7
    assert p2.waiting_time == 3
    assert p2.response_time == 3

    tracker = MetricsTracker(memory_capacity=1024)
    for _ in range(9):
        tracker.record_tick(is_cpu_busy=True, memory_used=100)

    metrics = tracker.compute_metrics(
        current_time=9,
        all_processes=[p1, p2],
        ready_queue=[],
        blocked_queue=[]
    )

    assert metrics.avg_turnaround_time == 6.0
    assert metrics.avg_waiting_time == 1.5
    assert metrics.avg_response_time == 1.5
    assert metrics.throughput == round(2 / 9, 4)
    assert metrics.cpu_utilization == 100.0


def test_hand_calculated_io_workload_waiting_time():
    """
    Independent hand-calculated proof verifying that I/O blocking time
    is NOT counted as waiting time in the ready queue.
    
    Process spec: Arrival = 0, Burst = 4, IO_freq = 2, IO_duration = 3
    - Tick 0: arrives -> READY -> dispatched to RUNNING
    - Ticks 0..2: executes 2 CPU ticks -> remaining = 2
    - Tick 2: triggers simulated I/O -> transitions to BLOCKED for 3 ticks (ticks 2, 3, 4)
    - Tick 5: I/O completes -> transitions to READY
    - Ticks 5..7: waits in READY queue for 2 ticks (another process on CPU)
    - Tick 7: dispatched to RUNNING -> executes remaining 2 ticks (ticks 7..9)
    - Tick 9: completes!
    
    Turnaround Time = 9 - 0 = 9 ticks.
    CPU Service = 4 ticks.
    I/O Block Duration = 3 ticks.
    Actual Ready Queue Waiting Time = 2 ticks (Ticks 5 to 7).
    Note: TAT (9) - Burst (4) = 5 (which includes 3 ticks of I/O).
    The waiting time MUST be 2 ticks, proving I/O is not counted as queue waiting.
    """
    p = SimulatedProcess(
        ProcessCreate(
            pid=10,
            name="IO_Worker",
            arrival_time=0,
            burst_time=4,
            memory=120,
            priority=5,
            io_frequency=2,
            io_duration=3
        )
    )
    p.transition_to(p.VALID_TRANSITIONS[p.state].copy().pop(), 0, "arrived")
    p.transition_to(p.VALID_TRANSITIONS[p.state].copy().pop(), 0, "dispatched")

    # Run 2 CPU ticks
    p.execute_one_tick(1)
    p.execute_one_tick(2)
    assert p.state.value == "BLOCKED"
    assert p.current_io_remaining == 3
    assert p.waiting_time == 0  # 0 wait time so far

    # Tick 3 ticks in blocked state
    p.tick_in_blocked(3)
    p.tick_in_blocked(4)
    finished_io = p.tick_in_blocked(5)
    assert finished_io is True
    assert p.state.value == "READY"
    assert p.waiting_time == 0  # Still 0 wait time because I/O is NOT ready queue waiting!

    # Wait 2 ticks in READY queue
    p.tick_in_ready_queue()
    p.tick_in_ready_queue()
    assert p.waiting_time == 2

    # Dispatch and finish remaining 2 ticks
    p.transition_to(p.VALID_TRANSITIONS[p.state].copy().pop(), 7, "dispatched")
    p.execute_one_tick(8)
    completed = p.execute_one_tick(9)
    assert completed is True
    assert p.finish_time == 9
    assert p.turnaround_time == 9
    assert p.waiting_time == 2  # Verified: exactly 2 ticks waiting in queue!


def test_jains_fairness_index_hand_calculated():
    """
    Hand-calculated example:
    2 processes with normalized service:
    x_1 = 0.5, x_2 = 0.5 (equal service)
    sum(x) = 1.0, sum(x^2) = 0.25 + 0.25 = 0.5
    J = (1.0)^2 / (2 * 0.5) = 1.0 (perfect fairness)

    Unequal service:
    x_1 = 1.0, x_2 = 0.0
    sum(x) = 1.0, sum(x^2) = 1.0
    J = (1.0)^2 / (2 * 1.0) = 0.5
    """
    p1 = SimulatedProcess(ProcessCreate(pid=1, name="P1", arrival_time=0, burst_time=10, memory=50, priority=5))
    p2 = SimulatedProcess(ProcessCreate(pid=2, name="P2", arrival_time=0, burst_time=10, memory=50, priority=5))
    
    # Mark arrived
    p1.transition_to(p1.VALID_TRANSITIONS[p1.state].copy().pop(), 0)
    p2.transition_to(p2.VALID_TRANSITIONS[p2.state].copy().pop(), 0)

    # 5 service each
    p1.cpu_service_received = 5
    p2.cpu_service_received = 5
    fairness = calculate_jains_fairness([p1, p2])
    assert fairness.index == 1.0

    # 10 service for p1, 0 for p2
    p1.cpu_service_received = 10
    p2.cpu_service_received = 0
    unfairness = calculate_jains_fairness([p1, p2])
    assert unfairness.index == 0.5


def test_jains_fairness_three_processes_hand_calculated():
    """
    Hand-calculated example for 3 processes:
    x_1 = 0.8, x_2 = 0.5, x_3 = 0.2
    sum(x) = 0.8 + 0.5 + 0.2 = 1.5
    sum(x^2) = 0.64 + 0.25 + 0.04 = 0.93
    N = 3
    J = (1.5)^2 / (3 * 0.93) = 2.25 / 2.79 = 0.8064516... -> rounded to 4 decimals = 0.8065
    """
    p1 = SimulatedProcess(ProcessCreate(pid=1, name="P1", arrival_time=0, burst_time=10, memory=50, priority=5))
    p2 = SimulatedProcess(ProcessCreate(pid=2, name="P2", arrival_time=0, burst_time=10, memory=50, priority=5))
    p3 = SimulatedProcess(ProcessCreate(pid=3, name="P3", arrival_time=0, burst_time=10, memory=50, priority=5))
    for p in (p1, p2, p3):
        p.transition_to(p.VALID_TRANSITIONS[p.state].copy().pop(), 0)

    p1.cpu_service_received = 8   # 8/10 = 0.8
    p2.cpu_service_received = 5   # 5/10 = 0.5
    p3.cpu_service_received = 2   # 2/10 = 0.2

    details = calculate_jains_fairness([p1, p2, p3])
    assert details.index == 0.8065
    assert details.population_size == 3


def test_zero_division_guard():
    """Verifies that empty workloads and 0 elapsed time do not raise ZeroDivisionError."""
    tracker = MetricsTracker(memory_capacity=1024)
    metrics = tracker.compute_metrics(
        current_time=0,
        all_processes=[],
        ready_queue=[],
        blocked_queue=[]
    )
    assert metrics.cpu_utilization == 0.0
    assert metrics.throughput == 0.0
    assert metrics.avg_waiting_time == 0.0
    assert metrics.avg_turnaround_time == 0.0
    assert metrics.avg_response_time == 0.0
    assert metrics.jains_fairness.index == 1.0


def test_csv_injection_neutralization():
    """Verifies that CSV export sanitizes spreadsheet formula triggers."""
    raw_payloads = ["=SUM(A1:A10)", "+1234", "-cmd|' /C calc'!A0", "@malicious", "normal_text", "-32.2%"]
    sanitized = [BenchmarkRunner._sanitize_csv_cell(x) for x in raw_payloads]

    assert sanitized[0] == "'=SUM(A1:A10)"
    assert sanitized[1] == "+1234"  # valid numeric string allowed
    assert sanitized[2] == "'-cmd|' /C calc'!A0"
    assert sanitized[3] == "'@malicious"
    assert sanitized[4] == "normal_text"
    assert sanitized[5] == "-32.2%"  # valid signed percentage string allowed


def test_schema_validations_and_bounds():
    """Verifies input validation constraints on ProcessCreate and SimulationConfig."""
    # Priority bounds inversion check
    with pytest.raises(ValueError, match="cannot exceed max_priority_bound"):
        SimulationConfig(min_priority_bound=10, max_priority_bound=5)

    # Zero weights sum check
    with pytest.raises(ValueError, match="Total sum of recovery scoring weights must be positive"):
        SimulationConfig(
            w_responsiveness=0.0,
            w_resource_relief=0.0,
            w_fairness=0.0,
            w_cost=0.0,
            w_fairness_harm=0.0,
            w_risk=0.0
        )

    # Reclaimable memory > allocated memory check
    with pytest.raises(ValueError, match="cannot exceed total allocated memory"):
        ProcessCreate(pid=1, name="InvalidMemory", arrival_time=0, burst_time=5, memory=100, priority=5, reclaimable_memory=250)
