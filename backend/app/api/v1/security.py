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

@router.post("/inspect", response_model=SecurityInspectionResult)
def inspect_text(payload: ChatMessageRequest, db: Session = Depends(get_db)):
    rules = db.query(SecurityRule).filter(SecurityRule.is_active == True).all()
    return SecurityEngine.inspect(payload.message, rules)

@router.get("/audits", response_model=List[SecurityAuditLogResponse])
def list_audit_logs(
    limit: int = Query(50, ge=1, le=200),
    blocked_only: bool = Query(False),
    db: Session = Depends(get_db)
):
    return AuditService.get_logs(db=db, limit=limit, blocked_only=blocked_only)
