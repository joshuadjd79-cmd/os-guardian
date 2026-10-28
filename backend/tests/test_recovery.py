import pytest
from backend.app.schemas.process import ProcessCreate
from backend.app.schemas.simulation import SimulationConfig, SchedulerType
from backend.app.schemas.metrics import SystemMetrics
from backend.app.schemas.anomaly import AnomalyAlert, AnomalyType, AnomalySeverity
from backend.app.schemas.recovery import RecoveryActionType, ActionOutcome
from backend.app.simulation.process import SimulatedProcess
from backend.app.recovery.policy import RecoveryPolicyEngine
from backend.app.recovery.actions import RecoveryActionHandler


def test_candidate_scoring_and_ranking():
    config = SimulationConfig(min_utility_threshold=0.10)
    engine = RecoveryPolicyEngine(config)

    p1 = SimulatedProcess(ProcessCreate(pid=1, name="P1", arrival_time=0, burst_time=10, memory=500, priority=5, reclaimable_memory=200))
    ready_queue = [p1]

    alert = AnomalyAlert(
        id="ALT-1",
        timestamp=5,
        anomaly_type=AnomalyType.HIGH_MEMORY_PRESSURE,
        severity=AnomalySeverity.CRITICAL,
        description="High memory pressure",
        evidence={"memory_utilization": 90.0},
        affected_pids=[1],
        first_detected_time=5,
        last_detected_time=5
    )
    metrics = SystemMetrics(simulation_time=5, elapsed_time=5, memory_capacity=1000, memory_used=900, memory_utilization=90.0)

    candidates = engine.evaluator.generate_candidates(alert, metrics, [p1], ready_queue)
    # Reclaim memory candidate should be ranked highest for memory pressure
    top_candidate = candidates[0]
    assert top_candidate.is_eligible is True
    assert top_candidate.action_type == RecoveryActionType.RECLAIM_MEMORY
    assert top_candidate.score > config.min_utility_threshold


def test_reversibility_on_regression():
    config = SimulationConfig(scheduler_algorithm=SchedulerType.ROUND_ROBIN, time_quantum=4)
    p1 = SimulatedProcess(ProcessCreate(pid=1, name="P1", arrival_time=0, burst_time=10, memory=100, priority=5))

    # Apply quantum change
    result = RecoveryActionHandler.apply_action(
        action_type=RecoveryActionType.ADJUST_TIME_QUANTUM,
        target_pids=[],
        parameters={"new_quantum": 2},
        all_processes=[p1],
        ready_queue=[p1],
        config=config,
        current_time=5
    )
    assert config.time_quantum == 2

    # Simulate rollback
    reverted = RecoveryActionHandler.revert_action(result.pre_state_snapshot, [p1], config)
    assert reverted is True
    assert config.time_quantum == 4
