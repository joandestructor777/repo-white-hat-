import { apiClient } from "../../../shared/api/axiosClient";
import { SecurityRule, SecurityRuleInput } from "../types/rule.types";

export const rulesService = {
  async getAll(params?: { category?: string; severity?: string; active_only?: boolean }): Promise<SecurityRule[]> {
    const response = await apiClient.get<SecurityRule[]>("/rules", { params });
    return response.data;
  },

  async getById(id: number): Promise<SecurityRule> {
    const response = await apiClient.get<SecurityRule>(`/rules/${id}`);
    return response.data;
  },

  async create(rule: SecurityRuleInput): Promise<SecurityRule> {
    const response = await apiClient.post<SecurityRule>("/rules", rule);
    return response.data;
  },

  async update(id: number, rule: Partial<SecurityRuleInput>): Promise<SecurityRule> {
    const response = await apiClient.put<SecurityRule>(`/rules/${id}`, rule);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/rules/${id}`);
  },

  async seedDefaults(): Promise<{ message: string; added: number }> {
    const response = await apiClient.post<{ message: string; added: number }>("/rules/seed/defaults");
    return response.data;
  }
};
