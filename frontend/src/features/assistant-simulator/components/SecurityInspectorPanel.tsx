import React, { useState } from "react";
import { ShieldAlert, ShieldCheck, AlertTriangle, Code2, Sliders, Copy, Check } from "lucide-react";
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
      <div className="bg-[#0b0b0e] border border-[#222226] rounded-xl p-8 h-full flex flex-col items-center justify-center text-center w-full min-w-0 shadow-lg min-h-[460px]">
        <div className="w-8 h-8 rounded-full border-2 border-zinc-700 border-t-white animate-spin mb-3" />
        <div className="text-xs font-mono text-zinc-300 font-semibold tracking-wider uppercase">
          Inspeccionando Payload (Reverse Proxy)
        </div>
        <p className="text-[11px] text-zinc-500 font-mono mt-1">
          Normalizando texto y evaluando reglas heurísticas en PostgreSQL...
        </p>
      </div>
    );
  }

  if (!securityResult) {
    return (
      <div className="bg-[#0b0b0e] border border-[#222226] rounded-xl p-8 h-full flex flex-col items-center justify-center text-center w-full min-w-0 shadow-lg min-h-[460px]">
        <div className="w-10 h-10 rounded-lg bg-[#141418] border border-zinc-800 flex items-center justify-center text-zinc-500 mb-3">
          <Code2 className="w-5 h-5" />
        </div>
        <h3 className="text-xs font-semibold text-zinc-200 font-mono tracking-wider uppercase">
          Telemetry & Security Inspector
        </h3>
        <p className="text-xs text-zinc-400 max-w-xs mt-1.5 font-mono leading-relaxed">
          Envía una solicitud desde el cliente o selecciona un escenario OWASP para observar la traza de seguridad.
        </p>
        <div className="mt-4 px-3 py-1 rounded bg-[#121215] border border-zinc-800 text-[10px] text-zinc-500 font-mono">
          STATUS: LISTENING ON POST /api/v1/assistant/chat
        </div>
      </div>
    );
  }

  const { is_safe, blocked, risk_score, highest_severity, triggered_rules, categories_detected, mitigation_reason } = securityResult;

  return (
    <div className="bg-[#0b0b0e] border border-[#222226] rounded-xl flex flex-col h-full w-full min-w-0 shadow-xl overflow-hidden">
      {/* Inspector Header with Tab Switcher (DevTools style) */}
      <div className="bg-[#121215] border-b border-[#222226] px-4 py-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab("analysis")}
            className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors cursor-pointer ${
              activeTab === "analysis"
                ? "bg-[#27272a] text-white font-semibold"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Análisis
          </button>
          <button
            onClick={() => setActiveTab("rules")}
            className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "rules"
                ? "bg-[#27272a] text-white font-semibold"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <span>Reglas</span>
            <span className="text-[10px] px-1 rounded bg-zinc-800 text-zinc-300 font-bold">
              {triggered_rules.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("json")}
            className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors cursor-pointer ${
              activeTab === "json"
                ? "bg-[#27272a] text-white font-semibold"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            JSON Raw
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-500 font-mono">
            {latencyMs}ms
          </span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getSeverityStyle(highest_severity)}`}>
            {highest_severity}
          </span>
        </div>
      </div>

      {/* Tab 1: Analysis */}
      {activeTab === "analysis" && (
        <div className="p-5 space-y-5 flex-1 overflow-y-auto">
          {/* Verdict Banner */}
          <div className="p-3.5 rounded-xl border flex items-center justify-between gap-3 bg-[#121216] border-[#242429]">
            <div className="flex items-center gap-3 min-w-0">
              {blocked ? (
                <div className="w-8 h-8 rounded-lg bg-red-950/80 border border-red-800 flex items-center justify-center text-red-400 shrink-0">
                  <ShieldAlert className="w-4 h-4" />
                </div>
              ) : !is_safe ? (
                <div className="w-8 h-8 rounded-lg bg-yellow-950/80 border border-yellow-800 flex items-center justify-center text-yellow-400 shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-800 flex items-center justify-center text-emerald-400 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              )}
              <div className="min-w-0">
                <div className="text-[10px] font-mono uppercase text-zinc-500">Gateway Decision</div>
                <div className="text-xs sm:text-sm font-bold font-mono text-white truncate">
                  {blocked ? "HTTP 403 • REQUEST BLOCKED" : !is_safe ? "HTTP 200 • FLAGGED / AUDITED" : "HTTP 200 • PASS / SAFE"}
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className={`text-base font-bold font-mono ${getRiskScoreColor(risk_score)}`}>
                {risk_score}%
              </span>
              <div className="text-[9px] text-zinc-500 font-mono uppercase">Threat Score</div>
            </div>
          </div>

          {/* Risk Score Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-mono text-zinc-400">
              <span>Nivel de Riesgo Calculado</span>
              <span className="text-zinc-500">Umbral de bloqueo: ≥70%</span>
            </div>
            <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
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
            <div className="p-3.5 bg-[#121215] border border-zinc-800 rounded-xl space-y-1">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block font-semibold">
                Dictamen Técnico del Gateway:
              </span>
              <p className="text-xs text-zinc-300 font-mono leading-relaxed break-words">
                {mitigation_reason}
              </p>
            </div>
          )}

          {/* Attack categories tags */}
          {categories_detected.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block font-semibold">
                Clasificación de Amenaza:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {categories_detected.map((cat, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900 border border-zinc-700 text-zinc-300"
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
        <div className="p-5 space-y-3 flex-1 overflow-y-auto">
          {triggered_rules.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500 font-mono">
              Ninguna regla de seguridad fue disparada.
            </div>
          ) : (
            triggered_rules.map((rule, idx) => (
              <div
                key={idx}
                className="p-3 bg-[#121215] border border-zinc-800 rounded-xl space-y-2 text-xs font-mono"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-white bg-black/80 px-2 py-0.5 rounded border border-zinc-700 break-all text-[11px]">
                    "{rule.keyword}"
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded border font-semibold ${getSeverityStyle(rule.severity)}`}>
                    {rule.severity}
                  </span>
                </div>
                <div className="flex items-center justify-between text-zinc-400 text-[11px] pt-1 border-t border-zinc-800/60">
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
        <div className="p-4 flex-1 overflow-y-auto relative">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-mono text-zinc-500 uppercase">
              FastAPI Response Payload
            </span>
            <button
              onClick={handleCopyJson}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-mono transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? "Copiado" : "Copiar"}</span>
            </button>
          </div>
          <pre className="p-3 bg-black/80 border border-zinc-800 rounded-xl text-[11px] font-mono text-zinc-300 overflow-x-auto leading-relaxed">
            {JSON.stringify(securityResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
