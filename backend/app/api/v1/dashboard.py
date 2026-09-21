from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.dashboard_schema import DashboardStatsResponse
from app.services.audit_service import AuditService

router = APIRouter(prefix="/dashboard", tags=["SOC Metrics & Dashboard"])

@router.get("/stats", response_model=DashboardStatsResponse, summary="Obtener métricas consolidadas del centro de ciberseguridad")
def get_dashboard_stats(db: Session = Depends(get_db)):
    """
    Entrega indicadores clave de rendimiento (KPIs) de ciberseguridad:
    total de escaneos, tasa de bloqueo, distribución por categoría de ataque y eventos recientes.
    """
    return AuditService.get_stats(db=db)
