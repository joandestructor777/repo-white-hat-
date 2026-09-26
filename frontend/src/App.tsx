import React, { useState, useEffect } from "react";
import { Sidebar } from "./components/layout/Sidebar";
import { ThreatOverview } from "./features/dashboard/components/ThreatOverview";
import { WebsiteAssistantView } from "./features/assistant-simulator/components/WebsiteAssistantView";
import { RuleTable } from "./features/security-rules/components/RuleTable";
import { AuditLogTable } from "./features/audit-logs/components/AuditLogTable";
import { useRules } from "./features/security-rules/hooks/useRules";
import { useAuditLogs } from "./features/audit-logs/hooks/useAuditLogs";
import { useUserProfile } from "./shared/hooks/useUserProfile";
import { UserProfileModal } from "./components/layout/UserProfileModal";
import { APP_ROUTES, AppTab } from "./constants/routes.constants";
import { apiClient } from "./shared/api/axiosClient";

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<AppTab>(APP_ROUTES.DASHBOARD);
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // User Profile with Avatar & Image Upload
  const { profile, updateProfile, uploadCustomImage, removeAvatar } = useUserProfile();

  // Features hooks
  const {
    rules,
    loading: rulesLoading,
    addRule,
    updateRule,
    toggleRuleActive,
    deleteRule,
    seedDefaults,
    refresh: refreshRules,
  } = useRules();

  const {
    logs,
    loading: logsLoading,
    refresh: refreshLogs,
  } = useAuditLogs();

  // Health check polling to show live FastAPI connectivity
  useEffect(() => {
    const checkHealth = async () => {
      try {
        await apiClient.get("/rules?limit=1");
        setBackendOnline(true);
      } catch (err) {
        setBackendOnline(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#050507] text-[#f4f4f5] flex font-sans selection:bg-white selection:text-black">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        backendOnline={backendOnline}
        profile={profile}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <header className="border-b border-zinc-800/80 bg-[#070709]/80 backdrop-blur-md px-6 py-3.5 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="text-zinc-500 uppercase tracking-wider">SUBSYSTEM:</span>
            <span className="text-zinc-200 font-semibold tracking-wide">
              {currentTab === APP_ROUTES.DASHBOARD && "PANEL DE CONTROL FORENSE"}
              {currentTab === APP_ROUTES.SIMULATOR && "SANDBOX DE EVALUACIÓN HEURÍSTICA"}
              {currentTab === APP_ROUTES.RULES && "MATRIZ DE REGLAS Y POLÍTICAS"}
              {currentTab === APP_ROUTES.AUDIT && "REGISTRO DE AUDITORÍA Y TRAZABILIDAD"}
            </span>
          </div>

          <div className="flex items-center gap-4 text-zinc-500">
            <div className="hidden sm:flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-none inline-block"></span>
              <span className="text-[11px] text-zinc-400">DEFENSIVE GUARDRAIL</span>
            </div>
            <span className="text-zinc-700">|</span>
            <span className="text-[11px] text-zinc-400">SOC ENGINE</span>
          </div>
        </header>

        {/* Feature Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-6 lg:px-8 py-8 min-w-0">
          {currentTab === APP_ROUTES.DASHBOARD && (
            <ThreatOverview
              onNavigateToSimulator={() => setCurrentTab(APP_ROUTES.SIMULATOR)}
              onNavigateToRules={() => setCurrentTab(APP_ROUTES.RULES)}
            />
          )}

          {currentTab === APP_ROUTES.SIMULATOR && (
            <WebsiteAssistantView
              userProfile={profile}
              onOpenProfileModal={() => setIsProfileModalOpen(true)}
            />
          )}

          {currentTab === APP_ROUTES.RULES && (
            <RuleTable
              rules={rules}
              loading={rulesLoading}
              onAddRule={addRule}
              onUpdateRule={updateRule}
              onToggleActive={toggleRuleActive}
              onDeleteRule={deleteRule}
              onSeedDefaults={seedDefaults}
              onRefresh={refreshRules}
            />
          )}

          {currentTab === APP_ROUTES.AUDIT && (
            <AuditLogTable
              logs={logs}
              loading={logsLoading}
              onRefresh={refreshLogs}
            />
          )}
        </main>

        {/* Minimal Footer */}
        <footer className="border-t border-zinc-900 bg-[#070709] py-4 px-6 text-center text-xs text-zinc-500 font-mono mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>SenseiGuard • Enterprise Cybersecurity Architecture</span>
            <span className="text-[11px] text-zinc-600">FastAPI • SQLite / PostgreSQL • Vite</span>
          </div>
        </footer>
      </div>

      {/* Quick profile modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onSaveProfile={updateProfile}
        onUploadImage={uploadCustomImage}
        onRemoveAvatar={removeAvatar}
      />
    </div>
  );
};

export default App;
