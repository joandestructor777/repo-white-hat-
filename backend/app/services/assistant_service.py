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
        "reply": "¡Hola! Bienvenido a CompenHack. Soy tu asistente virtual de bienestar integral. ¿En qué puedo ayudarte hoy con tus citas médicas, subsidio o servicios de recreación?"
    },
    {
        "triggers": ["cita", "medico", "medica", "salud", "doctor", "odontologia"],
        "reply": "Para agendar tu cita médica en CompenHack Salud, puedes solicitar medicina general, odontología y laboratorio ingresando con tu número de documento en la sección de citas o llamando a nuestra línea 601 3077001."
    },
    {
        "triggers": ["subsidio", "cuota", "monetario", "pago", "giro"],
        "reply": "El subsidio monetario de CompenHack se consigna durante los primeros días hábiles de cada mes a tu cuenta bancaria o billetera móvil registrada para trabajadores con categoría A y B."
    },
    {
        "triggers": ["recreacion", "piscina", "sede", "hotel", "pasadia", "parque"],
        "reply": "Contamos con sedes recreativas y deportivas en Calle 26, Suba, Autopista Sur y hoteles en Girardot. Puedes reservar tus pasadías con descuento especial según tu categoría de afiliación."
    },
    {
        "triggers": ["precio", "costo", "planes", "tarifas", "cotizar"],
        "reply": "Nuestras tarifas están subsidiadas según la categoría de afiliación (A, B o C) para afiliados y beneficiarios. Consulta la tabla de copagos en nuestro portal."
    },
    {
        "triggers": ["horario", "atencion", "abierto", "soporte"],
        "reply": "Nuestras sedes de atención están abiertas de lunes a viernes de 7:00 AM a 6:00 PM y sábados de 8:00 AM a 1:00 PM. Nuestro asistente digital atiende las 24 horas."
    }
]

GENERIC_SAFE_REPLIES = [
    "Gracias por comunicarte con CompenHack. Con gusto puedo orientarte sobre citas médicas, subsidios o actividades familiares.",
    "He recibido tu mensaje. ¿Deseas información sobre afiliaciones, trámites de salud o recreación en CompenHack?",
    "Entendido. Como asistente virtual de CompenHack, estoy para orientarte en todos los servicios de bienestar para ti y tu familia."
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
