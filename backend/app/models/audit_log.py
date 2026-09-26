from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from app.core.database import Base

class SecurityAuditLog(Base):
    __tablename__ = "security_audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    client_ip = Column(String(50), default="127.0.0.1")
    prompt_text = Column(Text, nullable=False)
    blocked = Column(Boolean, default=False)
    action_taken = Column(String(50), default="ALLOWED")
    risk_score = Column(Integer, default=0)
    highest_severity = Column(String(50), default="NONE")
    detected_keywords = Column(Text, default="[]")
    threat_categories = Column(Text, default="[]")
    response_text = Column(Text, nullable=True)
    mitigation_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
