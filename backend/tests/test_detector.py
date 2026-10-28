import pytest
from backend.app.schemas.process import ProcessCreate, ProcessState
from backend.app.schemas.simulation import SimulationConfig
from backend.app.schemas.metrics import SystemMetrics
from backend.app.schemas.anomaly import AnomalyType, AnomalyStatus
from backend.app.simulation.process import SimulatedProcess
from backend.app.monitoring.detector import AnomalyDetector


def test_sustained_cpu_anomaly_windowing():
    config = SimulationConfig(sustained_cpu_threshold=80.0, sustained_cpu_window=5)
    detector = AnomalyDetector(config)

    # 1. Short single spike: window is less than 5 ticks elapsed or window average low
    metrics_spike = SystemMetrics(
        simulation_time=2,
        elapsed_time=2,
        window_cpu_utilization=100.0,
        cpu_utilization=100.0
    )
    alerts = detector.check_anomalies(2, metrics_spike, [], [], [])
    # Should not trigger because elapsed_time < window_ticks (5)
    assert not any(a.anomaly_type == AnomalyType.SUSTAINED_HIGH_CPU for a in alerts)

    # 2. Sustained high CPU over window
    metrics_sustained = SystemMetrics(
        simulation_time=6,
        elapsed_time=6,
        window_cpu_utilization=85.0,
        cpu_utilization=85.0
    )
    alerts = detector.check_anomalies(6, metrics_sustained, [], [], [])
    cpu_alerts = [a for a in alerts if a.anomaly_type == AnomalyType.SUSTAINED_HIGH_CPU]
    assert len(cpu_alerts) == 1
    assert cpu_alerts[0].evidence["window_cpu_utilization"] == 85.0


def test_memory_pressure_and_duplicate_suppression():
    config = SimulationConfig(memory_pressure_threshold=80.0)
    detector = AnomalyDetector(config)

    metrics_high_mem = SystemMetrics(
        simulation_time=10,
        elapsed_time=10,
        memory_capacity=1000,
        memory_used=850,
        memory_utilization=85.0
    )
    # First detection
    alerts1 = detector.check_anomalies(10, metrics_high_mem, [], [], [])
    assert len(detector.active_alerts) == 1

    # Second tick with same continuing condition
    alerts2 = detector.check_anomalies(11, metrics_high_mem, [], [], [])
    # Should update last_detected_time without creating a second duplicate alert in active_alerts
    assert len(detector.active_alerts) == 1
    alert = list(detector.active_alerts.values())[0]
    assert alert.first_detected_time == 10
    assert alert.last_detected_time == 11
