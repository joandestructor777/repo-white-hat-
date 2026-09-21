from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.rule import SecurityRule
from app.schemas.rule_schema import SecurityRuleCreate, SecurityRuleUpdate
from app.seeds.default_rules import SEED_RULES

class RuleService:
    @staticmethod
    def get_all(db: Session, category: Optional[str] = None, severity: Optional[str] = None, active_only: bool = False) -> List[SecurityRule]:
        query = db.query(SecurityRule)
        if category:
            query = query.filter(SecurityRule.category == category)
        if severity:
            query = query.filter(SecurityRule.severity == severity)
        if active_only:
            query = query.filter(SecurityRule.is_active == True)
        return query.order_by(SecurityRule.id.desc()).all()

    @staticmethod
    def get_by_id(db: Session, rule_id: int) -> Optional[SecurityRule]:
        return db.query(SecurityRule).filter(SecurityRule.id == rule_id).first()

    @staticmethod
    def create(db: Session, rule_in: SecurityRuleCreate) -> SecurityRule:
        db_rule = SecurityRule(**rule_in.model_dump())
        db.add(db_rule)
        db.commit()
        db.refresh(db_rule)
        return db_rule

    @staticmethod
    def update(db: Session, rule_id: int, rule_in: SecurityRuleUpdate) -> Optional[SecurityRule]:
        db_rule = db.query(SecurityRule).filter(SecurityRule.id == rule_id).first()
        if not db_rule:
            return None
        
        update_data = rule_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_rule, field, value)
        
        db.commit()
        db.refresh(db_rule)
        return db_rule

    @staticmethod
    def delete(db: Session, rule_id: int) -> bool:
        db_rule = db.query(SecurityRule).filter(SecurityRule.id == rule_id).first()
        if not db_rule:
            return False
        db.delete(db_rule)
        db.commit()
        return True

    @staticmethod
    def seed_defaults(db: Session) -> int:
        added = 0
        for item in SEED_RULES:
            exists = db.query(SecurityRule).filter(SecurityRule.keyword == item["keyword"]).first()
            if not exists:
                db.add(SecurityRule(**item))
                added += 1
        db.commit()
        return added
