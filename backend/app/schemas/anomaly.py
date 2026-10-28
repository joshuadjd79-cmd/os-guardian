from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class AnomalyType(str, Enum):
    SUSTAINED_HIGH_CPU = "SUSTAINED_HIGH_CPU"
    HIGH_MEMORY_PRESSURE = "HIGH_MEMORY_PRESSURE"
    EXCESSIVE_WAITING_TIME = "EXCESSIVE_WAITING_TIME"
    UNRESPONSIVE_PROCESS = "UNRESPONSIVE_PROCESS"
    STARVATION_RISK = "STARVATION_RISK"
    RECOVERY_FAILURE = "RECOVERY_FAILURE"


class AnomalySeverity(str, Enum):
    INFO = "INFO"
    WARNING = "WARNING"
    CRITICAL = "CRITICAL"


class AnomalyStatus(str, Enum):
    ACTIVE = "ACTIVE"
    INVESTIGATING = "INVESTIGATING"
    RECOVERED = "RECOVERED"
    DISMISSED = "DISMISSED"
    COOLDOWN = "COOLDOWN"


class AnomalyAlert(BaseModel):
    id: str
    timestamp: int
    anomaly_type: AnomalyType
    severity: AnomalySeverity
    description: str
    evidence: Dict[str, Any] = Field(default_factory=dict, description="Numerical evidence: metric value, threshold, window size")
    affected_pids: List[int] = Field(default_factory=list)
    status: AnomalyStatus = AnomalyStatus.ACTIVE
    first_detected_time: int
    last_detected_time: int
    resolution_time: Optional[int] = None
    resolution_details: Optional[str] = None
    recommended_action: Optional[str] = None
