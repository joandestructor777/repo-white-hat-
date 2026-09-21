from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

class SecurityAuditLogResponse(BaseModel):
    id: int
    client_ip: str
    prompt_text: str
    blocked: bool
    action_taken: str
    risk_score: int
    highest_severity: str
    detected_keywords: List[str]
    threat_categories: List[str]
    response_text: Optional[str] = None
    mitigation_reason: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
