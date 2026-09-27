from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class SecurityRuleBase(BaseModel):
    name: str = Field(..., example="Bloquear extracción de System Prompt")
    keyword: str = Field(..., example="ignore previous instructions")
    pattern_type: str = Field(default="CONTAINS", example="CONTAINS")
    category: str = Field(..., example="PROMPT_INJECTION")
    severity: str = Field(default="HIGH", example="HIGH")
    action: str = Field(default="BLOCK", example="BLOCK")
    risk_score: int = Field(default=80, ge=1, le=100)
    description: Optional[str] = Field(None, example="Detecta intentos de bypass de directivas del sistema del asistente")
    is_active: bool = Field(default=True)

class SecurityRuleCreate(SecurityRuleBase):
    pass

class SecurityRuleUpdate(BaseModel):
    name: Optional[str] = None
    keyword: Optional[str] = None
    pattern_type: Optional[str] = None
    category: Optional[str] = None
    severity: Optional[str] = None
    action: Optional[str] = None
    risk_score: Optional[int] = Field(None, ge=1, le=100)
    description: Optional[str] = None
    is_active: Optional[bool] = None

class SecurityRuleResponse(SecurityRuleBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
