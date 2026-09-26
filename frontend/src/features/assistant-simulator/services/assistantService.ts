import { apiClient } from "../../../shared/api/axiosClient";
import { DEFAULT_CLIENT_IP } from "../../../constants/security.constants";

export interface DetectedKeywordMatch {
  keyword: string;
  category: string;
  severity: string;
  action: string;
  risk_score: number;
  rule_name: string;
}

export interface SecurityInspectionResult {
  is_safe: boolean;
  blocked: boolean;
  risk_score: number;
  highest_severity: string;
  triggered_rules: DetectedKeywordMatch[];
  categories_detected: string[];
  mitigation_reason?: string;
  sanitized_prompt?: string;
}

export interface AssistantChatResponse {
  reply: string;
  security_eval: SecurityInspectionResult;
  blocked: boolean;
  audit_id?: number;
}

export const assistantService = {
  async sendMessage(message: string, clientIp: string = DEFAULT_CLIENT_IP): Promise<AssistantChatResponse> {
    const response = await apiClient.post<AssistantChatResponse>("/assistant/chat", {
      message,
      client_ip: clientIp,
    });
    return response.data;
  },

  async inspectPrompt(message: string): Promise<SecurityInspectionResult> {
    const response = await apiClient.post<SecurityInspectionResult>("/security/inspect", {
      message,
    });
    return response.data;
  }
};
