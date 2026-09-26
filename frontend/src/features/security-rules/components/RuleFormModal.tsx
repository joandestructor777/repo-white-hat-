import React, { useState, useEffect } from "react";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { SecurityRule, SecurityRuleInput } from "../types/rule.types";
import { SECURITY_CATEGORIES, SEVERITY_LEVELS, RULE_ACTIONS } from "../../../constants/security.constants";
import { Severity, RuleAction, PatternType } from "../../../shared/types/common.types";

interface RuleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rule: SecurityRuleInput) => Promise<any>;
  initialData?: SecurityRule | null;
}

export const RuleFormModal: React.FC<RuleFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [formData, setFormData] = useState<SecurityRuleInput>({
    name: "",
    keyword: "",
    pattern_type: "CONTAINS",
    category: "SYSTEM_PROMPT_LEAK",
    severity: "HIGH",
    action: "BLOCK",
    risk_score: 80,
    description: "",
    is_active: true,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        keyword: initialData.keyword,
        pattern_type: initialData.pattern_type,
        category: initialData.category,
        severity: initialData.severity,
        action: initialData.action,
        risk_score: initialData.risk_score,
        description: initialData.description || "",
        is_active: initialData.is_active,
      });
    } else {
      setFormData({
        name: "",
        keyword: "",
        pattern_type: "CONTAINS",
        category: "SYSTEM_PROMPT_LEAK",
        severity: "HIGH",
        action: "BLOCK",
        risk_score: 80,
        description: "",
        is_active: true,
      });
    }
    setError(null);
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.keyword.trim()) {
      setError("El nombre y la palabra clave o patrón son obligatorios");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Ocurrió un error al guardar la regla");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Editar Regla de Ciberseguridad" : "Nueva Regla / Palabra Clave Protegida"}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-950/40 border border-red-800/80 rounded-lg text-xs text-red-300">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nombre de la Regla"
            placeholder="Ej: Bloquear extracción de claves API"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="Palabra Clave o Patrón"
            placeholder="Ej: api_key o ignore instructions"
            value={formData.keyword}
            onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Tipo de Coincidencia
            </label>
            <select
              value={formData.pattern_type}
              onChange={(e) => setFormData({ ...formData, pattern_type: e.target.value as PatternType })}
              className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white"
            >
              <option value="CONTAINS">CONTAINS (Contiene la frase o palabra)</option>
              <option value="EXACT">EXACT (Coincidencia exacta)</option>
              <option value="FUZZY">FUZZY (Anti-ofuscación / sin espacios)</option>
              <option value="REGEX">REGEX (Expresión Regular)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Categoría de Amenaza
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white"
            >
              {SECURITY_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Severidad
            </label>
            <select
              value={formData.severity}
              onChange={(e) => setFormData({ ...formData, severity: e.target.value as Severity })}
              className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white"
            >
              {SEVERITY_LEVELS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label} ({s.value})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Acción del Guardrail
            </label>
            <select
              value={formData.action}
              onChange={(e) => setFormData({ ...formData, action: e.target.value as RuleAction })}
              className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white"
            >
              {RULE_ACTIONS.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Puntaje de Riesgo (1-100)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={formData.risk_score}
              onChange={(e) => setFormData({ ...formData, risk_score: parseInt(e.target.value) || 50 })}
              className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
            Descripción o Justificación de Ciberseguridad
          </label>
          <textarea
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Explica qué vector de ataque previene o por qué es peligrosa esta palabra clave..."
            className="w-full bg-[#0a0a0c] border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white"
          />
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="rule_active"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            className="rounded border-zinc-700 bg-zinc-900 text-white focus:ring-zinc-400 h-4 w-4"
          />
          <label htmlFor="rule_active" className="text-xs text-zinc-300 select-none">
            Regla activa e interceptando tráfico en tiempo real
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800/80">
          <Button variant="ghost" type="button" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" loading={submitting}>
            {initialData ? "Actualizar Regla" : "Guardar Regla"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
