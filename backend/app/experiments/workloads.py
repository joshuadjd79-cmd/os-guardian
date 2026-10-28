from typing import Dict, List
from ..schemas.process import ProcessCreate
from ..schemas.experiment import WorkloadType, ExperimentScenario


def get_workload(workload_type: WorkloadType) -> List[ProcessCreate]:
    """Generates standard reproducible benchmark workloads."""
    if workload_type == WorkloadType.BALANCED:
        return [
            ProcessCreate(pid=1, name="Web_Server", arrival_time=0, burst_time=12, memory=128, priority=5, io_frequency=4, io_duration=2, reclaimable_memory=32),
            ProcessCreate(pid=2, name="Database_Query", arrival_time=1, burst_time=16, memory=256, priority=4, io_frequency=5, io_duration=3, reclaimable_memory=64),
            ProcessCreate(pid=3, name="Auth_Service", arrival_time=2, burst_time=8, memory=96, priority=3, io_frequency=0, io_duration=0, reclaimable_memory=16),
            ProcessCreate(pid=4, name="Cache_Worker", arrival_time=4, burst_time=10, memory=160, priority=6, io_frequency=3, io_duration=1, reclaimable_memory=48),
            ProcessCreate(pid=5, name="Log_Aggregator", arrival_time=6, burst_time=14, memory=112, priority=8, io_frequency=6, io_duration=2, reclaimable_memory=24),
        ]

    elif workload_type == WorkloadType.CPU_HEAVY:
        return [
            ProcessCreate(pid=101, name="Matrix_Multiply", arrival_time=0, burst_time=35, memory=200, priority=5, io_frequency=0, io_duration=0, reclaimable_memory=30),
            ProcessCreate(pid=102, name="Video_Transcode", arrival_time=0, burst_time=40, memory=300, priority=5, io_frequency=0, io_duration=0, reclaimable_memory=50),
            ProcessCreate(pid=103, name="Crypto_Hash", arrival_time=2, burst_time=30, memory=150, priority=4, io_frequency=0, io_duration=0, reclaimable_memory=20),
            ProcessCreate(pid=104, name="Physics_Sim", arrival_time=5, burst_time=25, memory=220, priority=6, io_frequency=0, io_duration=0, reclaimable_memory=40),
        ]

    elif workload_type == WorkloadType.MEMORY_PRESSURE:
        return [
            ProcessCreate(pid=201, name="ML_Model_Loader", arrival_time=0, burst_time=20, memory=420, priority=5, io_frequency=0, io_duration=0, reclaimable_memory=180),
            ProcessCreate(pid=202, name="In_Memory_Cache", arrival_time=1, burst_time=22, memory=380, priority=6, io_frequency=0, io_duration=0, reclaimable_memory=160),
            ProcessCreate(pid=203, name="Data_Buffer_Pool", arrival_time=3, burst_time=18, memory=240, priority=4, io_frequency=0, io_duration=0, reclaimable_memory=100),
            ProcessCreate(pid=204, name="High_Res_Render", arrival_time=6, burst_time=15, memory=180, priority=7, io_frequency=0, io_duration=0, reclaimable_memory=60),
        ]

    elif workload_type == WorkloadType.STARVATION_RISK:
        # P301 has high priority (1) and long burst, followed by continuous stream of high priority jobs, while P305 has low priority (15)
        return [
            ProcessCreate(pid=301, name="Priority_Daemon_A", arrival_time=0, burst_time=25, memory=100, priority=2, io_frequency=0, io_duration=0, reclaimable_memory=20),
            ProcessCreate(pid=302, name="Priority_Daemon_B", arrival_time=2, burst_time=20, memory=120, priority=2, io_frequency=0, io_duration=0, reclaimable_memory=20),
            ProcessCreate(pid=303, name="Priority_Daemon_C", arrival_time=5, burst_time=18, memory=90, priority=3, io_frequency=0, io_duration=0, reclaimable_memory=15),
            ProcessCreate(pid=304, name="Priority_Daemon_D", arrival_time=10, burst_time=22, memory=110, priority=3, io_frequency=0, io_duration=0, reclaimable_memory=20),
            ProcessCreate(pid=305, name="Starving_Batch_Job", arrival_time=0, burst_time=15, memory=150, priority=18, io_frequency=0, io_duration=0, reclaimable_memory=30),
        ]

    elif workload_type == WorkloadType.MIXED_ARRIVALS:
        return [
            ProcessCreate(pid=401, name="Batch_Init", arrival_time=0, burst_time=8, memory=80, priority=5, io_frequency=0, io_duration=0, reclaimable_memory=10),
            ProcessCreate(pid=402, name="Delayed_Worker_1", arrival_time=12, burst_time=14, memory=160, priority=4, io_frequency=3, io_duration=2, reclaimable_memory=40),
            ProcessCreate(pid=403, name="Delayed_Worker_2", arrival_time=18, burst_time=10, memory=140, priority=6, io_frequency=0, io_duration=0, reclaimable_memory=30),
            ProcessCreate(pid=404, name="Late_Interactive_Job", arrival_time=32, burst_time=6, memory=60, priority=2, io_frequency=2, io_duration=1, reclaimable_memory=10),
        ]

    elif workload_type == WorkloadType.NO_WORKLOAD_IDLE:
        return []

    elif workload_type == WorkloadType.RECOVERY_REGRESSION:
        # Workload where aggressive quantum shrinkage or priority alteration induces thrashing/overhead
        return [
            ProcessCreate(pid=501, name="Short_Task_A", arrival_time=0, burst_time=3, memory=50, priority=5, io_frequency=0, io_duration=0, reclaimable_memory=0),
            ProcessCreate(pid=502, name="Short_Task_B", arrival_time=0, burst_time=3, memory=50, priority=5, io_frequency=0, io_duration=0, reclaimable_memory=0),
            ProcessCreate(pid=503, name="Short_Task_C", arrival_time=1, burst_time=3, memory=50, priority=5, io_frequency=0, io_duration=0, reclaimable_memory=0),
            ProcessCreate(pid=504, name="Short_Task_D", arrival_time=1, burst_time=3, memory=50, priority=5, io_frequency=0, io_duration=0, reclaimable_memory=0),
        ]

    return []


