import React, { useState, useEffect } from "react";
import { ShieldAlert, ShieldCheck, AlertTriangle, Activity, ArrowUpRight, Terminal, RefreshCw } from "lucide-react";
import { apiClient } from "../../../shared/api/axiosClient";
import { AuditLog } from "../../audit-logs/services/auditService";
import { Button } from "../../../components/ui/Button";
import { formatDateTime, getSeverityStyle, getRiskScoreColor } from "../../../shared/utils/formatters";

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
    <div className="space-y-6 w-full min-w-0">
      {/* Top Banner (Datadog / APM style) */}
      <div className="p-6 bg-[#0b0b0e] border border-[#222226] rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5 w-full min-w-0 shadow-lg">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-zinc-400">
              AI Security Gateway Telemetry
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-mono truncate">
            MONITOR DE SEGURIDAD & PREVENCIÓN PERIMETRAL
          </h1>
          <p className="text-xs text-zinc-400 max-w-2xl font-mono leading-relaxed break-words">
            Inspección heurística y filtrado inverso para LLMs. Detección de prompt injections, fugas de credenciales y consultas maliciosas en PostgreSQL.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <Button variant="secondary" size="md" onClick={fetchStats} className="gap-2">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refrescar</span>
          </Button>
          <Button variant="primary" size="md" onClick={onNavigateToSimulator} className="gap-2 px-4">
            <Terminal className="w-3.5 h-3.5" />
            <span>Abrir Playground</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full min-w-0">
        {/* Card 1: Total Scans */}
        <div className="p-5 bg-[#0e0e11] border border-[#222226] rounded-xl space-y-2.5 min-w-0">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono uppercase font-medium">
            <span>Peticiones Escaneadas</span>
            <Activity className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono truncate">
            {stats?.total_scans ?? 0}
          </div>
          <div className="text-[11px] text-zinc-500 font-mono truncate">
            Throughput de inspección activo
          </div>
        </div>

        {/* Card 2: Threats Blocked */}
        <div className="p-5 bg-[#0e0e11] border border-[#222226] rounded-xl space-y-2.5 min-w-0">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono uppercase font-medium">
            <span>Amenazas Mitigadas</span>
            <ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0" />
          </div>
          <div className="text-3xl font-extrabold text-red-400 font-mono truncate">
            {stats?.total_blocked ?? 0}
          </div>
          <div className="text-[11px] text-zinc-500 font-mono truncate">
            Tasa de mitigación: <strong className="text-zinc-300">{stats?.block_rate ?? 0}%</strong>
          </div>
        </div>

        {/* Card 3: Avg Risk Score */}
        <div className="p-5 bg-[#0e0e11] border border-[#222226] rounded-xl space-y-2.5 min-w-0">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono uppercase font-medium">
            <span>Índice de Riesgo Promedio</span>
            <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
          </div>
          <div className={`text-3xl font-extrabold font-mono truncate ${getRiskScoreColor(stats?.average_risk_score ?? 0)}`}>
            {stats?.average_risk_score ?? 0}%
          </div>
          <div className="text-[11px] text-zinc-500 font-mono truncate">
            Heuristic Severity Score
          </div>
        </div>

        {/* Card 4: Allowed Traffic */}
        <div className="p-5 bg-[#0e0e11] border border-[#222226] rounded-xl space-y-2.5 min-w-0">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono uppercase font-medium">
            <span>Tráfico Legítimo</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono truncate">
            {stats?.total_allowed ?? 0}
          </div>
          <div className="text-[11px] text-zinc-500 font-mono truncate">
            Solicitudes seguras [200 OK]
          </div>
        </div>
      </div>

      {/* Middle Grid: Severity Distribution & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 w-full min-w-0">
        {/* Severity Bars */}
        <div className="p-5 bg-[#0b0b0e] border border-[#222226] rounded-xl space-y-4 w-full min-w-0 overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-[#222226]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 font-mono truncate">
              Distribución por Nivel de Severidad
            </h3>
            <span className="text-[10px] text-zinc-500 font-mono shrink-0">Evaluador Heurístico</span>
          </div>

          <div className="space-y-3">
            {[
              { level: "CRITICAL", label: "Crítica", color: "bg-red-500", text: "text-red-400" },
              { level: "HIGH", label: "Alta", color: "bg-orange-500", text: "text-orange-400" },
              { level: "MEDIUM", label: "Media", color: "bg-yellow-500", text: "text-yellow-400" },
              { level: "LOW", label: "Baja", color: "bg-zinc-500", text: "text-zinc-400" },
              { level: "NONE", label: "Inocuo / Seguro", color: "bg-emerald-500", text: "text-emerald-400" },
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
                  <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Categories Breakdown */}
        <div className="p-5 bg-[#0b0b0e] border border-[#222226] rounded-xl space-y-4 w-full min-w-0 overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-[#222226]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 font-mono truncate">
              Taxonomía de Amenazas (OWASP LLM Top 10)
            </h3>
            <button
              onClick={onNavigateToRules}
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-mono cursor-pointer shrink-0 transition-colors"
            >
              <span>Ver Políticas</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {stats && Object.keys(stats.category_distribution).length > 0 ? (
              Object.entries(stats.category_distribution).map(([cat, count]) => (
                <div
                  key={cat}
                  className="flex items-center justify-between p-2.5 bg-[#121215] border border-[#222226] rounded-lg text-xs font-mono gap-2 hover:border-zinc-700 transition-colors"
                >
                  <span className="text-zinc-300 truncate">{cat}</span>
                  <span className="px-2 py-0.5 rounded bg-zinc-800 text-white text-[11px] shrink-0 font-semibold">
                    {count} incidentes
                  </span>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-zinc-500 font-mono leading-relaxed">
                Sin eventos registrados aún. Realiza pruebas desde el playground para observar la telemetría.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Table Preview */}
      <div className="p-5 bg-[#0b0b0e] border border-[#222226] rounded-xl space-y-3 w-full min-w-0 overflow-hidden">
        <div className="flex items-center justify-between pb-2 border-b border-[#222226]">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 font-mono truncate">
            Últimos Eventos en Tránsito (Reverse Proxy)
          </h3>
          <span className="text-[10px] text-zinc-500 font-mono shrink-0">PostgreSQL Audit Table</span>
        </div>

        {stats?.recent_events && stats.recent_events.length > 0 ? (
          <div className="divide-y divide-[#1e1e22] w-full min-w-0">
            {stats.recent_events.slice(0, 5).map((event) => (
              <div key={event.id} className="py-2.5 flex items-center justify-between gap-3 text-xs font-mono w-full min-w-0 hover:bg-zinc-900/30 px-2 rounded transition-colors">
                <div className="flex items-center gap-2.5 min-w-0 flex-1 overflow-hidden">
                  <span className={`shrink-0 font-bold px-1.5 py-0.2 rounded text-[10px] ${event.blocked ? "bg-red-950/70 text-red-300 border border-red-900/80" : "bg-emerald-950/50 text-emerald-300 border border-emerald-900/80"}`}>
                    {event.blocked ? "403" : "200"}
                  </span>
                  <span className="text-zinc-300 truncate block" title={event.prompt_text}>
                    {event.prompt_text}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span className={`px-2 py-0.2 rounded text-[10px] border shrink-0 font-semibold ${getSeverityStyle(event.highest_severity)}`}>
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
            Sin eventos recientes.
          </div>
        )}
      </div>
    </div>
  );
};
