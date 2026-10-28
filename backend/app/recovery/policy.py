import uuid
from typing import Any, Dict, List, Optional
from ..simulation.process import SimulatedProcess
from ..schemas.simulation import SimulationConfig
from ..schemas.metrics import SystemMetrics
from ..schemas.anomaly import AnomalyAlert, AnomalyType, AnomalyStatus
from ..schemas.recovery import (
    CandidateAction,
    RecoveryActionType,
    RecoveryDecisionRecord,
    ActionOutcome
)
from .evaluator import RecoveryEvaluator
from .actions import RecoveryActionHandler, ActionExecutionResult


class PendingOutcomeEvaluation:
    """Tracks an applied recovery action until observation window elapses."""
    def __init__(
        self,
        record: RecoveryDecisionRecord,
        snapshot: Dict[str, Any],
        observation_ticks_remaining: int
    ):
        self.record = record
        self.snapshot = snapshot
        self.observation_ticks_remaining = observation_ticks_remaining


class RecoveryPolicyEngine:
    """Orchestrates explainable recovery decisions, execution, and outcome verification."""

    def __init__(self, config: SimulationConfig):
        self.config: SimulationConfig = config
        self.evaluator: RecoveryEvaluator = RecoveryEvaluator(config)
        self.decisions_history: List[RecoveryDecisionRecord] = []
        self.pending_evaluations: List[PendingOutcomeEvaluation] = []
        self.action_cooldowns: Dict[str, int] = {}
        self.last_recovery_failed: bool = False
        self.failed_recovery_info: Optional[Dict] = None

    def evaluate_and_recover(
        self,
        current_time: int,
        alerts: List[AnomalyAlert],
        metrics: SystemMetrics,
        all_processes: List[SimulatedProcess],
        ready_queue: List[SimulatedProcess]
    ) -> Optional[RecoveryDecisionRecord]:
        if not alerts:
            return None

        # Filter active alerts that don't have pending evaluations
        active_alerts = [a for a in alerts if a.status == AnomalyStatus.ACTIVE]
        if not active_alerts:
            return None

        # Sort alerts by severity (CRITICAL first, then earliest timestamp)
        def alert_priority(a: AnomalyAlert) -> int:
            return 2 if a.severity.value == "CRITICAL" else 1

        primary_alert = max(active_alerts, key=lambda a: (alert_priority(a), -a.timestamp))

        # Check cooldown for this anomaly type
        cooldown_until = self.action_cooldowns.get(primary_alert.anomaly_type.value, 0)
        if current_time < cooldown_until:
            return None

        # Step 4 & 5 & 6: Generate candidates and score them
        candidates = self.evaluator.generate_candidates(
            alert=primary_alert,
            metrics=metrics,
            all_processes=all_processes,
            ready_queue=ready_queue
        )

        # Step 7: Select best valid action exceeding minimum utility threshold
        eligible_candidates = [c for c in candidates if c.is_eligible]
        chosen = None
        for c in eligible_candidates:
            if c.action_type == RecoveryActionType.NO_INTERVENTION:
                continue
            if c.score >= self.config.min_utility_threshold:
                chosen = c
                break

        if chosen is None:
            # Fall back to explicit NO_INTERVENTION
            chosen = next(c for c in candidates if c.action_type == RecoveryActionType.NO_INTERVENTION)
            justification = f"No candidate action exceeded the minimum utility threshold ({self.config.min_utility_threshold:.2f}). Operating state left unaltered."
        else:
            justification = f"Selected {chosen.action_type.value} with utility score {chosen.score:.4f} (confidence: {chosen.confidence:.2f}): {chosen.explanation}"

        # Step 8: Record decision
        decision_id = f"REC-{str(uuid.uuid4())[:8].upper()}"
        baseline_metrics_dict = {
            "simulation_time": current_time,
            "cpu_utilization": metrics.cpu_utilization,
            "window_cpu_utilization": metrics.window_cpu_utilization,
            "memory_utilization": metrics.memory_utilization,
            "ready_queue_length": metrics.ready_queue_length,
            "avg_waiting_time": metrics.avg_waiting_time,
            "jains_fairness_index": metrics.jains_fairness.index
        }

        record = RecoveryDecisionRecord(
            decision_id=decision_id,
            timestamp=current_time,
            triggering_anomaly_id=primary_alert.id,
            triggering_anomaly_type=primary_alert.anomaly_type.value,
            affected_pids=list(primary_alert.affected_pids),
            baseline_metrics=baseline_metrics_dict,
            candidates_evaluated=candidates,
            chosen_action=chosen,
            justification=justification,
            is_manual_approval_required=self.config.manual_approval_required,
            approved=not self.config.manual_approval_required,
        )

        # Step 9: Apply action if auto-recovery is enabled and no manual approval is pending
        if self.config.auto_recovery and not self.config.manual_approval_required:
            result = RecoveryActionHandler.apply_action(
                action_type=chosen.action_type,
                target_pids=chosen.target_pids,
                parameters=chosen.parameters,
                all_processes=all_processes,
                ready_queue=ready_queue,
                config=self.config,
                current_time=current_time
            )
            record.was_applied = True
            record.applied_timestamp = current_time

            # Set cooldown for this anomaly type
            self.action_cooldowns[primary_alert.anomaly_type.value] = current_time + self.config.cooldown_period

            if chosen.action_type != RecoveryActionType.NO_INTERVENTION:
                # Queue outcome evaluation after observation window (e.g. 5 ticks)
                self.pending_evaluations.append(
                    PendingOutcomeEvaluation(
                        record=record,
                        snapshot=result.pre_state_snapshot,
                        observation_ticks_remaining=5
                    )
                )
            else:
                record.outcome = ActionOutcome.SUCCESS
                record.outcome_narrative = "Non-intervention successfully preserved baseline operations."
                record.evaluation_timestamp = current_time

        self.decisions_history.append(record)
        return record

    def advance_and_evaluate_outcomes(
        self,
        current_time: int,
        metrics: SystemMetrics,
        all_processes: List[SimulatedProcess]
    ) -> List[RecoveryDecisionRecord]:
        """Step 10, 11, 12: Evaluates whether applied actions improved system health."""
        evaluated_records = []
        still_pending = []

        for item in self.pending_evaluations:
            item.observation_ticks_remaining -= 1
            if item.observation_ticks_remaining <= 0:
                # Measure post-action metrics
                post_metrics_dict = {
                    "simulation_time": current_time,
                    "cpu_utilization": metrics.cpu_utilization,
                    "window_cpu_utilization": metrics.window_cpu_utilization,
                    "memory_utilization": metrics.memory_utilization,
                    "ready_queue_length": metrics.ready_queue_length,
                    "avg_waiting_time": metrics.avg_waiting_time,
                    "jains_fairness_index": metrics.jains_fairness.index
                }
                item.record.post_action_metrics = post_metrics_dict
                item.record.evaluation_timestamp = current_time

                # Evaluate delta against baseline
                baseline = item.record.baseline_metrics
                anomaly_type = item.record.triggering_anomaly_type
                action_type = item.record.chosen_action.action_type

                is_improved = False
                is_partial = False
                is_regression = False
                narrative = ""

                if anomaly_type == AnomalyType.HIGH_MEMORY_PRESSURE.value:
                    baseline_mem = baseline.get("memory_utilization", 100.0)
                    delta_mem = baseline_mem - post_metrics_dict["memory_utilization"]
                    if delta_mem >= 5.0:
                        is_improved = True
                        narrative = f"Memory pressure reduced by {delta_mem:.1f}% following {action_type.value}."
                    elif delta_mem > 0.0:
                        is_partial = True
                        narrative = f"Memory pressure showed modest reduction of {delta_mem:.1f}%."
                    else:
                        is_regression = delta_mem < -2.0
                        narrative = f"Memory pressure failed to improve (delta: {delta_mem:.1f}%)."

                elif anomaly_type in {AnomalyType.STARVATION_RISK.value, AnomalyType.EXCESSIVE_WAITING_TIME.value}:
                    baseline_fairness = baseline.get("jains_fairness_index", 0.5)
                    delta_fairness = post_metrics_dict["jains_fairness_index"] - baseline_fairness
                    if delta_fairness >= 0.05 or post_metrics_dict["avg_waiting_time"] <= baseline.get("avg_waiting_time", 999.0):
                        is_improved = True
                        narrative = f"Fairness index improved by +{delta_fairness:.3f} and waiting delays stabilized."
                    elif delta_fairness >= 0.0:
                        is_partial = True
                        narrative = f"Fairness held steady (+{delta_fairness:.3f})."
                    else:
                        is_regression = True
                        narrative = f"Fairness index dropped by {delta_fairness:.3f} following action."

                else:
                    # Sustained high CPU or generic
                    delta_cpu = baseline.get("window_cpu_utilization", 100.0) - post_metrics_dict["window_cpu_utilization"]
                    if delta_cpu >= 5.0 or post_metrics_dict["ready_queue_length"] < baseline.get("ready_queue_length", 10):
                        is_improved = True
                        narrative = f"Queue congestion reduced and CPU pressure eased by {delta_cpu:.1f}%."
                    elif delta_cpu >= 0.0:
                        is_partial = True
                        narrative = f"Modest stabilization observed (CPU delta: {delta_cpu:.1f}%)."
                    else:
                        is_regression = True
                        narrative = f"CPU utilization remained high or increased (+{abs(delta_cpu):.1f}%)."

                # Assign outcome
                if is_improved:
                    item.record.outcome = ActionOutcome.SUCCESS
                    self.last_recovery_failed = False
                elif is_partial:
                    item.record.outcome = ActionOutcome.PARTIAL_IMPROVEMENT
                    self.last_recovery_failed = False
                elif is_regression:
                    item.record.outcome = ActionOutcome.REGRESSION
                    self.last_recovery_failed = True
                    self.failed_recovery_info = {
                        "action_id": item.record.decision_id,
                        "action_type": action_type.value,
                        "triggering_anomaly": anomaly_type,
                        "affected_pids": item.record.affected_pids
                    }
                    # Trigger reversibility if regression detected!
                    RecoveryActionHandler.revert_action(item.snapshot, all_processes, self.config)
                    narrative += " Automated safety rollback triggered to revert changes."
                else:
                    item.record.outcome = ActionOutcome.NO_IMPROVEMENT
                    self.last_recovery_failed = True
                    self.failed_recovery_info = {
                        "action_id": item.record.decision_id,
                        "action_type": action_type.value,
                        "triggering_anomaly": anomaly_type,
                        "affected_pids": item.record.affected_pids
                    }

                item.record.outcome_narrative = narrative
                evaluated_records.append(item.record)
            else:
                still_pending.append(item)

        self.pending_evaluations = still_pending
        return evaluated_records
