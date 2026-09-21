import React, { useState } from "react";
import { Terminal, Sliders, History, Activity, ChevronDown } from "lucide-react";
import { APP_ROUTES, AppTab } from "../../constants/routes.constants";
import { UserProfile } from "../../shared/hooks/useUserProfile";
import { UserProfileModal } from "./UserProfileModal";

interface NavbarProps {
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  backendOnline: boolean;
  profile: UserProfile;
  onSaveProfile: (name: string, role: string, avatarUrl: string) => void;
  onUploadImage: (file: File) => Promise<string>;
  onRemoveAvatar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  backendOnline,
  profile,
  onSaveProfile,
  onUploadImage,
  onRemoveAvatar,
}) => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const navItems = [
    { id: APP_ROUTES.DASHBOARD, label: "Métricas & SOC", icon: Activity },
    { id: APP_ROUTES.SIMULATOR, label: "Playground & Inspector", icon: Terminal },
    { id: APP_ROUTES.RULES, label: "Políticas de Seguridad", icon: Sliders },
    { id: APP_ROUTES.AUDIT, label: "Logs de Auditoría", icon: History },
  ];

  const getInitials = (n: string) => {
    return n
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "AS";
  };

  return (
    <>
      <header className="border-b border-[#222226] bg-[#09090b]/95 backdrop-blur-md sticky top-0 z-40 w-full overflow-hidden shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 sm:h-22 gap-4">
            {/* Brand Logo with Prominent Hacker Icon */}
            <div className="flex items-center gap-3.5 sm:gap-4 shrink-0 min-w-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden border-2 border-zinc-600/90 bg-zinc-950 flex items-center justify-center shrink-0 shadow-xl shadow-black/80 ring-1 ring-white/10 group cursor-pointer hover:border-white transition-colors">
                <img
                  src="/hacker-icon.jpg"
                  alt="Hacker Icon Logo"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base sm:text-lg tracking-tight text-white font-mono truncate">
                    SENTRY·GUARD
                  </span>
                  <span className="hidden xs:inline-block text-[11px] px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700 font-mono shrink-0 font-semibold">
                    v1.0
                  </span>
                </div>
                <p className="text-xs text-zinc-400 font-mono truncate hidden md:block">
                  AI Security Gateway & Reverse Proxy
                </p>
              </div>
            </div>

            {/* Segmented Flat Navigation (Linear Style) */}
            <nav className="hidden lg:flex items-center gap-1.5 bg-[#121215] p-1.5 rounded-xl border border-[#222226] shrink-0">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id as AppTab)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-[13px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? "bg-[#27272a] text-white shadow-sm font-semibold"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-zinc-500"}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right side: Status and User Profile */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Clean solid status dot */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#121215] border border-[#222226] text-xs shrink-0">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    backendOnline ? "bg-emerald-400" : "bg-red-500"
                  }`}
                />
                <span className="text-[11px] text-zinc-400 font-mono hidden sm:inline font-medium">
                  {backendOnline ? "Gateway: 8000 OK" : "Gateway: Offline"}
                </span>
              </div>

              {/* User Avatar Button with larger scale to balance header */}
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="flex items-center gap-3 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-[#121215] border border-[#222226] hover:border-zinc-700 hover:bg-zinc-800/50 transition-all cursor-pointer group"
                title="Configurar perfil e imagen de usuario"
              >
                <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden border border-zinc-700 bg-zinc-950 shrink-0 flex items-center justify-center shadow-md">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-white font-mono text-xs font-bold">
                      {getInitials(profile.name)}
                    </div>
                  )}
                </div>

                <div className="text-left hidden sm:block max-w-[120px] md:max-w-[140px] min-w-0">
                  <div className="text-xs font-semibold text-zinc-200 truncate font-mono">
                    {profile.name}
                  </div>
                  <div className="text-[10px] text-zinc-500 truncate font-mono">
                    {profile.role}
                  </div>
                </div>

                <ChevronDown className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors shrink-0 hidden sm:block" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs (Mobile & Tablets below lg) */}
        <div className="lg:hidden flex overflow-x-auto no-scrollbar border-t border-[#222226] px-3 py-2 gap-2 bg-[#09090b]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id as AppTab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs whitespace-nowrap shrink-0 transition-all ${
                  isActive ? "bg-zinc-800 text-white font-medium" : "text-zinc-400 hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* User Profile / Avatar Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onSaveProfile={onSaveProfile}
        onUploadImage={onUploadImage}
        onRemoveAvatar={onRemoveAvatar}
      />
    </>
  );
};
