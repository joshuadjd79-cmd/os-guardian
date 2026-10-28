import uuid
from typing import Dict, List, Optional
from ..simulation.process import SimulatedProcess
from ..schemas.simulation import SimulationConfig
from ..schemas.metrics import SystemMetrics
from ..schemas.anomaly import AnomalyType, AnomalySeverity, AnomalyAlert, AnomalyStatus
from ..schemas.process import ProcessState


class AnomalyDetector:
    """
    Deterministic rule-based anomaly detector with sliding-window evaluation,
    evidence extraction, and duplicate alert suppression.
    """

    def __init__(self, config: SimulationConfig):
        self.config: SimulationConfig = config
        self.active_alerts: Dict[str, AnomalyAlert] = {}
        self.alert_history: List[AnomalyAlert] = []
        self.last_alert_tick_by_key: Dict[str, int] = {}

    def _alert_key(self, anomaly_type: AnomalyType, pids: List[int]) -> str:
        pids_str = ",".join(str(p) for p in sorted(pids)) if pids else "global"
        return f"{anomaly_type.value}:{pids_str}"

    def check_anomalies(
        self,
        current_time: int,
        metrics: SystemMetrics,
        all_processes: List[SimulatedProcess],
        ready_queue: List[SimulatedProcess],
        blocked_queue: List[SimulatedProcess],
        last_recovery_failed: bool = False,
        failed_recovery_info: Optional[Dict] = None
    ) -> List[AnomalyAlert]:
        new_or_updated: List[AnomalyAlert] = []

        # Rule 1: Sustained High CPU Utilization
        # Check window CPU utilization
        if metrics.window_cpu_utilization >= self.config.sustained_cpu_threshold and metrics.elapsed_time >= self.config.sustained_cpu_window:
            key = self._alert_key(AnomalyType.SUSTAINED_HIGH_CPU, [])
            evidence = {
                "window_cpu_utilization": metrics.window_cpu_utilization,
                "threshold": self.config.sustained_cpu_threshold,
                "window_ticks": self.config.sustained_cpu_window,
                "ready_queue_length": len(ready_queue)
            }
            alert = self._record_or_update_alert(
                key=key,
                anomaly_type=AnomalyType.SUSTAINED_HIGH_CPU,
                severity=AnomalySeverity.CRITICAL if metrics.window_cpu_utilization >= 95.0 else AnomalySeverity.WARNING,
                description=f"CPU utilization sustained at {metrics.window_cpu_utilization}% over past {self.config.sustained_cpu_window} ticks (threshold: {self.config.sustained_cpu_threshold}%)",
                evidence=evidence,
                affected_pids=[p.pid for p in ready_queue],
                current_time=current_time,
                recommended_action="ADJUST_TIME_QUANTUM or THROTTLE_ADMISSION"
            )
            if alert:
                new_or_updated.append(alert)
        else:
            self._resolve_alert_if_active(AnomalyType.SUSTAINED_HIGH_CPU, [], current_time, "CPU utilization returned below threshold")

        # Rule 2: High Memory Pressure
        if metrics.memory_utilization >= self.config.memory_pressure_threshold:
            key = self._alert_key(AnomalyType.HIGH_MEMORY_PRESSURE, [])
            evidence = {
                "memory_utilization": metrics.memory_utilization,
                "memory_used": metrics.memory_used,
                "memory_capacity": metrics.memory_capacity,
                "threshold": self.config.memory_pressure_threshold
            }
            alert = self._record_or_update_alert(
                key=key,
                anomaly_type=AnomalyType.HIGH_MEMORY_PRESSURE,
                severity=AnomalySeverity.CRITICAL if metrics.memory_utilization >= 92.0 else AnomalySeverity.WARNING,
                description=f"Simulated memory usage at {metrics.memory_utilization}% ({metrics.memory_used}MB / {metrics.memory_capacity}MB)",
                evidence=evidence,
                affected_pids=[p.pid for p in all_processes if p.state in {ProcessState.READY, ProcessState.RUNNING, ProcessState.BLOCKED}],
                current_time=current_time,
                recommended_action="RECLAIM_MEMORY or THROTTLE_ADMISSION"
            )
            if alert:
                new_or_updated.append(alert)
        else:
            self._resolve_alert_if_active(AnomalyType.HIGH_MEMORY_PRESSURE, [], current_time, "Memory pressure returned below threshold")

        # Rule 3: Excessive Process Waiting Time
        long_waiting = [p for p in ready_queue if p.waiting_time >= self.config.excessive_wait_threshold]
        if long_waiting:
            pids = [p.pid for p in long_waiting]
            max_wait = max(p.waiting_time for p in long_waiting)
            key = self._alert_key(AnomalyType.EXCESSIVE_WAITING_TIME, pids)
            evidence = {
                "max_waiting_time": max_wait,
                "threshold": self.config.excessive_wait_threshold,
                "affected_pids_count": len(long_waiting)
            }
            alert = self._record_or_update_alert(
                key=key,
                anomaly_type=AnomalyType.EXCESSIVE_WAITING_TIME,
                severity=AnomalySeverity.WARNING,
                description=f"{len(long_waiting)} process(es) waiting > {self.config.excessive_wait_threshold} ticks (max: {max_wait} ticks)",
                evidence=evidence,
                affected_pids=pids,
                current_time=current_time,
                recommended_action="SWITCH_SCHEDULER or ADJUST_TIME_QUANTUM"
            )
            if alert:
                new_or_updated.append(alert)

        # Rule 4: Unresponsive / Stalled Process
        unresponsive = [p for p in blocked_queue if p.state == ProcessState.BLOCKED and (p.io_duration - p.current_io_remaining) >= self.config.unresponsive_threshold]
        if unresponsive:
            pids = [p.pid for p in unresponsive]
            key = self._alert_key(AnomalyType.UNRESPONSIVE_PROCESS, pids)
            evidence = {
                "stalled_pids": pids,
                "threshold": self.config.unresponsive_threshold
            }
            alert = self._record_or_update_alert(
                key=key,
                anomaly_type=AnomalyType.UNRESPONSIVE_PROCESS,
                severity=AnomalySeverity.WARNING,
                description=f"Process(es) {pids} blocked in simulated I/O for >= {self.config.unresponsive_threshold} ticks without unblocking",
                evidence=evidence,
                affected_pids=pids,
                current_time=current_time,
                recommended_action="ADJUST_PRIORITY or RECLAIM_MEMORY"
            )
            if alert:
                new_or_updated.append(alert)

        # Rule 5: Starvation Risk
        starving = [p for p in ready_queue if p.ticks_in_ready_queue >= self.config.starvation_threshold]
        if starving:
            pids = [p.pid for p in starving]
            key = self._alert_key(AnomalyType.STARVATION_RISK, pids)
            evidence = {
                "starving_pids": pids,
                "max_ticks_starving": max(p.ticks_in_ready_queue for p in starving),
                "threshold": self.config.starvation_threshold
            }
            alert = self._record_or_update_alert(
                key=key,
                anomaly_type=AnomalyType.STARVATION_RISK,
                severity=AnomalySeverity.CRITICAL,
                description=f"Starvation risk detected: PID(s) {pids} waiting in ready queue for >= {self.config.starvation_threshold} ticks without receiving CPU service",
                evidence=evidence,
                affected_pids=pids,
                current_time=current_time,
                recommended_action="APPLY_AGING or ADJUST_PRIORITY"
            )
            if alert:
                new_or_updated.append(alert)

        # Rule 6: Recovery Failure
        if last_recovery_failed and failed_recovery_info:
            action_id = failed_recovery_info.get("action_id", "unknown")
            key = f"{AnomalyType.RECOVERY_FAILURE.value}:{action_id}"
            evidence = failed_recovery_info
            alert = self._record_or_update_alert(
                key=key,
                anomaly_type=AnomalyType.RECOVERY_FAILURE,
                severity=AnomalySeverity.WARNING,
                description=f"Recovery action {failed_recovery_info.get('action_type')} failed to improve target metric",
                evidence=evidence,
                affected_pids=failed_recovery_info.get("affected_pids", []),
                current_time=current_time,
                recommended_action="NO_INTERVENTION (cooldown active)"
            )
            if alert:
                new_or_updated.append(alert)

        return new_or_updated

    def _record_or_update_alert(
        self,
        key: str,
        anomaly_type: AnomalyType,
        severity: AnomalySeverity,
        description: str,
        evidence: Dict,
        affected_pids: List[int],
        current_time: int,
        recommended_action: str
    ) -> Optional[AnomalyAlert]:
        last_detected = self.last_alert_tick_by_key.get(key)
        
        # If active, update last_detected_time without spamming duplicate active alerts
        if key in self.active_alerts:
            alert = self.active_alerts[key]
            alert.last_detected_time = current_time
            alert.severity = severity
            alert.evidence = evidence
            alert.affected_pids = affected_pids
            self.last_alert_tick_by_key[key] = current_time
            return alert

        # Cooldown check: if resolved recently within cooldown, don't flap
        if last_detected is not None and (current_time - last_detected) < self.config.cooldown_period:
            return None

        alert_id = f"ALT-{str(uuid.uuid4())[:8].upper()}"
        alert = AnomalyAlert(
            id=alert_id,
            timestamp=current_time,
            anomaly_type=anomaly_type,
            severity=severity,
            description=description,
            evidence=evidence,
            affected_pids=affected_pids,
            status=AnomalyStatus.ACTIVE,
            first_detected_time=current_time,
            last_detected_time=current_time,
            recommended_action=recommended_action
        )
        self.active_alerts[key] = alert
        self.alert_history.append(alert)
        self.last_alert_tick_by_key[key] = current_time
        return alert

    def _resolve_alert_if_active(self, anomaly_type: AnomalyType, pids: List[int], current_time: int, reason: str) -> None:
        key = self._alert_key(anomaly_type, pids)
        if key in self.active_alerts:
            alert = self.active_alerts.pop(key)
            alert.status = AnomalyStatus.RECOVERED
            alert.resolution_time = current_time
            alert.resolution_details = reason

    def resolve_all_for_type(self, anomaly_type: AnomalyType, current_time: int, reason: str) -> None:
        keys_to_resolve = [k for k in self.active_alerts if k.startswith(anomaly_type.value)]
        for k in keys_to_resolve:
            alert = self.active_alerts.pop(k)
            alert.status = AnomalyStatus.RECOVERED
            alert.resolution_time = current_time
            alert.resolution_details = reason
