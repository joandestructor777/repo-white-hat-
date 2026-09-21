import { useState, useEffect, useCallback } from "react";
import { SecurityRule, SecurityRuleInput } from "../types/rule.types";
import { rulesService } from "../services/rulesService";

export function useRules() {
  const [rules, setRules] = useState<SecurityRule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRules = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await rulesService.getAll();
      setRules(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Error al conectar con la API de reglas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const addRule = async (input: SecurityRuleInput) => {
    const created = await rulesService.create(input);
    setRules((prev) => [created, ...prev]);
    return created;
  };

  const updateRule = async (id: number, input: Partial<SecurityRuleInput>) => {
    const updated = await rulesService.update(id, input);
    setRules((prev) => prev.map((r) => (r.id === id ? updated : r)));
    return updated;
  };

  const toggleRuleActive = async (id: number, currentActive: boolean) => {
    const updated = await rulesService.update(id, { is_active: !currentActive });
    setRules((prev) => prev.map((r) => (r.id === id ? updated : r)));
  };

  const deleteRule = async (id: number) => {
    await rulesService.delete(id);
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  const seedDefaults = async () => {
    await rulesService.seedDefaults();
    await fetchRules();
  };

  return {
    rules,
    loading,
    error,
    refresh: fetchRules,
    addRule,
    updateRule,
    toggleRuleActive,
    deleteRule,
    seedDefaults,
  };
}
