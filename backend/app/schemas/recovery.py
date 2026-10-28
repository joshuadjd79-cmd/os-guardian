from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class RecoveryActionType(str, Enum):
    ADJUST_PRIORITY = "ADJUST_PRIORITY"
    APPLY_AGING = "APPLY_AGING"
    SWITCH_SCHEDULER = "SWITCH_SCHEDULER"
    ADJUST_TIME_QUANTUM = "ADJUST_TIME_QUANTUM"
    RECLAIM_MEMORY = "RECLAIM_MEMORY"
    THROTTLE_ADMISSION = "THROTTLE_ADMISSION"
    NO_INTERVENTION = "NO_INTERVENTION"


class ActionOutcome(str, Enum):
    PENDING = "PENDING"
    SUCCESS = "SUCCESS"
    PARTIAL_IMPROVEMENT = "PARTIAL_IMPROVEMENT"
    NO_IMPROVEMENT = "NO_IMPROVEMENT"
    REGRESSION = "REGRESSION"


class CandidateAction(BaseModel):
    action_type: RecoveryActionType
    target_pids: List[int] = Field(default_factory=list)
    parameters: Dict[str, Any] = Field(default_factory=dict)
    
    # Precondition status
    is_eligible: bool = True
    rejection_reason: Optional[str] = None
    
    # Expected benefits (0.0 to 1.0, higher is better)
    expected_responsiveness_improvement: float = Field(0.0, ge=0.0, le=1.0)
    expected_resource_relief: float = Field(0.0, ge=0.0, le=1.0)
    fairness_benefit: float = Field(0.0, ge=0.0, le=1.0)
    
    # Expected costs and risks (0.0 to 1.0, lower is better)
    estimated_intervention_cost: float = Field(0.0, ge=0.0, le=1.0)
    estimated_fairness_harm: float = Field(0.0, ge=0.0, le=1.0)
    recovery_risk: float = Field(0.0, ge=0.0, le=1.0)
    
    # Calculated score and confidence
    score: float = 0.0
    confidence: float = Field(0.0, ge=0.0, le=1.0, description="Rule-based evidence confidence index")
    
    # Human-readable justification
    expected_effects: str
    potential_side_effects: str
    explanation: str


class RecoveryDecisionRecord(BaseModel):
    decision_id: str
    timestamp: int
    triggering_anomaly_id: str
    triggering_anomaly_type: str
    affected_pids: List[int] = Field(default_factory=list)
    
    baseline_metrics: Dict[str, Any] = Field(default_factory=dict)
    candidates_evaluated: List[CandidateAction] = Field(default_factory=list)
    chosen_action: CandidateAction
    
    # Execution
    was_applied: bool = False
    is_manual_approval_required: bool = False
    approved: bool = False
    applied_timestamp: Optional[int] = None
    
    # Outcome tracking after observation window
    post_action_metrics: Optional[Dict[str, Any]] = None
    evaluation_timestamp: Optional[int] = None
    outcome: ActionOutcome = ActionOutcome.PENDING
    outcome_narrative: Optional[str] = None
