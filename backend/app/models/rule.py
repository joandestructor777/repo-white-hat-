from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from app.core.database import Base

class SecurityRule(Base):
    __tablename__ = "security_rules"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    keyword = Column(String(255), nullable=False, index=True)
    pattern_type = Column(String(50), default="CONTAINS")
    category = Column(String(100), nullable=False)
    severity = Column(String(50), nullable=False, default="HIGH")
    action = Column(String(50), nullable=False, default="BLOCK")
    risk_score = Column(Integer, default=75)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
