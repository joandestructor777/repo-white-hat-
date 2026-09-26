import React, { useState } from "react";
import { SecurityInspectionResult } from "../services/assistantService";
import { getSeverityStyle, getRiskScoreColor } from "../../../shared/utils/formatters";

interface SecurityInspectorPanelProps {
  securityResult: SecurityInspectionResult | null;
  loading: boolean;
  latencyMs?: number;
}

export const SecurityInspectorPanel: React.FC<SecurityInspectorPanelProps> = ({
  securityResult,
  loading,
  latencyMs = 18,
}) => {
  const [activeTab, setActiveTab] = useState<"analysis" | "rules" | "json">("analysis");
  const [copied, setCopied] = useState(false);

  const handleCopyJson = () => {
    if (!securityResult) return;
    navigator.clipboard.writeText(JSON.stringify(securityResult, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="bg-[#070709] border border-zinc-800 p-8 h-full flex flex-col items-center justify-center text-center w-full min-w-0 min-h-[460px] font-sans">
        <div className="w-6 h-6 border-2 border-zinc-700 border-t-white animate-spin mb-3" />
        <div className="text-xs font-mono text-zinc-300 font-semibold tracking-wider uppercase">
          [INSPECCIONANDO PAYLOAD // REVERSE PROXY]
        </div>
        <p className="text-[11px] text-zinc-500 font-mono mt-1">
          Normalizando texto y contrastando reglas heurísticas...
        </p>
      </div>
    );
  }

  if (!securityResult) {
    return (
      <div className="bg-[#070709] border border-zinc-800 p-8 h-full flex flex-col items-center justify-center text-center w-full min-w-0 min-h-[460px] font-sans">
        <div className="px-3 py-1 bg-black border border-zinc-800 text-zinc-400 font-mono text-xs font-bold mb-3">
          [ENGINE: IDLE]
        </div>
        <h3 className="text-xs font-semibold text-zinc-200 font-mono tracking-wider uppercase">
          INSPECTOR TELEMÉTRICO DE SEGURIDAD
        </h3>
        <p className="text-xs text-zinc-400 max-w-xs mt-1.5 font-mono leading-relaxed">
          Envía una solicitud desde el simulador o selecciona un payload de prueba para desplegar el análisis forense en tiempo real.
        </p>
        <div className="mt-4 px-3 py-1 bg-black border border-zinc-800 text-[10px] text-zinc-500 font-mono">
          ENDPOINT: POST /api/v1/assistant/chat
        </div>
      </div>
    );
  }

  const { is_safe, blocked, risk_score, highest_severity, triggered_rules, categories_detected, mitigation_reason } = securityResult;

  return (
    <div className="bg-[#070709] border border-zinc-800 flex flex-col h-full w-full min-w-0 font-sans overflow-hidden">
      {/* Inspector Header with Tab Switcher */}
      <div className="bg-[#0c0c0e] border-b border-zinc-800 px-4 py-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 font-mono text-xs">
          <button
            onClick={() => setActiveTab("analysis")}
            className={`px-3 py-1 transition-colors cursor-pointer border ${
              activeTab === "analysis"
                ? "bg-zinc-900 border-zinc-600 text-white font-semibold"
                : "bg-transparent border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            [ANÁLISIS]
          </button>
          <button
            onClick={() => setActiveTab("rules")}
            className={`px-3 py-1 transition-colors cursor-pointer border flex items-center gap-1.5 ${
              activeTab === "rules"
                ? "bg-zinc-900 border-zinc-600 text-white font-semibold"
                : "bg-transparent border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            <span>[REGLAS]</span>
            <span className="text-[10px] px-1 bg-zinc-800 text-zinc-300 font-bold">
              {triggered_rules.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("json")}
            className={`px-3 py-1 transition-colors cursor-pointer border ${
              activeTab === "json"
                ? "bg-zinc-900 border-zinc-600 text-white font-semibold"
                : "bg-transparent border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            [JSON RAW]
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-500 font-mono">
            LATENCY: {latencyMs}ms
          </span>
          <span className={`px-2 py-0.5 text-[10px] font-mono font-bold border ${getSeverityStyle(highest_severity)}`}>
            {highest_severity}
          </span>
        </div>
      </div>

      {/* Tab 1: Analysis */}
      {activeTab === "analysis" && (
        <div className="p-5 space-y-5 flex-1 overflow-y-auto">
          {/* Verdict Banner */}
          <div className="p-3.5 border flex items-center justify-between gap-3 bg-black border-zinc-800">
            <div className="flex items-center gap-3 min-w-0">
              <span
                className={`font-mono text-xs font-bold px-2 py-1 border ${
                  blocked
                    ? "bg-red-950/60 text-red-400 border-red-800"
                    : !is_safe
                    ? "bg-yellow-950/60 text-yellow-400 border-yellow-800"
                    : "bg-emerald-950/60 text-emerald-400 border-emerald-800"
                }`}
              >
                {blocked ? "BLOCK: 403" : !is_safe ? "FLAG: 200" : "PASS: 200"}
              </span>

              <div className="min-w-0">
                <div className="text-[10px] font-mono uppercase text-zinc-500">GATEWAY VERDICT</div>
                <div className="text-xs sm:text-sm font-bold font-mono text-white truncate">
                  {blocked
                    ? "REQUEST BLOCKED PER RULE ACTION"
                    : !is_safe
                    ? "FLAGGED & AUDITED UNDER SUSPICION"
                    : "REQUEST VERIFIED CLEAN"}
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className={`text-base font-bold font-mono ${getRiskScoreColor(risk_score)}`}>
                {risk_score}%
              </span>
              <div className="text-[9px] text-zinc-500 font-mono uppercase">Riesgo Total</div>
            </div>
          </div>

          {/* Risk Score Progress Bar */}
          <div className="space-y-1.5 font-mono">
            <div className="flex justify-between text-[11px] text-zinc-400">
              <span>Nivel de Riesgo Calculado</span>
              <span className="text-zinc-500">Umbral de bloqueo: ≥70%</span>
            </div>
            <div className="w-full h-1.5 bg-black border border-zinc-800">
              <div
                className={`h-full transition-all duration-300 ${
                  risk_score >= 70 ? "bg-red-500" : risk_score >= 40 ? "bg-yellow-500" : "bg-emerald-500"
                }`}
                style={{ width: `${risk_score}%` }}
              />
            </div>
          </div>

          {/* Technical Summary */}
          {mitigation_reason && (
            <div className="p-3.5 bg-black border border-zinc-800 space-y-1">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block font-semibold">
                DICTAMEN TÉCNICO DEL GATEWAY:
              </span>
              <p className="text-xs text-zinc-300 font-mono leading-relaxed break-words">
                {mitigation_reason}
              </p>
            </div>
          )}

          {/* Attack categories tags */}
          {categories_detected.length > 0 && (
            <div className="space-y-1.5 font-mono">
              <span className="text-[10px] uppercase text-zinc-500 block font-semibold">
                CATEGORÍAS DE AMENAZA IDENTIFICADAS:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {categories_detected.map((cat, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 text-[10px] bg-black border border-zinc-700 text-zinc-300"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Matched Rules */}
      {activeTab === "rules" && (
        <div className="p-5 space-y-3 flex-1 overflow-y-auto font-mono">
          {triggered_rules.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500">
              Ninguna regla de seguridad fue disparada.
            </div>
          ) : (
            triggered_rules.map((rule, idx) => (
              <div
                key={idx}
                className="p-3 bg-black border border-zinc-800 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-white bg-zinc-900 px-2 py-0.5 border border-zinc-700 break-all text-[11px]">
                    "{rule.keyword}"
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 border font-semibold ${getSeverityStyle(rule.severity)}`}>
                    {rule.severity}
                  </span>
                </div>
                <div className="flex items-center justify-between text-zinc-400 text-[11px] pt-1 border-t border-zinc-900">
                  <span className="truncate">Regla: <strong className="text-zinc-200">{rule.rule_name}</strong></span>
                  <span className="text-zinc-500 shrink-0">Acción: {rule.action}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Raw JSON payload */}
      {activeTab === "json" && (
        <div className="p-4 flex-1 overflow-y-auto relative font-mono">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] text-zinc-500 uppercase">
              PAYLOAD DE RESPUESTA FASTAPI
            </span>
            <button
              onClick={handleCopyJson}
              className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-300 text-[10px] transition-colors cursor-pointer"
            >
              {copied ? "[COPIADO]" : "[COPIAR JSON]"}
            </button>
          </div>
          <pre className="p-3 bg-black border border-zinc-800 text-[11px] text-zinc-300 overflow-x-auto leading-relaxed">
            {JSON.stringify(securityResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
