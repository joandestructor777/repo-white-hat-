import React, { useState } from "react";
import { ThreatAnalysisResult, threatIntelService } from "../services/threatIntelService";
import { Button } from "../../../components/ui/Button";

interface ThreatIntelCardProps {
  promptText: string;
  auditId?: number;
  clientIp?: string;
  isAuthenticated: boolean;
  onRequireAuth: () => void;
  onRuleApplied?: () => void;
  autoAnalyze?: boolean;
  canWrite?: boolean;
  userRole?: string;
}

export const ThreatIntelCard: React.FC<ThreatIntelCardProps> = ({
  promptText,
  auditId,
  clientIp,
  isAuthenticated,
  onRequireAuth,
  onRuleApplied,
  autoAnalyze = false,
  canWrite = true,
  userRole = "Invitado",
}) => {
  const [analysis, setAnalysis] = useState<ThreatAnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [applying, setApplying] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!promptText || !promptText.trim()) return;
    setAnalyzing(true);
    setError(null);
    setAppliedSuccess(false);
    try {
      const result = await threatIntelService.analyzeThreat(promptText, auditId, clientIp);
      setAnalysis(result);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error al conectar con el motor de Inteligencia Artificial");
    } finally {
      setAnalyzing(false);
    }
  };

  React.useEffect(() => {
    if (autoAnalyze && promptText && promptText.trim()) {
      handleAnalyze();
    }
  }, [promptText, autoAnalyze]);

  const handleApplyRule = async () => {
    if (!analysis) return;
    if (!isAuthenticated) {
      onRequireAuth();
      return;
    }
    if (!canWrite) {
      setError(`Acceso denegado (RBAC): El rol '${userRole}' tiene permisos de Solo Lectura. No puedes inyectar reglas en el Gateway.`);
      return;
    }

    setApplying(true);
    setError(null);
    try {
      await threatIntelService.applySuggestedRule(analysis.suggested_rule);
      setAppliedSuccess(true);
      if (onRuleApplied) {
        onRuleApplied();
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error al aplicar la regla defensiva");
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="border border-zinc-800 bg-zinc-950/90 p-4 font-mono text-xs space-y-3 w-full min-w-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-zinc-800 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)] inline-block"></span>
          <span className="text-zinc-200 font-bold uppercase tracking-wider text-[11px]">
            AGENTE SOC • INTELIGENCIA DE AMENAZAS IA
          </span>
        </div>

        {!analysis && !analyzing && (
          <button
            type="button"
            onClick={handleAnalyze}
            className="px-3.5 py-1.5 bg-purple-950/90 hover:bg-purple-900 border border-purple-500 text-purple-200 hover:text-white font-mono text-xs font-bold transition-all shadow-[0_0_10px_rgba(168,85,247,0.3)] cursor-pointer flex items-center gap-1.5"
          >
            <span>[ANALIZAR VECTOR CON IA]</span>
          </button>
        )}
      </div>

      {analyzing && (
        <div className="p-6 text-center text-purple-400 space-y-2 animate-pulse">
          <div className="text-xs font-bold">[INFERENCIA EN CURSO]</div>
          <div className="text-[11px] text-zinc-500">
            Analizando patrones sintácticos, taxonomía OWASP LLM y tácticas MITRE ATT&CK...
          </div>
        </div>
      )}

      {error && (
        <div className="p-2.5 bg-red-950/40 border border-red-800 text-red-300 text-[11px]">
          [ERROR IA]: {error}
        </div>
      )}

      {analysis && (
        <div className="space-y-3 pt-1">
          {/* Clasificación y Métricas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2.5 bg-black border border-zinc-800">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Clasificación OWASP</span>
              <span className="text-purple-300 font-bold text-xs">{analysis.threat_classification}</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Táctica MITRE ATT&CK</span>
              <span className="text-zinc-300 font-bold text-xs">{analysis.mitre_technique}</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Confianza de Detección</span>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="flex-1 bg-zinc-800 h-2 border border-zinc-700">
                  <div
                    className="bg-purple-500 h-full"
                    style={{ width: `${Math.round(analysis.confidence_score * 100)}%` }}
                  ></div>
                </div>
                <span className="text-purple-400 font-bold text-xs">
                  {Math.round(analysis.confidence_score * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Resumen Ejecutivo del Agente */}
          <div>
            <span className="text-[10px] text-zinc-400 uppercase font-semibold block mb-1">
              DICTAMEN DE INTELIGENCIA DE AMENAZAS (LLM AGENT):
            </span>
            <div className="p-3 bg-black/60 border border-zinc-800/90 text-zinc-300 leading-relaxed text-xs">
              {analysis.executive_summary}
            </div>
          </div>

          {/* Vectores Detectados */}
          {analysis.attack_vectors && analysis.attack_vectors.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-zinc-500 uppercase">Vectores:</span>
              {analysis.attack_vectors.map((vec, i) => (
                <span key={i} className="px-2 py-0.5 bg-zinc-900 border border-zinc-700 text-zinc-300 text-[10px]">
                  {vec}
                </span>
              ))}
            </div>
          )}

          {/* Regla Sugerida por la IA */}
          <div className="p-3 bg-purple-950/20 border border-purple-900/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-purple-300 font-bold text-xs flex items-center gap-1.5">
                <span>POLÍTICA DEFENSIVA RECOMENDADA POR IA:</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 bg-purple-900/60 border border-purple-700 text-purple-200 uppercase font-bold">
                {analysis.suggested_rule.action} • {analysis.suggested_rule.severity}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-black/60 p-2 border border-purple-950">
              <div>
                <span className="text-zinc-500 block">Nombre:</span>
                <span className="text-zinc-200 font-semibold">{analysis.suggested_rule.name}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Firma / Patrón:</span>
                <code className="text-emerald-400 font-bold bg-black px-1 border border-zinc-800">
                  "{analysis.suggested_rule.keyword}"
                </code>
              </div>
              <div>
                <span className="text-zinc-500 block">Categoría:</span>
                <span className="text-zinc-300">{analysis.suggested_rule.category}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Puntaje de Riesgo:</span>
                <span className="text-red-400 font-bold">{analysis.suggested_rule.risk_score} / 100</span>
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between gap-3">
              <span className="text-[10px] text-zinc-500">
                Motor: {analysis.ai_engine}
              </span>

              {appliedSuccess ? (
                <div className="px-3 py-1.5 bg-emerald-950/90 border border-emerald-500 text-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                  <span>[ESTADO: REGLA APLICADA AL GATEWAY PERIMETRAL]</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleApplyRule}
                  disabled={applying || (!canWrite && isAuthenticated)}
                  className={`px-4 py-2 border-2 font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    !canWrite && isAuthenticated
                      ? "bg-zinc-900 border-zinc-700 text-zinc-500 opacity-50 cursor-not-allowed shadow-none"
                      : "bg-emerald-950/90 hover:bg-emerald-900 border-emerald-500 text-emerald-100 hover:text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                  }`}
                  title={!canWrite && isAuthenticated ? "El rol Auditor Externo tiene permisos de solo lectura" : "Inyectar regla en el Gateway"}
                >
                  {applying
                    ? "[APLICANDO...]"
                    : !canWrite && isAuthenticated
                    ? "🔒 [BLOQUEADO: SOLO LECTURA]"
                    : "[APLICAR REGLA EN EL GATEWAY]"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
