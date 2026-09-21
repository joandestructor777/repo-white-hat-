import { useState, useEffect, useCallback } from "react";
import { AuditLog, auditService } from "../services/auditService";

export function useAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async (blockedOnly: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      const data = await auditService.getLogs({ limit: 100, blocked_only: blockedOnly });
      setLogs(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Error al cargar la bitácora de auditoría.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return {
    logs,
    loading,
    error,
    refresh: fetchLogs,
  };
}
