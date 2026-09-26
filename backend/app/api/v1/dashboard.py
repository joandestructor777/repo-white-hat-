from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.dashboard_schema import DashboardStatsResponse
from app.services.audit_service import AuditService

router = APIRouter(prefix="/dashboard", tags=["SOC Metrics & Dashboard"])

@router.get("/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(db: Session = Depends(get_db)):
    return AuditService.get_stats(db=db)
