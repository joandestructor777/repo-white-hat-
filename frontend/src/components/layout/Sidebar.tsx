import React from "react";
import { APP_ROUTES, AppTab } from "../../constants/routes.constants";
import { UserProfile } from "../../shared/hooks/useUserProfile";

interface SidebarProps {
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  backendOnline: boolean;
  profile: UserProfile;
  onOpenProfile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  backendOnline,
  profile,
  onOpenProfile,
}) => {
  const navItems = [
    {
      id: APP_ROUTES.DASHBOARD,
      code: "01",
      tag: "RADAR",
      label: "Amenazas y Métricas",
      desc: "Telemetría en tiempo real",
    },
    {
      id: APP_ROUTES.SIMULATOR,
      code: "02",
      tag: "SANDBOX",
      label: "Simulador de Asistente",
      desc: "Inspección de prompts",
    },
    {
      id: APP_ROUTES.RULES,
      code: "03",
      tag: "MATRIX",
      label: "Reglas de Seguridad",
      desc: "Filtros y heurísticas",
    },
    {
      id: APP_ROUTES.AUDIT,
      code: "04",
      tag: "TRAIL",
      label: "Logs de Auditoría",
      desc: "Registro forense",
    },
  ];

  return (
    <aside className="w-72 shrink-0 bg-[#070709] border-r border-zinc-800 flex flex-col justify-between min-h-screen select-none font-sans">
      {/* Brand Header */}
      <div>
        <div className="p-6 border-b border-zinc-800/80">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-none inline-block shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
              <span className="font-mono text-base font-bold tracking-wider text-white uppercase">
                JoanVector
              </span>
            </div>
            <span className="font-mono text-[10px] tracking-widest px-1.5 py-0.5 border border-zinc-700 text-zinc-400">
              v1.0
            </span>
          </div>
          <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
            AI Cybersecurity Guardrail
          </div>
        </div>

        {/* Gateway Telemetry Box */}
        <div className="px-4 py-3 mx-4 my-4 bg-black/60 border border-zinc-800/90 font-mono text-[11px]">
          <div className="flex items-center justify-between text-zinc-400 mb-1.5">
            <span className="text-[10px] uppercase text-zinc-500 tracking-wider">GATEWAY STATUS</span>
            <span
              className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${
                backendOnline ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 ${
                  backendOnline ? "bg-emerald-400 animate-pulse" : "bg-rose-500"
                }`}
              />
              {backendOnline ? "ONLINE" : "OFFLINE"}
            </span>
          </div>

          <div className="space-y-1 text-[10px] text-zinc-500 border-t border-zinc-900 pt-1.5">
            <div className="flex justify-between">
              <span>PORT:</span>
              <span className="text-zinc-300">8000 / REST</span>
            </div>
            <div className="flex justify-between">
              <span>ENGINE:</span>
              <span className="text-zinc-300">HEURISTIC v1</span>
            </div>
            <div className="flex justify-between">
              <span>PROTOCOL:</span>
              <span className="text-zinc-300">OWASP TOP 10 LLM</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-3 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-zinc-600">
            Navegación del Sistema
          </div>

          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full text-left px-3.5 py-3 transition-all flex items-start gap-3 border ${
                  isActive
                    ? "bg-zinc-900/90 border-zinc-600 text-white shadow-sm"
                    : "bg-transparent border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40 hover:border-zinc-800"
                }`}
              >
                <span
                  className={`font-mono text-xs font-bold pt-0.5 ${
                    isActive ? "text-emerald-400" : "text-zinc-600"
                  }`}
                >
                  [{item.code}]
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium tracking-tight truncate">
                      {item.label}
                    </span>
                    <span className="font-mono text-[9px] text-zinc-500 px-1 border border-zinc-800">
                      {item.tag}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-500 truncate mt-0.5">
                    {item.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Operator Profile & Footer */}
      <div className="p-4 border-t border-zinc-800/80 bg-black/40">
        <div
          onClick={onOpenProfile}
          className="flex items-center gap-3 p-2 border border-zinc-800 bg-zinc-950/80 hover:border-zinc-700 cursor-pointer transition-colors"
        >
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="w-8 h-8 object-cover border border-zinc-700"
            />
          ) : (
            <div className="w-8 h-8 bg-zinc-900 border border-zinc-700 flex items-center justify-center font-mono text-xs font-bold text-zinc-300">
              {(profile.name || "J").charAt(0).toUpperCase()}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-200 truncate">
                {profile.name || "Joan"}
              </span>
              <span className="font-mono text-[9px] text-emerald-400 uppercase">
                ACTIVE
              </span>
            </div>
            <div className="text-[10px] font-mono text-zinc-500 truncate">
              {profile.role || "White Hat / SOC Lead"}
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between font-mono text-[10px] text-zinc-600 px-1">
          <span>HOST: LOCALHOST</span>
          <span>SEC_LEVEL: MAX</span>
        </div>
      </div>
    </aside>
  );
};