def get_all_scenarios() -> List[ExperimentScenario]:
    """Returns catalog of all benchmark scenarios with metadata."""
    scenarios = [
        ExperimentScenario(
            id="SCENARIO_BALANCED",
            name="A. Balanced Mixed Workload",
            workload_type=WorkloadType.BALANCED,
            description="Typical enterprise workload featuring mixed CPU and simulated I/O bursts across services.",
            processes=get_workload(WorkloadType.BALANCED),
            total_ticks=80,
            random_seed=42
        ),
        ExperimentScenario(
            id="SCENARIO_CPU_HEAVY",
            name="B. Sustained CPU Saturation",
            workload_type=WorkloadType.CPU_HEAVY,
            description="High computational workload testing sustained CPU saturation, queue growth, and quantum tuning.",
            processes=get_workload(WorkloadType.CPU_HEAVY),
            total_ticks=120,
            random_seed=42
        ),
        ExperimentScenario(
            id="SCENARIO_MEMORY_PRESSURE",
            name="C. Memory Pressure & Reclamation",
            workload_type=WorkloadType.MEMORY_PRESSURE,
            description="High-memory allocations testing automated non-destructive memory reclamation and admission control.",
            processes=get_workload(WorkloadType.MEMORY_PRESSURE),
            total_ticks=80,
            random_seed=42
        ),
        ExperimentScenario(
            id="SCENARIO_STARVATION_RISK",
            name="D. Starvation Vulnerability & Aging",
            workload_type=WorkloadType.STARVATION_RISK,
            description="Priority-skewed workload where low-priority jobs risk indefinite starvation without dynamic aging.",
            processes=get_workload(WorkloadType.STARVATION_RISK),
            total_ticks=100,
            random_seed=42
        ),
        ExperimentScenario(
            id="SCENARIO_MIXED_ARRIVALS",
            name="E. Staggered Arrival Timing",
            workload_type=WorkloadType.MIXED_ARRIVALS,
            description="Tests scheduler handling of idle periods, bursts arriving after idle gaps, and dynamic preemption.",
            processes=get_workload(WorkloadType.MIXED_ARRIVALS),
            total_ticks=60,
            random_seed=42
        ),
        ExperimentScenario(
            id="SCENARIO_IDLE",
            name="F. Zero-Workload Idle Boundary Case",
            workload_type=WorkloadType.NO_WORKLOAD_IDLE,
            description="Tests simulator stability with zero processes, verifying division-by-zero guards and idle accounting.",
            processes=get_workload(WorkloadType.NO_WORKLOAD_IDLE),
            total_ticks=20,
            random_seed=42
        ),
        ExperimentScenario(
            id="SCENARIO_REGRESSION",
            name="G. Regression & Ineffective Action Safety Case",
            workload_type=WorkloadType.RECOVERY_REGRESSION,
            description="Tests recovery rollback mechanism and regression detection when intervention does not yield benefits.",
            processes=get_workload(WorkloadType.RECOVERY_REGRESSION),
            total_ticks=30,
            random_seed=42
        ),
    ]
    return scenarios
