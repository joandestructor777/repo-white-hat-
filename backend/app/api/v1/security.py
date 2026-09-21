from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.rule import SecurityRule
from app.core.security_engine import SecurityEngine
from app.schemas.assistant_schema import SecurityInspectionResult, ChatMessageRequest
from app.schemas.audit_schema import SecurityAuditLogResponse
from app.services.audit_service import AuditService

router = APIRouter(prefix="/security", tags=["Cybersecurity Engine & Audits"])

@router.post("/inspect", response_model=SecurityInspectionResult, summary="Inspeccionar texto contra motor de ciberseguridad")
def inspect_text(payload: ChatMessageRequest, db: Session = Depends(get_db)):
    """
    Evalúa en tiempo real un prompt o texto libre contra las reglas activas de la base de datos,
    calculando puntaje de riesgo, severidad máxima y palabras clave detectadas.
    """
    rules = db.query(SecurityRule).filter(SecurityRule.is_active == True).all()
    return SecurityEngine.inspect(payload.message, rules)

@router.get("/audits", response_model=List[SecurityAuditLogResponse], summary="Consultar bitácora de auditoría de incidentes")
def list_audit_logs(
    limit: int = Query(50, ge=1, le=200),
    blocked_only: bool = Query(False, description="Filtrar solo solicitudes bloqueadas"),
    db: Session = Depends(get_db)
):
    """
    Retorna el historial completo de intentos de interacción, alertamientos y bloqueos de seguridad.
    """
    return AuditService.get_logs(db=db, limit=limit, blocked_only=blocked_only)
