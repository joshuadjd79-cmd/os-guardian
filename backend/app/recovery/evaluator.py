from typing import List, Optional
from ..schemas.simulation import SimulationConfig, SchedulerType
from ..schemas.anomaly import AnomalyAlert, AnomalyType
from ..schemas.metrics import SystemMetrics
from ..schemas.recovery import CandidateAction, RecoveryActionType
from ..simulation.process import SimulatedProcess


class RecoveryEvaluator:
    """Evaluates, scores, and ranks candidate recovery actions transparently."""

    def __init__(self, config: SimulationConfig):
        self.config: SimulationConfig = config

    def calculate_score(self, candidate: CandidateAction) -> float:
        """
        Computes weighted score:
        score(action) = w1 * expected_responsiveness_improvement
                      + w2 * expected_resource_relief
                      + w3 * fairness_benefit
                      - w4 * estimated_intervention_cost
                      - w5 * estimated_fairness_harm
                      - w6 * recovery_risk
        """
        w1 = self.config.w_responsiveness
        w2 = self.config.w_resource_relief
        w3 = self.config.w_fairness
        w4 = self.config.w_cost
        w5 = self.config.w_fairness_harm
        w6 = self.config.w_risk

        raw_score = (
            w1 * candidate.expected_responsiveness_improvement
            + w2 * candidate.expected_resource_relief
            + w3 * candidate.fairness_benefit
            - w4 * candidate.estimated_intervention_cost
            - w5 * candidate.estimated_fairness_harm
            - w6 * candidate.recovery_risk
        )
        return round(raw_score, 4)

    def generate_candidates(
        self,
        alert: AnomalyAlert,
        metrics: SystemMetrics,
        all_processes: List[SimulatedProcess],
        ready_queue: List[SimulatedProcess]
    ) -> List[CandidateAction]:
        candidates: List[CandidateAction] = []

        # Candidate 1: ADJUST_PRIORITY
        starving_pids = alert.affected_pids if alert.anomaly_type == AnomalyType.STARVATION_RISK else [
            p.pid for p in ready_queue if p.ticks_in_ready_queue > 10
        ]
        p1_eligible = len(starving_pids) > 0
        p1 = CandidateAction(
            action_type=RecoveryActionType.ADJUST_PRIORITY,
            target_pids=starving_pids,
            parameters={"boost_amount": 3},
            is_eligible=p1_eligible,
            rejection_reason=None if p1_eligible else "No specific starved or lagging processes identified to boost",
            expected_responsiveness_improvement=0.65 if alert.anomaly_type == AnomalyType.STARVATION_RISK else 0.35,
            expected_resource_relief=0.10,
            fairness_benefit=0.85 if alert.anomaly_type == AnomalyType.STARVATION_RISK else 0.40,
            estimated_intervention_cost=0.08,
            estimated_fairness_harm=0.05,
            recovery_risk=0.10,
            confidence=0.88 if alert.anomaly_type == AnomalyType.STARVATION_RISK else 0.50,
            expected_effects="Boosts priority of delayed processes to allow them CPU dispatch on next tick",
            potential_side_effects="Temporarily delays processes with originally higher priority",
            explanation="Targeted priority elevation directly breaks starvation bottlenecks"
        )
        candidates.append(p1)

        # Candidate 2: APPLY_AGING
        p2_eligible = len(ready_queue) > 1 and self.config.enable_aging
        p2 = CandidateAction(
            action_type=RecoveryActionType.APPLY_AGING,
            target_pids=[p.pid for p in ready_queue],
            parameters={"step": self.config.aging_step},
            is_eligible=p2_eligible,
            rejection_reason=None if p2_eligible else "Ready queue has <= 1 process or aging is disabled",
            expected_responsiveness_improvement=0.55 if alert.anomaly_type in {AnomalyType.EXCESSIVE_WAITING_TIME, AnomalyType.STARVATION_RISK} else 0.25,
            expected_resource_relief=0.05,
            fairness_benefit=0.80,
            estimated_intervention_cost=0.04,
            estimated_fairness_harm=0.02,
            recovery_risk=0.05,
            confidence=0.85 if alert.anomaly_type == AnomalyType.STARVATION_RISK else 0.60,
            expected_effects="Gradually improves priorities of all long-waiting processes uniformly",
            potential_side_effects="May alter scheduled completion order of newly arrived short jobs",
            explanation="System-wide aging systematically prevents starvation across all waiting tasks"
        )
        candidates.append(p2)

        # Candidate 3: SWITCH_SCHEDULER
        current_sched = self.config.scheduler_algorithm
        target_sched = SchedulerType.ROUND_ROBIN if current_sched != SchedulerType.ROUND_ROBIN else SchedulerType.ADAPTIVE
        p3_eligible = current_sched in {SchedulerType.FCFS, SchedulerType.SJF, SchedulerType.PRIORITY}
        p3 = CandidateAction(
            action_type=RecoveryActionType.SWITCH_SCHEDULER,
            target_pids=[],
            parameters={"target_scheduler": target_sched.value},
            is_eligible=p3_eligible,
            rejection_reason=None if p3_eligible else f"Already operating under dynamic {current_sched.value} scheduler",
            expected_responsiveness_improvement=0.75 if alert.anomaly_type in {AnomalyType.EXCESSIVE_WAITING_TIME, AnomalyType.SUSTAINED_HIGH_CPU} else 0.40,
            expected_resource_relief=0.20,
            fairness_benefit=0.70,
            estimated_intervention_cost=0.20,
            estimated_fairness_harm=0.10,
            recovery_risk=0.15,
            confidence=0.78,
            expected_effects=f"Switches policy to {target_sched.value} providing time-sliced fair CPU sharing",
            potential_side_effects="Increases context switching overhead slightly",
            explanation="Time-sliced scheduling eliminates head-of-line blocking present in non-preemptive algorithms"
        )
        candidates.append(p3)

        # Candidate 4: ADJUST_TIME_QUANTUM
        new_q = max(2, self.config.time_quantum - 1) if alert.anomaly_type == AnomalyType.EXCESSIVE_WAITING_TIME else min(8, self.config.time_quantum + 2)
        p4_eligible = self.config.scheduler_algorithm in {SchedulerType.ROUND_ROBIN, SchedulerType.ADAPTIVE} and new_q != self.config.time_quantum
        p4 = CandidateAction(
            action_type=RecoveryActionType.ADJUST_TIME_QUANTUM,
            target_pids=[],
            parameters={"new_quantum": new_q},
            is_eligible=p4_eligible,
            rejection_reason=None if p4_eligible else "Current scheduler is not quantum-driven or quantum is already optimal",
            expected_responsiveness_improvement=0.70 if alert.anomaly_type == AnomalyType.EXCESSIVE_WAITING_TIME else 0.30,
            expected_resource_relief=0.25 if alert.anomaly_type == AnomalyType.SUSTAINED_HIGH_CPU else 0.10,
            fairness_benefit=0.60,
            estimated_intervention_cost=0.06,
            estimated_fairness_harm=0.04,
            recovery_risk=0.08,
            confidence=0.82,
            expected_effects=f"Tuning time quantum from {self.config.time_quantum} to {new_q} ticks",
            potential_side_effects="Slightly changes context-switch frequency",
            explanation="Modulating time slices restores queue rotation speed under waiting pressure"
        )
        candidates.append(p4)

        # Candidate 5: RECLAIM_MEMORY
        total_reclaimable = sum(p.reclaimable_memory for p in all_processes)
        p5_eligible = total_reclaimable > 0 and alert.anomaly_type == AnomalyType.HIGH_MEMORY_PRESSURE
        p5 = CandidateAction(
            action_type=RecoveryActionType.RECLAIM_MEMORY,
            target_pids=[p.pid for p in all_processes if p.reclaimable_memory > 0],
            parameters={"target_reclaim_mb": total_reclaimable},
            is_eligible=p5_eligible,
            rejection_reason=None if p5_eligible else "No reclaimable buffers or caches available across active processes",
            expected_responsiveness_improvement=0.30,
            expected_resource_relief=0.90 if alert.anomaly_type == AnomalyType.HIGH_MEMORY_PRESSURE else 0.10,
            fairness_benefit=0.20,
            estimated_intervention_cost=0.05,
            estimated_fairness_harm=0.00,
            recovery_risk=0.05,
            confidence=0.95 if alert.anomaly_type == AnomalyType.HIGH_MEMORY_PRESSURE else 0.30,
            expected_effects=f"Safely releases up to {total_reclaimable} MB of auxiliary non-essential memory",
            potential_side_effects="May require processes to reload auxiliary caches if needed later",
            explanation="Direct non-destructive memory reclamation relieves system memory saturation immediately"
        )
        candidates.append(p5)

        # Candidate 6: THROTTLE_ADMISSION
        pending_arrivals = [p for p in all_processes if p.arrival_time > metrics.simulation_time]
        p6_eligible = len(pending_arrivals) > 0 and alert.anomaly_type in {AnomalyType.SUSTAINED_HIGH_CPU, AnomalyType.HIGH_MEMORY_PRESSURE}
        p6 = CandidateAction(
            action_type=RecoveryActionType.THROTTLE_ADMISSION,
            target_pids=[p.pid for p in pending_arrivals],
            parameters={"delay_ticks": 4},
            is_eligible=p6_eligible,
            rejection_reason=None if p6_eligible else "No future arriving processes in workload queue to throttle",
            expected_responsiveness_improvement=0.45,
            expected_resource_relief=0.75,
            fairness_benefit=0.25,
            estimated_intervention_cost=0.15,
            estimated_fairness_harm=0.12,
            recovery_risk=0.18,
            confidence=0.75,
            expected_effects="Gates arrival of new processes by +4 ticks to give existing backlog time to complete",
            potential_side_effects="Delays start time of future arriving jobs",
            explanation="Admission control limits concurrent contention while system recovers"
        )
        candidates.append(p6)

        # Candidate 7: NO_INTERVENTION (Baseline option)
        p7 = CandidateAction(
            action_type=RecoveryActionType.NO_INTERVENTION,
            target_pids=[],
            parameters={},
            is_eligible=True,
            rejection_reason=None,
            expected_responsiveness_improvement=0.0,
            expected_resource_relief=0.0,
            fairness_benefit=0.0,
            estimated_intervention_cost=0.0,
            estimated_fairness_harm=0.0,
            recovery_risk=0.0,
            confidence=1.0,
            expected_effects="Preserves current operating state without introducing intervention overhead",
            potential_side_effects="Underlying anomaly condition may persist or escalate",
            explanation="Default baseline option when cost or risk of active intervention outweighs projected relief"
        )
        candidates.append(p7)

        # Calculate scores for all candidates
        for c in candidates:
            c.score = self.calculate_score(c)

        # Rank candidates: eligible first, then higher score, then lower risk, then lower cost
        def ranking_key(c: CandidateAction):
            return (
                1 if c.is_eligible else 0,
                c.score,
                -c.recovery_risk,
                -c.estimated_intervention_cost,
                -len(c.action_type.value)  # tie breaker
            )

        candidates.sort(key=ranking_key, reverse=True)
        return candidates
