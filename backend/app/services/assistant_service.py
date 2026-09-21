import random
from typing import Tuple
from sqlalchemy.orm import Session
from app.models.rule import SecurityRule
from app.core.security_engine import SecurityEngine
from app.services.audit_service import AuditService
from app.schemas.assistant_schema import AssistantChatResponse, SecurityInspectionResult

SAFE_KNOWLEDGE_BASE = [
    {
        "triggers": ["hola", "buenos dias", "buenas tardes", "saludos"],
        "reply": "¡Hola! Bienvenido a NexaSentry Technologies. Soy tu asistente virtual corporativo. ¿En qué puedo ayudarte hoy sobre nuestros servicios, productos o soporte técnico?"
    },
    {
        "triggers": ["precio", "costo", "planes", "tarifas", "cotizar"],
        "reply": "Nuestros planes para empresas inician desde $49 USD/mes en el plan Starter, $149 USD/mes en el plan Pro para equipos, y cotizaciones a la medida para planes Enterprise con soporte 24/7."
    },
    {
        "triggers": ["horario", "atencion", "abierto", "soporte"],
        "reply": "Nuestro equipo de atención al cliente está disponible de lunes a viernes de 8:00 AM a 7:00 PM (hora local), y soporte crítico para incidentes 24 horas al día los 7 días de la semana."
    },
    {
        "triggers": ["servicios", "que hacen", "que ofrecen", "empresa"],
        "reply": "En NexaSentry ofrecemos soluciones en ciberseguridad para aplicaciones web, auditoría de vulnerabilidades, protección perimetral para inteligencia artificial y monitorización en tiempo real."
    }
]

GENERIC_SAFE_REPLIES = [
    "Gracias por tu consulta. Como asistente oficial, estoy para resolver dudas sobre nuestra plataforma, planes comerciales o soporte técnico.",
    "Entendido. Con gusto puedo orientarte sobre las soluciones que ofrecemos en nuestra plataforma web.",
    "He recibido tu mensaje. ¿Hay alguna función o servicio específico sobre el que te gustaría que te brinde más detalles?"
]

class AssistantService:
    @classmethod
    def process_chat(
        cls,
        db: Session,
        prompt: str,
        client_ip: str = "127.0.0.1"
    ) -> AssistantChatResponse:
        # 1. Obtener todas las reglas de seguridad activas desde la base de datos
        active_rules = db.query(SecurityRule).filter(SecurityRule.is_active == True).all()

        # 2. Ejecutar inspección con el motor de ciberseguridad
        security_eval: SecurityInspectionResult = SecurityEngine.inspect(prompt, active_rules)

        # 3. Determinar respuesta y acción tomada
        if security_eval.blocked:
            action_taken = "BLOCKED"
            reply = (
                "[403 FORBIDDEN - POLICY VIOLATION] Solicitud bloqueada por la capa de seguridad perimetral. "
                "El mensaje contiene patrones asociados a extracción no autorizada de directivas o credenciales de la aplicación. "
                "Este evento ha sido registrado con fines de auditoría y control de acceso."
            )
        elif security_eval.triggered_rules:
            action_taken = "FLAGGED"
            reply = (
                "[AVISO DE AUDITORÍA]: La consulta contiene términos bajo monitoreo preventivo de seguridad. "
                "El asistente procesará únicamente solicitudes legítimas relacionadas con la plataforma corporativa. "
                "¿En qué podemos colaborar con tu requerimiento comercial o técnico?"
            )
        else:
            action_taken = "ALLOWED"
            reply = cls._generate_safe_reply(prompt)

        # 4. Registrar en la base de datos (Auditoría)
        kws = [r.keyword for r in security_eval.triggered_rules]
        cats = security_eval.categories_detected

        audit_entry = AuditService.log_interaction(
            db=db,
            prompt=prompt,
            blocked=security_eval.blocked,
            action_taken=action_taken,
            risk_score=security_eval.risk_score,
            highest_severity=security_eval.highest_severity,
            detected_keywords=kws,
            threat_categories=cats,
            response_text=reply,
            mitigation_reason=security_eval.mitigation_reason,
            client_ip=client_ip
        )

        return AssistantChatResponse(
            reply=reply,
            security_eval=security_eval,
            blocked=security_eval.blocked,
            audit_id=audit_entry.id
        )

    @classmethod
    def _generate_safe_reply(cls, prompt: str) -> str:
        prompt_lower = prompt.lower()
        for item in SAFE_KNOWLEDGE_BASE:
            for trigger in item["triggers"]:
                if trigger in prompt_lower:
                    return item["reply"]
        return random.choice(GENERIC_SAFE_REPLIES)
