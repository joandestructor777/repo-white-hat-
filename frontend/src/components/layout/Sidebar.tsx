import React from "react";
import { APP_ROUTES, AppTab } from "../../constants/routes.constants";
import { UserProfile } from "../../shared/hooks/useUserProfile";
import { AuthUser } from "../../features/auth/services/authService";
import {
  APP_BRAND_NAME,
  APP_SUBTITLE,
  DEFAULT_OPERATOR_NAME,
  DEFAULT_OPERATOR_ROLE,
} from "../../constants/security.constants";

interface SidebarProps {
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  backendOnline: boolean;
  profile: UserProfile;
  onOpenProfile: () => void;
  authUser?: AuthUser | null;
  isAuthenticated: boolean;
  onOpenAuthModal: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  backendOnline,
  profile,
  onOpenProfile,
  authUser,
  isAuthenticated,
  onOpenAuthModal,
  onLogout,
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
      desc: "Filtros y políticas CRUD",
    },
    {
      id: APP_ROUTES.AUDIT,
      code: "04",
      tag: "TRAIL",
      label: "Logs de Auditoría",
      desc: "Registro forense",
    },
    {
      id: APP_ROUTES.THREAT_INTEL,
      code: "05",
      tag: "AI SOC",
      label: "Inteligencia de Amenazas IA",
      desc: "Agente LLM & síntesis de reglas",
    },
    {
      id: APP_ROUTES.COMPENHACK,
      code: "06",
      tag: "PORTAL",
      label: "CompenHack (Web Real)",
      desc: "Simulación web cliente",
    },
  ];

  const displayName = authUser ? authUser.username : (profile.name || DEFAULT_OPERATOR_NAME);
  const displayRole = authUser ? authUser.role : (profile.role || DEFAULT_OPERATOR_ROLE);

  return (
    <aside className="w-72 shrink-0 bg-[#070709] border-r border-zinc-800 flex flex-col justify-between min-h-screen select-none font-sans">
      <div>
        <div className="p-6 border-b border-zinc-800/80">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-none inline-block shadow-[0_0_8px_rgba(160,255,160,0.8)]"></span>
              <span className="font-mono text-base font-bold tracking-wider text-white uppercase">
                {APP_BRAND_NAME}
              </span>
            </div>
            <span className="font-mono text-[10px] tracking-widest px-1.5 py-0.5 border border-zinc-700 text-zinc-400">
              v3.0-AI
            </span>
          </div>
          <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
            {APP_SUBTITLE}
          </div>
        </div>

        <nav className="p-3 space-y-1">
          <div className="px-3 py-2 text-[10px] font-mono uppercase text-zinc-500 tracking-wider flex items-center justify-between">
            <span>MÓDULOS DEL PERÍMETRO</span>
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-bold border ${
                backendOnline
                  ? "bg-emerald-950/40 text-emerald-400 border-emerald-800"
                  : "bg-red-950/40 text-red-400 border-red-800"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  backendOnline ? "bg-emerald-400 animate-pulse" : "bg-red-400"
                }`}
              />
              {backendOnline ? "GATEWAY ONLINE" : "OFFLINE"}
            </span>
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
                    isActive ? (item.id === APP_ROUTES.THREAT_INTEL ? "text-purple-400" : "text-emerald-400") : "text-zinc-600"
                  }`}
                >
                  [{item.code}]
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium tracking-tight truncate">
                      {item.label}
                    </span>
                    <span
                      className={`font-mono text-[9px] px-1 border ${
                        item.id === APP_ROUTES.THREAT_INTEL
                          ? "border-purple-800 text-purple-400 bg-purple-950/30"
                          : "border-zinc-800 text-zinc-500"
                      }`}
                    >
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

      {/* Sección de Autenticación / Operador */}
      <div className="p-4 border-t border-zinc-800/80 bg-black/40 space-y-2.5">
        <div
          onClick={onOpenProfile}
          className="flex items-center gap-3 p-2 border border-zinc-800 bg-zinc-950/80 hover:border-zinc-700 cursor-pointer transition-colors"
        >
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={displayName}
              className="w-8 h-8 object-cover border border-zinc-700"
            />
          ) : (
            <div className="w-8 h-8 bg-zinc-900 border border-zinc-700 flex items-center justify-center font-mono text-xs font-bold text-zinc-300">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-200 truncate">
                {displayName}
              </span>
              <span
                className={`font-mono text-[9px] uppercase px-1 border ${
                  !isAuthenticated
                    ? "text-amber-400 border-amber-800 bg-amber-950/40"
                    : displayRole.toLowerCase().includes("admin")
                    ? "text-red-400 border-red-700 bg-red-950/60 font-bold"
                    : displayRole.toLowerCase().includes("auditor")
                    ? "text-amber-400 border-amber-700 bg-amber-950/60 font-bold"
                    : "text-emerald-400 border-emerald-800 bg-emerald-950/40 font-bold"
                }`}
              >
                {!isAuthenticated
                  ? "INVITADO"
                  : displayRole.toLowerCase().includes("admin")
                  ? "ADMIN"
                  : displayRole.toLowerCase().includes("auditor")
                  ? "AUDITOR"
                  : "OPERADOR"}
              </span>
            </div>
            <div className="text-[10px] font-mono text-zinc-500 truncate">
              {displayRole}
            </div>
          </div>
        </div>

        {/* Botón de Login / Logout */}
        <div className="flex items-center justify-between gap-2 font-mono text-[11px]">
          {isAuthenticated ? (
            <button
              onClick={onLogout}
              className="w-full py-1.5 px-2 bg-red-950/30 hover:bg-red-900/40 border border-red-900/60 text-red-300 text-center transition-colors text-[10px] font-bold"
            >
              [CERRAR SESIÓN JWT]
            </button>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="w-full py-1.5 px-2 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-700 text-emerald-300 text-center transition-colors text-[10px] font-bold flex items-center justify-center gap-1.5"
            >
              <span>[INICIAR SESIÓN / REGISTRO]</span>
            </button>
          )}
        </div>

        <div className="flex items-center justify-between font-mono text-[9px] text-zinc-600 px-1 pt-1">
          <span>HOST: LOCALHOST</span>
          <span>SEC: {isAuthenticated ? "BEARER TOKEN" : "GUEST"}</span>
        </div>
      </div>
    </aside>
  );
};
