from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

class ThreatAnalysisRequest(BaseModel):
    prompt_text: str = Field(..., description="Prompt sospechoso o texto del log de auditoría a analizar")
    audit_id: Optional[int] = Field(None, description="ID del log de auditoría forense si proviene de la bitácora")
    client_ip: Optional[str] = Field(None, description="IP del cliente emisor")

class SuggestedRule(BaseModel):
    name: str
    keyword: str
    pattern_type: str = "CONTAINS"
    severity: str = "HIGH"
    category: str = "PROMPT_INJECTION"
    action: str = "BLOCK"
    risk_score: int = 85
    description: str

class ThreatAnalysisResponse(BaseModel):
    threat_classification: str
    confidence_score: float
    mitre_technique: str
    executive_summary: str
    attack_vectors: List[str]
    suggested_rule: SuggestedRule
    ai_engine: str
    analyzed_at: datetime = Field(default_factory=datetime.utcnow)
