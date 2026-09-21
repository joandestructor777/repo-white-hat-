from typing import List, Dict
from pydantic import BaseModel
from app.schemas.audit_schema import SecurityAuditLogResponse

class DashboardStatsResponse(BaseModel):
    total_scans: int
    total_blocked: int
    total_flagged: int
    total_allowed: int
    block_rate: float
    average_risk_score: float
    category_distribution: Dict[str, int]
    severity_distribution: Dict[str, int]
    recent_events: List[SecurityAuditLogResponse]
