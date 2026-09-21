from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from app.core.database import Base

class SecurityRule(Base):
    __tablename__ = "security_rules"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    keyword = Column(String(255), nullable=False, index=True)
    pattern_type = Column(String(50), default="CONTAINS")  # CONTAINS, EXACT, REGEX, FUZZY
    category = Column(String(100), nullable=False)  # PROMPT_INJECTION, SYSTEM_PROMPT_LEAK, CREDENTIAL_HARVESTING, DATA_EXFILTRATION, JAILBREAK, SQL_COMMAND_INJECTION
    severity = Column(String(50), nullable=False, default="HIGH")  # LOW, MEDIUM, HIGH, CRITICAL
    action = Column(String(50), nullable=False, default="BLOCK")  # BLOCK, SANITIZE, FLAG_AND_LOG
    risk_score = Column(Integer, default=75)  # 1-100
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
