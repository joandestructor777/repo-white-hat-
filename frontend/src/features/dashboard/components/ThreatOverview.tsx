import React, { useState, useEffect } from "react";
import { apiClient } from "../../../shared/api/axiosClient";
import { AuditLog } from "../../audit-logs/services/auditService";
import { Button } from "../../../components/ui/Button";
import { formatDateTime, getSeverityStyle, getRiskScoreColor } from "../../../shared/utils/formatters";
import { APP_BRAND_NAME } from "../../../constants/security.constants";

interface DashboardStats {
  total_scans: number;
  total_blocked: number;
  total_flagged: number;
  total_allowed: number;
  block_rate: number;
  average_risk_score: number;
  category_distribution: Record<string, number>;
  severity_distribution: Record<string, number>;
  recent_events: AuditLog[];
}

interface ThreatOverviewProps {
  onNavigateToSimulator: () => void;
  onNavigateToRules: () => void;
}

export const ThreatOverview: React.FC<ThreatOverviewProps> = ({
  onNavigateToSimulator,
  onNavigateToRules,
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<DashboardStats>("/dashboard/stats");
      setStats(res.data);
    } catch (e) {
      console.error("Error al cargar stats:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-6 w-full min-w-0 font-sans">
      <div className="p-6 bg-[#070709] border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 w-full min-w-0">
        <div className="space-y-2 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 bg-emerald-500 shrink-0" />
            <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-zinc-400">
              {APP_BRAND_NAME} - Threat Intelligence Telemetry
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-mono truncate">
            MONITOR DE SEGURIDAD & PREVENCIÓN PERIMETRAL
          </h1>
          <p className="text-xs text-zinc-400 max-w-2xl font-mono leading-relaxed break-words">
            Inspección heurística y filtrado inverso en tiempo real para asistentes de IA. Análisis sintáctico contra inyecciones de prompt, exfiltración de credenciales y abuso del contexto del modelo.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <Button variant="secondary" size="md" onClick={fetchStats} className="font-mono text-xs">
            <span>{loading ? "[ACTUALIZANDO...]" : "[REFRESCAR]"}</span>
          </Button>
          <Button variant="primary" size="md" onClick={onNavigateToSimulator} className="font-mono text-xs px-4">
            <span>[ABRIR SANDBOX &gt;]</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full min-w-0">
        <div className="p-5 bg-[#09090b] border border-zinc-800/90 space-y-2.5 min-w-0">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono uppercase">
            <span>Peticiones Escaneadas</span>
            <span className="font-mono text-[10px] text-zinc-500">[SCAN_IN]</span>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono truncate">
            {stats?.total_scans ?? 0}
          </div>
          <div className="text-[11px] text-zinc-500 font-mono truncate">
            Throughput de inspección activo
          </div>
        </div>

        <div className="p-5 bg-[#09090b] border border-zinc-800/90 space-y-2.5 min-w-0">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono uppercase">
            <span>Amenazas Mitigadas</span>
            <span className="font-mono text-[10px] text-rose-500">[BLOCKED]</span>
          </div>
          <div className="text-3xl font-extrabold text-rose-400 font-mono truncate">
            {stats?.total_blocked ?? 0}
          </div>
          <div className="text-[11px] text-zinc-500 font-mono truncate">
            Tasa de mitigación: <strong className="text-zinc-300">{stats?.block_rate ?? 0}%</strong>
          </div>
        </div>

        <div className="p-5 bg-[#09090b] border border-zinc-800/90 space-y-2.5 min-w-0">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono uppercase">
            <span>Riesgo Heurístico Promedio</span>
            <span className="font-mono text-[10px] text-yellow-500">[SEV_AVG]</span>
          </div>
          <div className={`text-3xl font-extrabold font-mono truncate ${getRiskScoreColor(stats?.average_risk_score ?? 0)}`}>
            {stats?.average_risk_score ?? 0}%
          </div>
          <div className="text-[11px] text-zinc-500 font-mono truncate">
            Heuristic Severity Score
          </div>
        </div>

        <div className="p-5 bg-[#09090b] border border-zinc-800/90 space-y-2.5 min-w-0">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono uppercase">
            <span>Tráfico Legítimo</span>
            <span className="font-mono text-[10px] text-emerald-500">[PASS_200]</span>
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono truncate">
            {stats?.total_allowed ?? 0}
          </div>
          <div className="text-[11px] text-zinc-500 font-mono truncate">
            Solicitudes seguras validadas
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 w-full min-w-0">
        <div className="p-5 bg-[#070709] border border-zinc-800 space-y-4 w-full min-w-0 overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-200 font-mono truncate">
              Distribución por Nivel de Severidad
            </h3>
            <span className="text-[10px] text-zinc-500 font-mono shrink-0">Evaluador Heurístico</span>
          </div>

          <div className="space-y-3">
            {[
              { level: "CRITICAL", label: "CRÍTICA", color: "bg-red-500", text: "text-red-400" },
              { level: "HIGH", label: "ALTA", color: "bg-orange-500", text: "text-orange-400" },
              { level: "MEDIUM", label: "MEDIA", color: "bg-yellow-500", text: "text-yellow-400" },
              { level: "LOW", label: "BAJA", color: "bg-zinc-500", text: "text-zinc-400" },
              { level: "NONE", label: "INOCUO / LIMPIO", color: "bg-emerald-500", text: "text-emerald-400" },
            ].map((item) => {
              const count = stats?.severity_distribution?.[item.level] ?? 0;
              const total = stats?.total_scans || 1;
              const pct = Math.round((count / total) * 100);

              return (
                <div key={item.level} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className={`font-semibold ${item.text}`}>{item.label}</span>
                    <span className="text-zinc-400">{count} eventos ({pct}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-950 border border-zinc-800">
                    <div className={`h-full ${item.color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-5 bg-[#070709] border border-zinc-800 space-y-4 w-full min-w-0 overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-200 font-mono truncate">
              Taxonomía de Amenazas (OWASP LLM Top 10)
            </h3>
            <button
              onClick={onNavigateToRules}
              className="text-xs text-zinc-400 hover:text-white font-mono cursor-pointer shrink-0 transition-colors"
            >
              [GESTIONAR POLÍTICAS &gt;]
            </button>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {stats && Object.keys(stats.category_distribution).length > 0 ? (
              Object.entries(stats.category_distribution).map(([cat, count]) => (
                <div
                  key={cat}
                  className="flex items-center justify-between p-2.5 bg-black/40 border border-zinc-800/80 text-xs font-mono gap-2 hover:border-zinc-700 transition-colors"
                >
                  <span className="text-zinc-300 truncate">{cat}</span>
                  <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-200 text-[11px] shrink-0 font-semibold">
                    {count} DETECCIONES
                  </span>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-zinc-500 font-mono leading-relaxed">
                Sin eventos registrados. Envía pruebas desde el sandbox para generar telemetría forense.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-5 bg-[#070709] border border-zinc-800 space-y-3 w-full min-w-0 overflow-hidden">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-200 font-mono truncate">
            Flujo de Eventos Recientes (Reverse Proxy Engine)
          </h3>
          <span className="text-[10px] text-zinc-500 font-mono shrink-0">Security Audit Store</span>
        </div>

        {stats?.recent_events && stats.recent_events.length > 0 ? (
          <div className="divide-y divide-zinc-800/70 w-full min-w-0">
            {stats.recent_events.slice(0, 5).map((event) => (
              <div key={event.id} className="py-2.5 flex items-center justify-between gap-3 text-xs font-mono w-full min-w-0 hover:bg-zinc-900/40 px-2 transition-colors">
                <div className="flex items-center gap-2.5 min-w-0 flex-1 overflow-hidden">
                  <span className={`shrink-0 font-bold px-1.5 py-0.5 text-[10px] border ${event.blocked ? "bg-red-950/60 text-red-300 border-red-800" : "bg-emerald-950/40 text-emerald-300 border-emerald-800"}`}>
                    {event.blocked ? "BLOCK:403" : "ALLOW:200"}
                  </span>
                  <span className="text-zinc-300 truncate block" title={event.prompt_text}>
                    {event.prompt_text}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span className={`px-2 py-0.5 text-[10px] border shrink-0 font-semibold ${getSeverityStyle(event.highest_severity)}`}>
                    {event.highest_severity} ({event.risk_score}%)
                  </span>
                  <span className="text-zinc-500 text-[11px] hidden md:inline shrink-0">
                    {formatDateTime(event.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-zinc-500 text-xs font-mono">
            Sin eventos recientes en tránsito.
          </div>
        )}
      </div>
    </div>
  );
};
