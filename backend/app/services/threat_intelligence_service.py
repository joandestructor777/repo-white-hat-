import os
import re
import json
import logging
import urllib.request
from typing import Dict, Any, List
from app.schemas.threat_intel_schema import ThreatAnalysisResponse, SuggestedRule

logger = logging.getLogger("uvicorn.error")

class ThreatIntelligenceService:
    @classmethod
    def analyze_threat(cls, prompt_text: str, audit_id: int = None, client_ip: str = None) -> ThreatAnalysisResponse:
        """
        Analiza un vector de ataque o prompt sospechoso usando Inteligencia Artificial.
        Si hay una API Key de LLM configurada (GEMINI_API_KEY), invoca el modelo externo;
        en caso contrario o ante fallos de red, recurre al motor heurístico semántico local.
        """
        gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        if gemini_key:
            try:
                llm_result = cls._call_gemini_api(prompt_text, gemini_key)
                if llm_result:
                    return llm_result
            except Exception as e:
                logger.warning(f"[ThreatIntel AI] Error al invocar LLM externo ({e}). Usando motor autónomo de respaldo.")
        
        return cls._local_semantic_soc_analysis(prompt_text)

    @classmethod
    def _call_gemini_api(cls, prompt_text: str, api_key: str) -> ThreatAnalysisResponse:
        """Llama a la API de Google Gemini para análisis de inteligencia de ciberseguridad."""
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
        system_instruction = (
            "Eres un agente SOC experto en ciberseguridad defensiva para Large Language Models (OWASP LLM Top 10 y MITRE ATT&CK). "
            "Analiza el siguiente prompt de usuario potencialmente malicioso y responde estrictamente en JSON con la siguiente estructura: "
            "{"
            "'threat_classification': 'nombre del tipo de amenaza (ej. OWASP LLM01: Prompt Injection)', "
            "'confidence_score': 0.95, "
            "'mitre_technique': 'código y nombre MITRE (ej. T1059: Command and Scripting Interpreter)', "
            "'executive_summary': 'explicación clara de la táctica usada y cómo neutralizarla', "
            "'attack_vectors': ['vector 1', 'vector 2'], "
            "'suggested_rule': {"
            "  'name': 'nombre descriptivo de regla defensiva',"
            "  'keyword': 'palabra o frase clave a bloquear',"
            "  'pattern_type': 'CONTAINS',"
            "  'severity': 'HIGH',"
            "  'category': 'PROMPT_INJECTION',"
            "  'action': 'BLOCK',"
            "  'risk_score': 85,"
            "  'description': 'justificación de la regla'"
            "}"
            "}"
        )
        
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": f"{system_instruction}\n\nPrompt a analizar:\n\"\"\"{prompt_text}\"\"\""}
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.2,
                "responseMimeType": "application/json"
            }
        }
        
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode('utf-8'),
            headers={'Content-Type': 'application/json'},
            method='POST'
        )
        
        with urllib.request.urlopen(req, timeout=8) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            raw_text = res_data['candidates'][0]['content']['parts'][0]['text']
            parsed = json.loads(raw_text)
            
            sug = parsed.get("suggested_rule", {})
            suggested_rule = SuggestedRule(
                name=sug.get("name", "Regla Mitigación IA"),
                keyword=sug.get("keyword", prompt_text[:25].strip()),
                pattern_type=sug.get("pattern_type", "CONTAINS"),
                severity=sug.get("severity", "HIGH"),
                category=sug.get("category", "PROMPT_INJECTION"),
                action=sug.get("action", "BLOCK"),
                risk_score=int(sug.get("risk_score", 85)),
                description=sug.get("description", "Generada automáticamente por Agente SOC LLM")
            )
            
            return ThreatAnalysisResponse(
                threat_classification=parsed.get("threat_classification", "OWASP LLM01: Threat Detected"),
                confidence_score=float(parsed.get("confidence_score", 0.95)),
                mitre_technique=parsed.get("mitre_technique", "T1059: Prompt Manipulation"),
                executive_summary=parsed.get("executive_summary", "Análisis completado por LLM defensivo."),
                attack_vectors=parsed.get("attack_vectors", ["Prompt Injection"]),
                suggested_rule=suggested_rule,
                ai_engine="Google Gemini 1.5 Flash (Cloud LLM API)"
            )

    @classmethod
    def _local_semantic_soc_analysis(cls, prompt_text: str) -> ThreatAnalysisResponse:
        """Motor autónomo local de Threat Intelligence basado en clasificación semántica y patrones MITRE/OWASP."""
        p_lower = prompt_text.lower()
        
        # 1. Jailbreak / Roleplay
        if any(w in p_lower for w in ["ignore previous", "olvida las instrucciones", "ignora las directrices", "act as", "actúa como", "dan mode", "sin restricciones", "jailbreak"]):
            classification = "OWASP LLM01: Jailbreak & Roleplay Prompt Injection"
            mitre = "T1059: Interpreter Evasion / Role-Play Circumvention"
            confidence = 0.96
            summary = (
                "El atacante intenta despojar al asistente de sus directrices de seguridad forzando un cambio de contexto "
                "o asumiendo un rol sin restricciones ('Jailbreak'). Busca neutralizar la directriz raíz (System Prompt)."
            )
            vectors = ["Role-Play Circumvention", "Direct Prompt Injection", "Safety Guardrail Override"]
            keyword_match = "ignore previous" if "ignore" in p_lower else ("actúa como" if "actúa como" in p_lower else "jailbreak")
            rule = SuggestedRule(
                name="Defensa Anti-Jailbreak Contextual",
                keyword=keyword_match,
                pattern_type="CONTAINS",
                severity="CRITICAL",
                category="PROMPT_INJECTION",
                action="BLOCK",
                risk_score=95,
                description="Detecta intentos de sobreescritura de directrices del asistente virtual (OWASP LLM01)."
            )

        # 2. Extracción de Credenciales / Inyección de Datos / Exfiltración
        elif any(w in p_lower for w in ["drop table", "select *", "union select", "password", "contraseña", "secret_key", "api_key", "reveal system", "muéstrame las claves", "credenciales", "database"]):
            classification = "OWASP LLM06: Excessive Agency & Sensitive Data Exfiltration"
            mitre = "T1005: Data from Local System / Credential Extraction"
            confidence = 0.94
            summary = (
                "Se identificaron instrucciones orientadas a exfiltrar secretos de configuración, contraseñas del entorno "
                "o ejecutar sintaxis de inyección estructurada (SQLi/Data Leak) para acceder a información confidencial."
            )
            vectors = ["Credential Harvest Attempt", "SQL Injection Vector", "Environment Variable Reconnaissance"]
            keyword_match = "drop table" if "drop table" in p_lower else ("password" if "password" in p_lower else "reveal system")
            rule = SuggestedRule(
                name="Filtro de Exfiltración de Credenciales",
                keyword=keyword_match,
                pattern_type="CONTAINS",
                severity="CRITICAL",
                category="DATA_EXFILTRATION",
                action="BLOCK",
                risk_score=90,
                description="Neutraliza peticiones orientadas a fuga de contraseñas o inyección de comandos."
            )

        # 3. Reconocimiento y Sondeo
        elif any(w in p_lower for w in ["quién te programó", "qué reglas tienes", "system prompt", "cuál es tu prompt", "muestra tus instrucciones"]):
            classification = "OWASP LLM07: System Prompt Leakage & Architecture Reconnaissance"
            mitre = "T1592: Gather Victim Host Information / Prompt Leak"
            confidence = 0.89
            summary = (
                "Petición de reconocimiento pasivo orientada a revelar el System Prompt interno de la aplicación. "
                "El atacante busca conocer los límites defensivos para preparar un ataque de segunda fase."
            )
            vectors = ["Prompt Leakage Recon", "Guardrail Enumeration"]
            rule = SuggestedRule(
                name="Bloqueo de Reconocimiento de System Prompt",
                keyword="system prompt" if "system prompt" in p_lower else "instrucciones",
                pattern_type="CONTAINS",
                severity="HIGH",
                category="SYSTEM_PROMPT_LEAK",
                action="BLOCK",
                risk_score=80,
                description="Previene la fuga del System Prompt corporativo y de la lógica defensiva."
            )

        # 4. Prompt genérico sospechoso
        else:
            classification = "OWASP LLM01: Anomalous Prompt Heuristics"
            mitre = "T1204: User Execution / Untrusted Input"
            confidence = 0.78
            summary = (
                "El prompt analizado presenta anomalías en su estructura o intención en relación con el vocabulario habitual. "
                "Se recomienda monitoreo activo y aplicación preventiva de regla de contención."
            )
            vectors = ["Uncategorized Suspicious Input"]
            clean_kw = re.sub(r'[^a-zA-Z0-9\s]', '', prompt_text).strip()
            kw = clean_kw[:20].lower() if clean_kw else "suspicious_payload"
            rule = SuggestedRule(
                name=f"Contención Heurística: {kw[:15]}",
                keyword=kw,
                pattern_type="CONTAINS",
                severity="MEDIUM",
                category="PROMPT_INJECTION",
                action="FLAG",
                risk_score=60,
                description="Regla preventiva generada por detección de anomalías sintácticas."
            )

        return ThreatAnalysisResponse(
            threat_classification=classification,
            confidence_score=confidence,
            mitre_technique=mitre,
            executive_summary=summary,
            attack_vectors=vectors,
            suggested_rule=rule,
            ai_engine="Autonomous SOC Threat Intel Engine (Local NLP & Heuristics)"
        )
