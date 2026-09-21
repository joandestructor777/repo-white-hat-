import json
from typing import List, Optional, Dict
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from app.models.audit_log import SecurityAuditLog
from app.schemas.audit_schema import SecurityAuditLogResponse
from app.schemas.dashboard_schema import DashboardStatsResponse

class AuditService:
    @staticmethod
    def log_interaction(
        db: Session,
        prompt: str,
        blocked: bool,
        action_taken: str,
        risk_score: int,
        highest_severity: str,
        detected_keywords: List[str],
        threat_categories: List[str],
        response_text: str,
        mitigation_reason: Optional[str] = None,
        client_ip: str = "127.0.0.1"
    ) -> SecurityAuditLog:
        log_entry = SecurityAuditLog(
            client_ip=client_ip,
            prompt_text=prompt,
            blocked=blocked,
            action_taken=action_taken,
            risk_score=risk_score,
            highest_severity=highest_severity,
            detected_keywords=json.dumps(detected_keywords, ensure_ascii=False),
            threat_categories=json.dumps(threat_categories, ensure_ascii=False),
            response_text=response_text,
            mitigation_reason=mitigation_reason
        )
        db.add(log_entry)
        db.commit()
        db.refresh(log_entry)
        return log_entry

    @staticmethod
    def format_log(log: SecurityAuditLog) -> SecurityAuditLogResponse:
        try:
            kws = json.loads(log.detected_keywords) if log.detected_keywords else []
        except:
            kws = [log.detected_keywords] if log.detected_keywords else []

        try:
            cats = json.loads(log.threat_categories) if log.threat_categories else []
        except:
            cats = [log.threat_categories] if log.threat_categories else []

        return SecurityAuditLogResponse(
            id=log.id,
            client_ip=log.client_ip or "127.0.0.1",
            prompt_text=log.prompt_text,
            blocked=log.blocked,
            action_taken=log.action_taken,
            risk_score=log.risk_score,
            highest_severity=log.highest_severity or "NONE",
            detected_keywords=kws,
            threat_categories=cats,
            response_text=log.response_text,
            mitigation_reason=log.mitigation_reason,
            created_at=log.created_at
        )

    @classmethod
    def get_logs(cls, db: Session, limit: int = 50, blocked_only: bool = False) -> List[SecurityAuditLogResponse]:
        query = db.query(SecurityAuditLog)
        if blocked_only:
            query = query.filter(SecurityAuditLog.blocked == True)
        raw_logs = query.order_by(desc(SecurityAuditLog.created_at)).limit(limit).all()
        return [cls.format_log(l) for l in raw_logs]

    @classmethod
    def get_stats(cls, db: Session) -> DashboardStatsResponse:
        total_scans = db.query(SecurityAuditLog).count()
        total_blocked = db.query(SecurityAuditLog).filter(SecurityAuditLog.blocked == True).count()
        total_flagged = db.query(SecurityAuditLog).filter(SecurityAuditLog.action_taken == "FLAGGED").count()
        total_allowed = db.query(SecurityAuditLog).filter(SecurityAuditLog.blocked == False, SecurityAuditLog.action_taken != "FLAGGED").count()

        block_rate = round((total_blocked / total_scans * 100), 1) if total_scans > 0 else 0.0
        
        avg_score_res = db.query(func.avg(SecurityAuditLog.risk_score)).scalar()
        avg_risk_score = round(float(avg_score_res or 0), 1)

        # Category and severity distribution
        category_dist: Dict[str, int] = {}
        severity_dist: Dict[str, int] = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0, "NONE": 0}

        logs = db.query(SecurityAuditLog).all()
        for log in logs:
            if log.highest_severity in severity_dist:
                severity_dist[log.highest_severity] += 1
            
            try:
                cats = json.loads(log.threat_categories) if log.threat_categories else []
                for c in cats:
                    category_dist[c] = category_dist.get(c, 0) + 1
            except:
                pass

        recent = cls.get_logs(db, limit=8)

        return DashboardStatsResponse(
            total_scans=total_scans,
            total_blocked=total_blocked,
            total_flagged=total_flagged,
            total_allowed=total_allowed,
            block_rate=block_rate,
            average_risk_score=avg_risk_score,
            category_distribution=category_dist,
            severity_distribution=severity_dist,
            recent_events=recent
        )
