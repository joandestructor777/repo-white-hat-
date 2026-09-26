import React, { useState, useMemo } from "react";
import { SecurityRule, SecurityRuleInput } from "../types/rule.types";
import { RuleFormModal } from "./RuleFormModal";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { getSeverityStyle } from "../../../shared/utils/formatters";
import { SECURITY_CATEGORIES } from "../../../constants/security.constants";

interface RuleTableProps {
  rules: SecurityRule[];
  loading: boolean;
  onAddRule: (rule: SecurityRuleInput) => Promise<any>;
  onUpdateRule: (id: number, rule: Partial<SecurityRuleInput>) => Promise<any>;
  onToggleActive: (id: number, currentActive: boolean) => Promise<any>;
  onDeleteRule: (id: number) => Promise<any>;
  onSeedDefaults: () => Promise<any>;
  onRefresh: () => void;
}

export const RuleTable: React.FC<RuleTableProps> = ({
  rules,
  loading,
  onAddRule,
  onUpdateRule,
  onToggleActive,
  onDeleteRule,
  onSeedDefaults,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<SecurityRule | null>(null);

  const filteredRules = useMemo(() => {
    return rules.filter((rule) => {
      const matchesSearch =
        rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.keyword.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (rule.description && rule.description.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCat = categoryFilter === "ALL" || rule.category === categoryFilter;
      const matchesSev = severityFilter === "ALL" || rule.severity === severityFilter;

      return matchesSearch && matchesCat && matchesSev;
    });
  }, [rules, searchTerm, categoryFilter, severityFilter]);

  const handleOpenAdd = () => {
    setEditingRule(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rule: SecurityRule) => {
    setEditingRule(rule);
    setIsModalOpen(true);
  };

  const handleSubmitModal = async (input: SecurityRuleInput) => {
    if (editingRule) {
      await onUpdateRule(editingRule.id, input);
    } else {
      await onAddRule(input);
    }
  };

  return (
    <div className="space-y-6 w-full min-w-0 font-sans">
      {/* Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-[#070709] border border-zinc-800 w-full min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 bg-emerald-500 shrink-0" />
            <span className="text-[11px] font-mono uppercase text-zinc-400 tracking-wider">
              DEFENSE POLICY MATRIX // CRUD
            </span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight font-mono">
            POLÍTICAS DE DETECCIÓN & PALABRAS CLAVE
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl font-mono leading-relaxed">
            Gestión persistente de reglas. Cada término o patrón aquí listado es evaluado en tiempo real por el motor heurístico antes de que la consulta alcance el modelo.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end shrink-0 flex-wrap">
          <Button
            variant="secondary"
            size="md"
            onClick={onSeedDefaults}
            className="font-mono text-xs"
          >
            <span>[RESTAURAR OWASP TOP 10]</span>
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleOpenAdd}
            className="font-mono text-xs px-5"
          >
            <span>[+ NUEVA PALABRA CLAVE]</span>
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-[#09090b] border border-zinc-800 w-full min-w-0">
        <div className="w-full min-w-0">
          <input
            type="text"
            placeholder="Buscar por palabra clave, nombre o patrón..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/60 border border-zinc-800 px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 font-mono"
          />
        </div>

        <div className="w-full min-w-0">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-black/60 border border-zinc-800 px-3.5 py-2 text-xs text-zinc-300 focus:outline-none focus:border-zinc-500 font-mono"
          >
            <option value="ALL">TODAS LAS CATEGORÍAS ({rules.length})</option>
            {SECURITY_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full min-w-0">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="w-full bg-black/60 border border-zinc-800 px-3.5 py-2 text-xs text-zinc-300 focus:outline-none focus:border-zinc-500 font-mono"
          >
            <option value="ALL">TODAS LAS SEVERIDADES</option>
            <option value="CRITICAL">CRÍTICA (CRITICAL)</option>
            <option value="HIGH">ALTA (HIGH)</option>
            <option value="MEDIUM">MEDIA (MEDIUM)</option>
            <option value="LOW">BAJA (LOW)</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="border border-zinc-800 bg-[#070709] w-full min-w-0">
        {loading && rules.length === 0 ? (
          <div className="p-16 text-center text-zinc-500 text-xs font-mono">
            [RECUPERANDO REGLAS DE SEGURIDAD...]
          </div>
        ) : filteredRules.length === 0 ? (
          <div className="p-16 text-center text-zinc-500 text-xs font-mono">
            No se encontraron políticas que coincidan con los filtros aplicados.
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-xs min-w-[780px]">
              <thead>
                <tr className="border-b border-zinc-800 bg-[#0c0c0e] text-zinc-400 font-mono uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-5 w-28 font-semibold">Estado</th>
                  <th className="py-3 px-5 font-semibold">Regla & Vector</th>
                  <th className="py-3 px-5 font-semibold">Término / Patrón</th>
                  <th className="py-3 px-5 font-semibold">Categoría</th>
                  <th className="py-3 px-5 font-semibold">Severidad</th>
                  <th className="py-3 px-5 font-semibold">Acción</th>
                  <th className="py-3 px-5 text-right w-36 font-semibold">Operaciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono">
                {filteredRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-zinc-900/40 transition-colors">
                    {/* Status */}
                    <td className="py-3 px-5 whitespace-nowrap">
                      <button
                        onClick={() => onToggleActive(rule.id, rule.is_active)}
                        className="cursor-pointer text-[11px] font-bold"
                        title="Alternar estado de regla"
                      >
                        {rule.is_active ? (
                          <span className="text-emerald-400">[● ACTIVA]</span>
                        ) : (
                          <span className="text-zinc-600">[○ INACTIVA]</span>
                        )}
                      </button>
                    </td>

                    {/* Name & Description */}
                    <td className="py-3 px-5 max-w-[240px] min-w-[150px]">
                      <div className="font-semibold text-white tracking-tight truncate">
                        {rule.name}
                      </div>
                      {rule.description && (
                        <div
                          className="text-zinc-500 text-[11px] truncate mt-0.5"
                          title={rule.description}
                        >
                          {rule.description}
                        </div>
                      )}
                    </td>

                    {/* Keyword / Pattern */}
                    <td className="py-3 px-5 max-w-[240px]">
                      <span className="px-2 py-0.5 bg-black border border-zinc-700 text-zinc-200 text-xs font-semibold break-all inline-block">
                        {rule.keyword}
                      </span>
                      <span className="ml-2 text-[10px] text-zinc-500 uppercase shrink-0 inline-block">
                        [{rule.pattern_type}]
                      </span>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-5 whitespace-nowrap">
                      <span className="text-xs text-zinc-400 font-medium">
                        {rule.category}
                      </span>
                    </td>

                    {/* Severity */}
                    <td className="py-3 px-5 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 text-[11px] font-bold border ${getSeverityStyle(
                          rule.severity
                        )}`}
                      >
                        {rule.severity} ({rule.risk_score}%)
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-5 whitespace-nowrap">
                      <Badge variant={rule.action === "BLOCK" ? "danger" : "warning"}>
                        {rule.action}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-5 whitespace-nowrap text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(rule)}
                        className="px-2 py-0.5 text-[11px] text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-600 bg-zinc-900 transition-colors"
                        title="Modificar regla"
                      >
                        [EDIT]
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar la regla "${rule.name}" permanentemente?`)) {
                            onDeleteRule(rule.id);
                          }
                        }}
                        className="px-2 py-0.5 text-[11px] text-rose-400 hover:text-rose-200 border border-zinc-800 hover:border-rose-900 bg-rose-950/20 transition-colors"
                        title="Eliminar regla"
                      >
                        [DEL]
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-5 py-3 bg-[#0c0c0e] border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500 font-mono flex-wrap gap-2">
          <span>Total de políticas registradas: {rules.length} (Filtradas: {filteredRules.length})</span>
          <span className="text-[11px]">INTERCEPTOR PERIMETRAL // ON</span>
        </div>
      </div>

      {/* Modal Dialog */}
      <RuleFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitModal}
        initialData={editingRule}
      />
    </div>
  );
};
