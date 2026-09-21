import React, { useState, useMemo } from "react";
import { History, ShieldAlert, ShieldCheck, RefreshCw, Eye, Filter, Terminal, User } from "lucide-react";
import { AuditLog } from "../services/auditService";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import { formatDateTime, getSeverityStyle, getRiskScoreColor } from "../../../shared/utils/formatters";

interface AuditLogTableProps {
  logs: AuditLog[];
  loading: boolean;
  onRefresh: (blockedOnly?: boolean) => void;
}

export const AuditLogTable: React.FC<AuditLogTableProps> = ({
  logs,
  loading,
  onRefresh,
}) => {
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [blockedOnly, setBlockedOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleToggleBlockedOnly = () => {
    const next = !blockedOnly;
    setBlockedOnly(next);
    onRefresh(next);
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        log.prompt_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.client_ip.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.detected_keywords && log.detected_keywords.some((k) => k.toLowerCase().includes(searchTerm.toLowerCase())));
      return matchesSearch;
    });
  }, [logs, searchTerm]);

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Header Bar with generous padding */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-[#09090b] border border-zinc-800 rounded-2xl w-full min-w-0 shadow-xl">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2.5">
            <History className="w-5 h-5 text-white shrink-0" />
            <span className="truncate">Bitácora de Incidentes & Auditoría de Tráfico</span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 break-words leading-relaxed">
            Registro inmutable de todas las consultas dirigidas al asistente virtual, clasificadas por riesgo y severidad.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end shrink-0 flex-wrap">
          <Button
            variant={blockedOnly ? "primary" : "secondary"}
            size="md"
            onClick={handleToggleBlockedOnly}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            <span>{blockedOnly ? "Solo Bloqueados" : "Todos los Eventos"}</span>
          </Button>

          <Button variant="secondary" size="md" onClick={() => onRefresh(blockedOnly)} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Actualizar</span>
          </Button>
        </div>
      </div>

      {/* Search Bar with generous padding */}
      <div className="p-4 sm:p-5 bg-[#0a0a0c] border border-zinc-800/80 rounded-2xl w-full min-w-0 shadow-sm">
        <input
          type="text"
          placeholder="Buscar por texto del prompt, IP cliente o palabra clave detectada..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#121215] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-all font-mono"
        />
      </div>

      {/* Table with spacious padding */}
      <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-[#09090b] w-full min-w-0 shadow-xl">
        {loading && logs.length === 0 ? (
          <div className="p-16 text-center text-zinc-500 text-sm flex flex-col items-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-zinc-400" />
            Cargando registros de auditoría...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-16 text-center text-zinc-500 text-sm font-mono">
            No se registran eventos con los criterios seleccionados. Realiza una consulta en el simulador para generar tráfico.
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-xs sm:text-[13px] min-w-[760px]">
              <thead>
                <tr className="border-b border-zinc-800 bg-[#0e0e11] text-zinc-400 font-mono uppercase tracking-wider text-[11px]">
                  <th className="py-4 px-6 w-40 font-semibold">Fecha / Hora</th>
                  <th className="py-4 px-6 w-32 font-semibold">Estado</th>
                  <th className="py-4 px-6 w-32 font-semibold">IP Origen</th>
                  <th className="py-4 px-6 font-semibold">Prompt Evaluado</th>
                  <th className="py-4 px-6 font-semibold">Términos Detectados</th>
                  <th className="py-4 px-6 w-36 font-semibold">Severidad / Riesgo</th>
                  <th className="py-4 px-6 text-right w-28 font-semibold">Detalles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-900/40 transition-colors">
                    {/* Date */}
                    <td className="py-4 px-6 whitespace-nowrap font-mono text-xs text-zinc-400">
                      {formatDateTime(log.created_at)}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      {log.blocked ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-red-400 bg-red-950/60 px-2.5 py-1 rounded-lg border border-red-800/80">
                          <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                          BLOQUEADO
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-800/60">
                          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                          PERMITIDO
                        </span>
                      )}
                    </td>

                    {/* Client IP */}
                    <td className="py-4 px-6 whitespace-nowrap font-mono text-xs text-zinc-400 font-medium">
                      {log.client_ip}
                    </td>

                    {/* Prompt Preview */}
                    <td className="py-4 px-6 max-w-[240px]">
                      <div className="truncate font-mono text-xs text-zinc-200 font-medium" title={log.prompt_text}>
                        {log.prompt_text}
                      </div>
                    </td>

                    {/* Detected Keywords */}
                    <td className="py-4 px-6 font-mono text-xs max-w-[200px]">
                      {log.detected_keywords && log.detected_keywords.length > 0 ? (
                        <div className="truncate text-red-300 bg-zinc-900/90 border border-zinc-700 px-2.5 py-1 rounded-lg inline-block max-w-full font-semibold" title={log.detected_keywords.join(", ")}>
                          {log.detected_keywords.join(", ")}
                        </div>
                      ) : (
                        <span className="text-zinc-600">-</span>
                      )}
                    </td>

                    {/* Severity & Score */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold border ${getSeverityStyle(log.highest_severity)}`}>
                        {log.highest_severity} ({log.risk_score}%)
                      </span>
                    </td>

                    {/* Inspect Button */}
                    <td className="py-4 px-6 whitespace-nowrap text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors text-xs font-mono inline-flex items-center gap-1.5 cursor-pointer font-medium"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Ver Análisis
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-6 py-4 bg-[#0a0a0c] border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400 font-mono flex-wrap gap-2">
          <span>{filteredLogs.length} incidentes listados</span>
          <span>Almacenamiento: PostgreSQL Table `security_audit_logs`</span>
        </div>
      </div>

      {/* Incident Detail Modal with generous padding */}
      {selectedLog && (
        <Modal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          title={`Auditoría de Incidente #${selectedLog.id}`}
          maxWidth="lg"
        >
          <div className="space-y-5 font-mono text-xs w-full min-w-0 p-2">
            {/* Metadata Bar with generous padding */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-zinc-950 border border-zinc-800 rounded-xl">
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Veredicto</span>
                <span className={`text-sm font-bold ${selectedLog.blocked ? "text-red-400" : "text-emerald-400"}`}>
                  {selectedLog.action_taken}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Severidad</span>
                <span className="text-sm text-white font-bold">{selectedLog.highest_severity}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Riesgo</span>
                <span className={`text-sm font-bold ${getRiskScoreColor(selectedLog.risk_score)}`}>
                  {selectedLog.risk_score}%
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase font-semibold">IP Cliente</span>
                <span className="text-sm text-zinc-300 font-medium">{selectedLog.client_ip}</span>
              </div>
            </div>

            {/* Prompt Original */}
            <div className="w-full min-w-0 space-y-1.5">
              <span className="text-zinc-400 font-semibold block uppercase tracking-wider text-[11px]">
                Prompt Enviado por el Usuario:
              </span>
              <div className="p-4 bg-[#111114] border border-zinc-800 rounded-xl text-white whitespace-pre-wrap leading-relaxed break-words [overflow-wrap:anywhere] max-h-52 overflow-y-auto text-xs sm:text-[13px]">
                {selectedLog.prompt_text}
              </div>
            </div>

            {/* Detected Keywords */}
            {selectedLog.detected_keywords && selectedLog.detected_keywords.length > 0 && (
              <div className="w-full min-w-0 space-y-1.5">
                <span className="text-zinc-400 font-semibold block uppercase tracking-wider text-[11px]">
                  Palabras Clave Peligrosas Detectadas:
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedLog.detected_keywords.map((kw, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-lg bg-red-950/60 border border-red-800 text-red-300 font-mono break-all inline-block font-bold text-xs"
                    >
                      "{kw}"
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Mitigation Reason */}
            {selectedLog.mitigation_reason && (
              <div className="w-full min-w-0 space-y-1.5">
                <span className="text-zinc-400 font-semibold block uppercase tracking-wider text-[11px]">
                  Justificación Técnica / Dictamen:
                </span>
                <div className="p-4 bg-[#0c0c0e] border border-zinc-800 rounded-xl text-zinc-300 leading-relaxed break-words [overflow-wrap:anywhere] text-xs">
                  {selectedLog.mitigation_reason}
                </div>
              </div>
            )}

            {/* Response Delivered */}
            <div className="w-full min-w-0 space-y-1.5">
              <span className="text-zinc-400 font-semibold block uppercase tracking-wider text-[11px]">
                Respuesta Emitida al Usuario:
              </span>
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-300 whitespace-pre-wrap leading-relaxed break-words [overflow-wrap:anywhere] max-h-44 overflow-y-auto text-xs">
                {selectedLog.response_text || "[Sin respuesta generada]"}
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <Button variant="secondary" size="md" onClick={() => setSelectedLog(null)}>
                Cerrar Detalle
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
