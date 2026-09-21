import React, { useState, useEffect } from "react";
import { Navbar } from "./components/layout/Navbar";
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
    <div className="min-h-screen bg-[#050507] text-[#f4f4f5] flex flex-col font-sans selection:bg-white selection:text-black overflow-x-hidden">
      {/* Top Cyber Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        backendOnline={backendOnline}
        profile={profile}
        onSaveProfile={updateProfile}
        onUploadImage={uploadCustomImage}
        onRemoveAvatar={removeAvatar}
      />

      {/* Main Feature Container with generous padding */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 min-w-0">
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

      {/* Quick modal trigger from anywhere */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onSaveProfile={updateProfile}
        onUploadImage={uploadCustomImage}
        onRemoveAvatar={removeAvatar}
      />

      {/* Minimal Footer with generous padding */}
      <footer className="border-t border-zinc-900 bg-[#070709] py-6 text-center text-xs text-zinc-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>AI Assistant Security Guardrail • FastAPI + PostgreSQL Architecture</span>
          <span className="text-[11px] text-zinc-600">Features / Constants / Shared / UI Architecture</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
