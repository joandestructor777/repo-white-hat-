from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.core.security import get_current_user, require_write_role
from app.core.metrics import AI_INFERENCES_TOTAL, AI_THREATS_IDENTIFIED, THREAT_RISK_GAUGE
from app.schemas.threat_intel_schema import (
    ThreatAnalysisRequest,
    ThreatAnalysisResponse,
    SuggestedRule
)
from app.schemas.rule_schema import SecurityRuleCreate, SecurityRuleResponse
from app.services.threat_intelligence_service import ThreatIntelligenceService
from app.services.rule_service import RuleService

router = APIRouter(prefix="/threat-intelligence", tags=["IA - Threat Intelligence & Agente SOC"])

@router.post("/analyze", response_model=ThreatAnalysisResponse)
def analyze_threat_payload(payload: ThreatAnalysisRequest):
    """
    Endpoint de Inteligencia Artificial que analiza un vector de ataque,
    identifica tácticas MITRE ATT&CK / OWASP LLM y genera una regla de mitigación recomendada.
    Registra métricas en tiempo real en Prometheus.
    """
    if not payload.prompt_text or not payload.prompt_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Debe proporcionar un texto o prompt para analizar"
        )
    
    # Registrar métrica de inferencia de IA en Prometheus
    AI_INFERENCES_TOTAL.inc()
    
    result = ThreatIntelligenceService.analyze_threat(
        prompt_text=payload.prompt_text,
        audit_id=payload.audit_id,
        client_ip=payload.client_ip
    )
    
    # Actualizar Gauge de riesgo y contador de amenazas en Prometheus
    risk = result.suggested_rule.risk_score
    THREAT_RISK_GAUGE.set(risk)
    if risk >= 40:
        AI_THREATS_IDENTIFIED.inc()
        
    return result

@router.post("/apply-suggested-rule", response_model=SecurityRuleResponse, status_code=status.HTTP_201_CREATED)
def apply_suggested_rule(
    rule_data: SuggestedRule,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_write_role)
):
    """
    Aplica inmediatamente la regla de seguridad generada por la IA al perimeter gateway.
    Requiere que el analista esté debidamente autenticado con token JWT.
    """
    rule_create = SecurityRuleCreate(
        name=rule_data.name,
        keyword=rule_data.keyword,
        pattern_type=rule_data.pattern_type,
        severity=rule_data.severity,
        category=rule_data.category,
        action=rule_data.action,
        risk_score=rule_data.risk_score,
        description=rule_data.description
    )
    return RuleService.create(db, rule_create)
