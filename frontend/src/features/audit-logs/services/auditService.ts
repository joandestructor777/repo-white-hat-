import { apiClient } from "../../../shared/api/axiosClient";
import { Severity } from "../../../shared/types/common.types";

export interface AuditLog {
  id: number;
  client_ip: string;
  prompt_text: string;
  blocked: boolean;
  action_taken: string;
  risk_score: number;
  highest_severity: Severity;
  detected_keywords: string[];
  threat_categories: string[];
  response_text?: string;
  mitigation_reason?: string;
  created_at: string;
}

export const auditService = {
  async getLogs(params?: { limit?: number; blocked_only?: boolean }): Promise<AuditLog[]> {
    const response = await apiClient.get<AuditLog[]>("/security/audits", { params });
    return response.data;
  }
};
