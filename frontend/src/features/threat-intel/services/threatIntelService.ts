import { apiClient } from "../../../shared/api/axiosClient";

export interface SuggestedRule {
  name: string;
  keyword: string;
  pattern_type: string;
  severity: string;
  category: string;
  action: string;
  risk_score: number;
  description: string;
}

export interface ThreatAnalysisResult {
  threat_classification: string;
  confidence_score: number;
  mitre_technique: string;
  executive_summary: string;
  attack_vectors: string[];
  suggested_rule: SuggestedRule;
  ai_engine: string;
  analyzed_at: string;
}

export const threatIntelService = {
  async analyzeThreat(promptText: string, auditId?: number, clientIp?: string): Promise<ThreatAnalysisResult> {
    const res = await apiClient.post<ThreatAnalysisResult>("/threat-intelligence/analyze", {
      prompt_text: promptText,
      audit_id: auditId,
      client_ip: clientIp,
    });
    return res.data;
  },

  async applySuggestedRule(rule: SuggestedRule): Promise<any> {
    const res = await apiClient.post("/threat-intelligence/apply-suggested-rule", rule);
    return res.data;
  }
};
