from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.core.security import get_current_user, require_write_role, require_roles
from app.schemas.rule_schema import SecurityRuleCreate, SecurityRuleUpdate, SecurityRuleResponse
from app.services.rule_service import RuleService

router = APIRouter(prefix="/rules", tags=["Security Rules (CRUD Protegido)"])

# Endpoints de lectura públicos (según rúbrica del proyecto)
@router.get("", response_model=List[SecurityRuleResponse])
def list_rules(
    category: Optional[str] = None,
    severity: Optional[str] = None,
    active_only: bool = False,
    db: Session = Depends(get_db)
):
    """Listado de reglas de seguridad (público para lectura)."""
    return RuleService.get_all(db, category=category, severity=severity, active_only=active_only)

@router.get("/{rule_id}", response_model=SecurityRuleResponse)
def get_rule(rule_id: int, db: Session = Depends(get_db)):
    """Detalle de regla de seguridad (público para lectura)."""
    rule = RuleService.get_by_id(db, rule_id)
    if not rule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Regla de seguridad no encontrada")
    return rule

# Endpoints de modificación protegidos por autenticación JWT y Roles (RBAC)
@router.post("", response_model=SecurityRuleResponse, status_code=status.HTTP_201_CREATED)
def create_rule(
    rule_in: SecurityRuleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_write_role)
):
    """Creación de regla (requiere rol con permisos de escritura: Admin, SOC Lead, Sec Engineer)."""
    return RuleService.create(db, rule_in)

@router.put("/{rule_id}", response_model=SecurityRuleResponse)
def update_rule(
    rule_id: int,
    rule_in: SecurityRuleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_write_role)
):
    """Actualización de regla (requiere rol con permisos de escritura: Admin, SOC Lead, Sec Engineer)."""
    updated = RuleService.update(db, rule_id, rule_in)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Regla no encontrada para actualizar")
    return updated

@router.delete("/{rule_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_rule(
    rule_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Administrator", "Admin", "SOC Lead Analyst"]))
):
    """Eliminación de regla (requiere privilegios de Admin o SOC Lead Analyst)."""
    success = RuleService.delete(db, rule_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Regla no encontrada para eliminar")
    return None

@router.post("/seed/defaults")
def seed_rules(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_write_role)
):
    """Siembra de reglas por defecto (requiere rol con permisos de escritura)."""
    count = RuleService.seed_defaults(db)
    return {"message": f"Se sembraron {count} reglas de ciberseguridad con éxito", "added": count}
