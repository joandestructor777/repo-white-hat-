from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.rule_schema import SecurityRuleCreate, SecurityRuleUpdate, SecurityRuleResponse
from app.services.rule_service import RuleService

router = APIRouter(prefix="/rules", tags=["Security Rules (CRUD)"])

@router.get("", response_model=List[SecurityRuleResponse], summary="Listar reglas de seguridad")
def list_rules(
    category: Optional[str] = Query(None, description="Filtrar por categoría de amenaza"),
    severity: Optional[str] = Query(None, description="Filtrar por nivel de severidad"),
    active_only: bool = Query(False, description="Solo mostrar reglas activas"),
    db: Session = Depends(get_db)
):
    """
    Obtiene la lista de todas las palabras clave y patrones de ciberseguridad configurados en la base de datos PostgreSQL.
    """
    return RuleService.get_all(db, category=category, severity=severity, active_only=active_only)

@router.post("", response_model=SecurityRuleResponse, status_code=status.HTTP_201_CREATED, summary="Crear nueva regla de seguridad")
def create_rule(rule_in: SecurityRuleCreate, db: Session = Depends(get_db)):
    """
    Crea una nueva regla o palabra clave protegida para el asistente virtual.
    """
    return RuleService.create(db, rule_in)

@router.get("/{rule_id}", response_model=SecurityRuleResponse, summary="Obtener detalle de una regla")
def get_rule(rule_id: int, db: Session = Depends(get_db)):
    rule = RuleService.get_by_id(db, rule_id)
    if not rule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Regla de seguridad no encontrada")
    return rule

@router.put("/{rule_id}", response_model=SecurityRuleResponse, summary="Actualizar regla existente")
def update_rule(rule_id: int, rule_in: SecurityRuleUpdate, db: Session = Depends(get_db)):
    updated = RuleService.update(db, rule_id, rule_in)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Regla no encontrada para actualizar")
    return updated

@router.delete("/{rule_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Eliminar regla de seguridad")
def delete_rule(rule_id: int, db: Session = Depends(get_db)):
    success = RuleService.delete(db, rule_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Regla no encontrada para eliminar")
    return None

@router.post("/seed/defaults", summary="Restaurar o sembrar reglas OWASP por defecto")
def seed_rules(db: Session = Depends(get_db)):
    count = RuleService.seed_defaults(db)
    return {"message": f"Se sembraron {count} reglas de ciberseguridad con éxito", "added": count}
