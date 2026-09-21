import React, { useState, useMemo } from "react";
import { Plus, Search, RefreshCw, Trash2, Edit2, ShieldAlert, CheckCircle2, XCircle } from "lucide-react";
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
    <div className="space-y-6 w-full min-w-0">
      {/* Header & Actions Bar with generous padding */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-[#09090b] border border-zinc-800 rounded-2xl w-full min-w-0 shadow-xl">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-white shrink-0" />
            <span className="truncate">Políticas de Detección & Palabras Clave</span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 break-words leading-relaxed">
            Gestión CRUD persistida en PostgreSQL. Cada término aquí configurado es inspeccionado en las consultas del asistente.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end shrink-0 flex-wrap">
          <Button variant="secondary" size="md" onClick={onSeedDefaults} title="Cargar reglas estándar OWASP Top 10" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Restaurar OWASP</span>
          </Button>
          <Button variant="primary" size="md" onClick={handleOpenAdd} className="gap-2 px-5">
            <Plus className="w-4 h-4" />
            <span>Nueva Palabra Clave</span>
          </Button>
        </div>
      </div>

      {/* Filters Bar with generous padding */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 sm:p-5 bg-[#0a0a0c] border border-zinc-800/80 rounded-2xl w-full min-w-0 shadow-sm">
        <div className="relative w-full min-w-0">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar por palabra clave o nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#121215] border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-all font-mono"
          />
        </div>

        <div className="w-full min-w-0">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-[#121215] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-white transition-all truncate"
          >
            <option value="ALL">Todas las Categorías ({rules.length})</option>
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
            className="w-full bg-[#121215] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-white transition-all"
          >
            <option value="ALL">Todas las Severidades</option>
            <option value="CRITICAL">Crítica</option>
            <option value="HIGH">Alta</option>
            <option value="MEDIUM">Media</option>
            <option value="LOW">Baja</option>
          </select>
        </div>
      </div>

      {/* Table Content with spacious padding */}
      <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-[#09090b] w-full min-w-0 shadow-xl">
        {loading && rules.length === 0 ? (
          <div className="p-16 text-center text-zinc-500 text-sm flex flex-col items-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-zinc-400" />
            Cargando reglas desde PostgreSQL...
          </div>
        ) : filteredRules.length === 0 ? (
          <div className="p-16 text-center text-zinc-500 text-sm font-mono">
            No se encontraron reglas coincidentes con los filtros aplicados.
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-xs sm:text-[13px] min-w-[780px]">
              <thead>
                <tr className="border-b border-zinc-800 bg-[#0e0e11] text-zinc-400 font-mono uppercase tracking-wider text-[11px]">
                  <th className="py-4 px-6 w-32 font-semibold">Estado</th>
                  <th className="py-4 px-6 font-semibold">Regla & Descripción</th>
                  <th className="py-4 px-6 font-semibold">Palabra Clave / Patrón</th>
                  <th className="py-4 px-6 font-semibold">Categoría</th>
                  <th className="py-4 px-6 font-semibold">Severidad</th>
                  <th className="py-4 px-6 font-semibold">Acción</th>
                  <th className="py-4 px-6 text-right w-28 font-semibold">Opciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-zinc-900/40 transition-colors">
                    {/* Status */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <button
                        onClick={() => onToggleActive(rule.id, rule.is_active)}
                        className="flex items-center gap-2 cursor-pointer text-xs group"
                        title="Clic para activar/desactivar regla"
                      >
                        {rule.is_active ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
                            <span className="text-zinc-200 font-mono text-[11px] font-semibold">ACTIVA</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-zinc-600 group-hover:scale-110 transition-transform shrink-0" />
                            <span className="text-zinc-500 font-mono text-[11px]">INACTIVA</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Name & Description */}
                    <td className="py-4 px-6 max-w-[240px] min-w-[150px]">
                      <div className="font-bold text-white tracking-tight truncate">{rule.name}</div>
                      {rule.description && (
                        <div className="text-zinc-400 text-xs truncate mt-1" title={rule.description}>
                          {rule.description}
                        </div>
                      )}
                    </td>

                    {/* Keyword / Pattern */}
                    <td className="py-4 px-6 font-mono-cyber max-w-[240px]">
                      <span className="px-2.5 py-1 rounded-lg bg-[#141418] border border-zinc-700 text-white text-xs font-semibold break-all inline-block shadow-sm">
                        {rule.keyword}
                      </span>
                      <span className="ml-2 text-[11px] text-zinc-500 uppercase shrink-0 inline-block font-mono">
                        [{rule.pattern_type}]
                      </span>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="text-xs text-zinc-300 font-mono font-medium">
                        {rule.category}
                      </span>
                    </td>

                    {/* Severity */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold border ${getSeverityStyle(rule.severity)}`}>
                        {rule.severity} ({rule.risk_score}%)
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <Badge variant={rule.action === "BLOCK" ? "danger" : "warning"}>
                        {rule.action}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 whitespace-nowrap text-right space-x-1.5">
                      <button
                        onClick={() => handleOpenEdit(rule)}
                        className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        title="Editar regla"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar la regla "${rule.name}" permanentemente?`)) {
                            onDeleteRule(rule.id);
                          }
                        }}
                        className="p-2 rounded-lg hover:bg-red-950/60 text-zinc-400 hover:text-red-300 transition-colors cursor-pointer"
                        title="Eliminar regla"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-6 py-4 bg-[#0a0a0c] border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400 font-mono flex-wrap gap-2">
          <span>Mostrando {filteredRules.length} de {rules.length} reglas registradas</span>
          <span className="text-[11px]">Motor de coincidencia heurístico activo</span>
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
