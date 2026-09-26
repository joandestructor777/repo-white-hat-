import React, { useState, useMemo } from "react";
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
    <div className="space-y-6 w-full min-w-0 font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-[#070709] border border-zinc-800 w-full min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 bg-emerald-500 shrink-0" />
            <span className="text-[11px] font-mono uppercase text-zinc-400 tracking-wider">
              FORENSIC AUDIT TRAIL - LOGS
            </span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight font-mono">
            BITÁCORA DE INCIDENTES & AUDITORÍA DE TRÁFICO
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl font-mono leading-relaxed">
            Registro cronológico inmutable de peticiones dirigidas al asistente. Incluye clasificación de riesgo, vectores detectados e IP de origen.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end shrink-0 flex-wrap">
          <Button
            variant={blockedOnly ? "primary" : "secondary"}
            size="md"
            onClick={handleToggleBlockedOnly}
            className="font-mono text-xs"
          >
            <span>{blockedOnly ? "[FILTRO: SOLO BLOQUEADOS]" : "[FILTRO: TODOS LOS EVENTOS]"}</span>
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={() => onRefresh(blockedOnly)}
            className="font-mono text-xs"
          >
            <span>{loading ? "[ACTUALIZANDO...]" : "[ACTUALIZAR]"}</span>
          </Button>
        </div>
      </div>

      <div className="p-4 bg-[#09090b] border border-zinc-800 w-full min-w-0">
        <input
          type="text"
          placeholder="Filtrar por texto del prompt, IP cliente o término detectado..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-black/60 border border-zinc-800 px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 font-mono"
        />
      </div>

      <div className="border border-zinc-800 bg-[#070709] w-full min-w-0">
        {loading && logs.length === 0 ? (
          <div className="p-16 text-center text-zinc-500 text-xs font-mono">
            [RECUPERANDO REGISTROS DE AUDITORÍA FORENSE...]
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-16 text-center text-zinc-500 text-xs font-mono">
            No se registran eventos con los criterios seleccionados. Envía una consulta desde el sandbox para generar tráfico.
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-xs min-w-[760px]">
              <thead>
                <tr className="border-b border-zinc-800 bg-[#0c0c0e] text-zinc-400 font-mono uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-5 w-36 font-semibold">Timestamp</th>
                  <th className="py-3 px-5 w-28 font-semibold">Estado</th>
                  <th className="py-3 px-5 w-28 font-semibold">IP Origen</th>
                  <th className="py-3 px-5 font-semibold">Prompt Inspeccionado</th>
                  <th className="py-3 px-5 font-semibold">Términos Detectados</th>
                  <th className="py-3 px-5 w-36 font-semibold">Severidad / Riesgo</th>
                  <th className="py-3 px-5 text-right w-28 font-semibold">Análisis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-3 px-5 whitespace-nowrap text-zinc-500 text-[11px]">
                      {formatDateTime(log.created_at)}
                    </td>

                    <td className="py-3 px-5 whitespace-nowrap">
                      {log.blocked ? (
                        <span className="font-bold text-[11px] text-red-400 bg-red-950/40 px-2 py-0.5 border border-red-800">
                          [403 BLOCK]
                        </span>
                      ) : (
                        <span className="font-bold text-[11px] text-emerald-400 bg-emerald-950/30 px-2 py-0.5 border border-emerald-800">
                          [200 PASS]
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-5 whitespace-nowrap text-zinc-400 text-xs">
                      {log.client_ip}
                    </td>

                    <td className="py-3 px-5 max-w-[240px]">
                      <div className="truncate text-xs text-zinc-200" title={log.prompt_text}>
                        {log.prompt_text}
                      </div>
                    </td>

                    <td className="py-3 px-5 text-xs max-w-[200px]">
                      {log.detected_keywords && log.detected_keywords.length > 0 ? (
                        <div
                          className="truncate text-red-300 bg-black border border-red-900/80 px-2 py-0.5 text-[11px] font-semibold"
                          title={log.detected_keywords.join(", ")}
                        >
                          {log.detected_keywords.join(", ")}
                        </div>
                      ) : (
                        <span className="text-zinc-600">[NINGUNO]</span>
                      )}
                    </td>

                    <td className="py-3 px-5 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 text-[11px] font-bold border ${getSeverityStyle(
                          log.highest_severity
                        )}`}
                      >
                        {log.highest_severity} ({log.risk_score}%)
                      </span>
                    </td>

                    <td className="py-3 px-5 whitespace-nowrap text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-2.5 py-1 text-[11px] text-zinc-300 hover:text-white border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 transition-colors"
                      >
                        [FORENSE]
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-5 py-3 bg-[#0c0c0e] border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500 font-mono flex-wrap gap-2">
          <span>{filteredLogs.length} eventos listados</span>
          <span>STORE: SECURITY_AUDIT_LOGS</span>
        </div>
      </div>

      {selectedLog && (
        <Modal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          title={`Inspección Forense - Evento #${selectedLog.id}`}
          maxWidth="lg"
        >
          <div className="space-y-4 font-mono text-xs w-full min-w-0">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-black border border-zinc-800">
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Dictamen</span>
                <span className={`text-xs font-bold ${selectedLog.blocked ? "text-red-400" : "text-emerald-400"}`}>
                  {selectedLog.action_taken}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Severidad</span>
                <span className="text-xs text-white font-bold">{selectedLog.highest_severity}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Índice de Riesgo</span>
                <span className={`text-xs font-bold ${getRiskScoreColor(selectedLog.risk_score)}`}>
                  {selectedLog.risk_score}%
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase font-semibold">IP Origen</span>
                <span className="text-xs text-zinc-300">{selectedLog.client_ip}</span>
              </div>
            </div>

            <div className="w-full min-w-0 space-y-1">
              <span className="text-zinc-400 font-semibold block uppercase tracking-wider text-[11px]">
                PROMPT ORIGINAL INSPECCIONADO:
              </span>
              <div className="p-3 bg-black border border-zinc-800 text-zinc-200 whitespace-pre-wrap leading-relaxed break-words max-h-48 overflow-y-auto text-xs">
                {selectedLog.prompt_text}
              </div>
            </div>

            {selectedLog.detected_keywords && selectedLog.detected_keywords.length > 0 && (
              <div className="w-full min-w-0 space-y-1">
                <span className="text-zinc-400 font-semibold block uppercase tracking-wider text-[11px]">
                  PATRONES O PALABRAS CLAVE DETECTADAS:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedLog.detected_keywords.map((kw, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-red-950/60 border border-red-800 text-red-300 font-bold text-[11px]"
                    >
                      "{kw}"
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedLog.mitigation_reason && (
              <div className="w-full min-w-0 space-y-1">
                <span className="text-zinc-400 font-semibold block uppercase tracking-wider text-[11px]">
                  DICTAMEN TÉCNICO HEURÍSTICO:
                </span>
                <div className="p-3 bg-zinc-950 border border-zinc-800 text-zinc-300 leading-relaxed break-words text-xs">
                  {selectedLog.mitigation_reason}
                </div>
              </div>
            )}

            <div className="w-full min-w-0 space-y-1">
              <span className="text-zinc-400 font-semibold block uppercase tracking-wider text-[11px]">
                RESPUESTA ENTREGADA AL CLIENTE:
              </span>
              <div className="p-3 bg-black border border-zinc-800 text-zinc-300 whitespace-pre-wrap leading-relaxed break-words max-h-36 overflow-y-auto text-xs">
                {selectedLog.response_text || "[Sin respuesta enviada - interceptado antes de inferencia]"}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-zinc-800">
              <Button variant="secondary" size="md" onClick={() => setSelectedLog(null)} className="font-mono text-xs">
                [CERRAR FORENSE]
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
