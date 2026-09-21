import { Severity } from "../types/common.types";

export function formatDateTime(dateStr?: string): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return d.toLocaleString("es-ES", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  } catch {
    return dateStr;
  }
}

export function getSeverityStyle(severity: Severity | string) {
  switch (severity?.toUpperCase()) {
    case "CRITICAL":
      return "border-red-500/50 bg-red-950/40 text-red-300";
    case "HIGH":
      return "border-orange-500/50 bg-orange-950/40 text-orange-300";
    case "MEDIUM":
      return "border-yellow-500/50 bg-yellow-950/40 text-yellow-300";
    case "LOW":
      return "border-zinc-700 bg-zinc-900 text-zinc-300";
    default:
      return "border-emerald-500/40 bg-emerald-950/30 text-emerald-300";
  }
}

export function getRiskScoreColor(score: number): string {
  if (score >= 80) return "text-red-400 border-red-500/60";
  if (score >= 50) return "text-orange-400 border-orange-500/60";
  if (score >= 25) return "text-yellow-400 border-yellow-500/60";
  return "text-emerald-400 border-emerald-500/60";
}
