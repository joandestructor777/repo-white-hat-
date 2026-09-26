import re
import unicodedata
from typing import List
from app.models.rule import SecurityRule
from app.schemas.assistant_schema import DetectedKeywordMatch, SecurityInspectionResult
from app.core.config import settings

def normalize_text(text: str) -> str:
    text = text.lower()
    return unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('utf-8')

def deobfuscate_spacing(text: str) -> str:
    return re.sub(r'(?<=\b\w)\s(?=\w\b)', '', text)

class SecurityEngine:
    SEVERITY_WEIGHTS = {
        "CRITICAL": 95,
        "HIGH": 80,
        "MEDIUM": 50,
        "LOW": 25,
        "NONE": 0
    }

    SEVERITY_ORDER = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]

    @classmethod
    def inspect(cls, prompt: str, active_rules: List[SecurityRule]) -> SecurityInspectionResult:
        if not prompt or not prompt.strip():
            return SecurityInspectionResult(
                is_safe=True,
                blocked=False,
                risk_score=0,
                highest_severity="NONE",
                triggered_rules=[],
                categories_detected=[],
                mitigation_reason=None,
                sanitized_prompt=prompt
            )

        norm_prompt = normalize_text(prompt)
        deobfuscated = deobfuscate_spacing(norm_prompt)
        
        triggered: List[DetectedKeywordMatch] = []
        categories_set = set()
        highest_severity = "NONE"
        should_block = False

        for rule in active_rules:
            if not rule.is_active:
                continue

            matched = False
            target_kw = normalize_text(rule.keyword)

            if rule.pattern_type == "CONTAINS":
                if target_kw in norm_prompt or target_kw in deobfuscated:
                    matched = True
            elif rule.pattern_type == "EXACT":
                if target_kw == norm_prompt.strip():
                    matched = True
            elif rule.pattern_type == "REGEX":
                try:
                    if re.search(rule.keyword, prompt, re.IGNORECASE):
                        matched = True
                except re.error:
                    pass
            elif rule.pattern_type == "FUZZY":
                kw_condensed = target_kw.replace(" ", "")
                if kw_condensed in norm_prompt.replace(" ", ""):
                    matched = True

            if matched:
                match_entry = DetectedKeywordMatch(
                    keyword=rule.keyword,
                    category=rule.category,
                    severity=rule.severity,
                    action=rule.action,
                    risk_score=rule.risk_score or cls.SEVERITY_WEIGHTS.get(rule.severity, 50),
                    rule_name=rule.name
                )
                triggered.append(match_entry)
                categories_set.add(rule.category)

                if highest_severity == "NONE":
                    highest_severity = rule.severity
                else:
                    curr_idx = cls.SEVERITY_ORDER.index(highest_severity) if highest_severity in cls.SEVERITY_ORDER else -1
                    rule_idx = cls.SEVERITY_ORDER.index(rule.severity) if rule.severity in cls.SEVERITY_ORDER else -1
                    if rule_idx > curr_idx:
                        highest_severity = rule.severity

                if rule.action == "BLOCK":
                    should_block = True

        if not triggered:
            risk_score = 0
            is_safe = True
            mitigation_reason = None
        else:
            max_rule_score = max(t.risk_score for t in triggered)
            accumulation = min(20, (len(triggered) - 1) * 5)
            risk_score = min(100, max_rule_score + accumulation)
            
            if risk_score >= settings.CRITICAL_RISK_THRESHOLD or highest_severity in ["HIGH", "CRITICAL"]:
                should_block = True
            
            is_safe = not should_block

            rule_names = ", ".join([f"'{t.rule_name}' ({t.category})" for t in triggered[:3]])
            if len(triggered) > 3:
                rule_names += f" y {len(triggered) - 3} más"

            if should_block:
                mitigation_reason = f"Interceptado por JoanVector: Solicitud potencialmente maliciosa clasificada como {highest_severity}. Reglas disparadas: {rule_names}."
            else:
                mitigation_reason = f"Alerta preventiva: Se detectaron patrones sospechosos ({highest_severity}), pero la solicitud fue permitida con registro en auditoría."

        return SecurityInspectionResult(
            is_safe=is_safe,
            blocked=should_block,
            risk_score=risk_score,
            highest_severity=highest_severity,
            triggered_rules=triggered,
            categories_detected=list(categories_set),
            mitigation_reason=mitigation_reason,
            sanitized_prompt=prompt if not should_block else "[CONTENIDO BLOQUEADO POR POLÍTICA DE SEGURIDAD]"
        )
