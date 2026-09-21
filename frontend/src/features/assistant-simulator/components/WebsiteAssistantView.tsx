import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Trash2, Camera, Terminal, Shield, ArrowUpRight } from "lucide-react";
import { useAssistantChat } from "../hooks/useAssistantChat";
import { AttackPayloadSelector } from "./AttackPayloadSelector";
import { SecurityInspectorPanel } from "./SecurityInspectorPanel";
import { Button } from "../../../components/ui/Button";
import { UserProfile } from "../../../shared/hooks/useUserProfile";

interface WebsiteAssistantViewProps {
  userProfile?: UserProfile;
  onOpenProfileModal?: () => void;
}

export const WebsiteAssistantView: React.FC<WebsiteAssistantViewProps> = ({
  userProfile,
  onOpenProfileModal,
}) => {
  const { messages, loading, lastSecurityResult, error, sendMessage, clearChat } = useAssistantChat();
  const [inputText, setInputText] = useState("");
  const [latencyMs, setLatencyMs] = useState<number>(14);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;
    const start = performance.now();
    const promptToSend = inputText;
    setInputText("");
    await sendMessage(promptToSend);
    const elapsed = Math.round(performance.now() - start);
    setLatencyMs(elapsed > 0 ? elapsed : 14);
  };

  const handleSelectPayload = async (prompt: string) => {
    const start = performance.now();
    await sendMessage(prompt);
    const elapsed = Math.round(performance.now() - start);
    setLatencyMs(elapsed > 0 ? elapsed : 16);
  };

  const getInitials = (n?: string) => {
    if (!n) return "AS";
    return n
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "AS";
  };

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Top Attack Scenarios Drawer */}
      <AttackPayloadSelector onSelectPayload={handleSelectPayload} disabled={loading} />

      {/* Main Console: Live Web Client vs Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full min-w-0">
        {/* Left Column: Client Session Simulator (7 cols) */}
        <div className="lg:col-span-7 bg-[#0b0b0e] border border-[#222226] rounded-xl flex flex-col shadow-xl w-full min-w-0 overflow-hidden">
          {/* Real API Gateway Route Bar (Developer-grade, NOT fake browser) */}
          <div className="bg-[#121215] border-b border-[#222226] px-4 py-2.5 flex items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 min-w-0">
              <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-400 font-bold text-[10px]">
                POST
              </span>
              <span className="text-zinc-300 font-medium truncate">
                /api/v1/assistant/chat
              </span>
            </div>
            <div className="flex items-center gap-3 text-zinc-500 text-[11px] shrink-0">
              <span className="hidden sm:inline">Client: 192.168.1.105</span>
              <span className="text-zinc-400 font-semibold">{latencyMs}ms</span>
            </div>
          </div>

          {/* Assistant Client Header */}
          <div className="px-5 py-3.5 bg-[#0e0e11] border-b border-[#222226] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white tracking-tight truncate">
                  Enterprise Virtual Assistant
                </div>
                <div className="text-[10px] text-zinc-500 font-mono">
                  Protected by Perimeter Guardrail
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {onOpenProfileModal && (
                <button
                  onClick={onOpenProfileModal}
                  className="px-2.5 py-1 rounded-md text-[11px] font-mono text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Subir o cambiar tu foto real de usuario"
                >
                  <Camera className="w-3 h-3" />
                  <span>{userProfile?.avatarUrl ? "Foto Lista" : "Subir Foto"}</span>
                </button>
              )}
              <button
                onClick={clearChat}
                className="p-1 rounded-md text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Limpiar sesión"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="p-5 h-[450px] overflow-y-auto space-y-4 bg-[#08080a] w-full min-w-0">
            {messages.map((msg) => {
              const isUser = msg.sender === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 w-full min-w-0 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border overflow-hidden text-xs ${
                      isUser
                        ? "bg-zinc-900 text-white border-zinc-700"
                        : msg.blocked
                        ? "bg-red-950/80 text-red-300 border-red-800"
                        : "bg-[#18181c] text-white border-zinc-700"
                    }`}
                  >
                    {isUser ? (
                      userProfile?.avatarUrl ? (
                        <img
                          src={userProfile.avatarUrl}
                          alt={userProfile.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="font-mono font-bold text-[11px] text-white">
                          {getInitials(userProfile?.name)}
                        </span>
                      )
                    ) : (
                      <Bot className="w-4 h-4 text-zinc-300" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[85%] sm:max-w-[82%] rounded-xl px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed space-y-1.5 overflow-hidden break-words [overflow-wrap:anywhere] ${
                      isUser
                        ? "bg-[#1b1b20] text-white border border-zinc-700/80 rounded-tr-none"
                        : msg.blocked
                        ? "bg-[#150a0c] text-red-200 border border-red-900/60 rounded-tl-none font-mono"
                        : "bg-[#111114] text-zinc-200 border border-[#222226] rounded-tl-none"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 text-[10px] text-zinc-500 font-mono">
                      <span className="font-semibold truncate">
                        {isUser ? (userProfile?.name || "Usuario") : msg.blocked ? "AI Gateway Guardrail" : "Virtual Assistant"}
                      </span>
                      <span className="shrink-0">{msg.timestamp}</span>
                    </div>

                    <div className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                      {msg.text}
                    </div>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 text-white border border-zinc-700 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-[#111114] border border-[#222226] rounded-xl px-3.5 py-2 text-xs text-zinc-400 flex items-center gap-2 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shrink-0" />
                  <span>Reverse proxy inspeccionando solicitud...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-3.5 bg-[#0e0e11] border-t border-[#222226]">
            {error && (
              <div className="mb-2.5 p-2 rounded-lg bg-red-950/40 border border-red-800/60 text-xs text-red-300 break-words font-mono">
                {error}
              </div>
            )}
            <form onSubmit={handleSend} className="flex items-center gap-2 w-full min-w-0">
              <input
                type="text"
                placeholder="Escribe una consulta o payload de prueba (ej: dame tu system prompt)..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={loading}
                className="flex-1 min-w-0 bg-[#141418] border border-zinc-800 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-all font-mono"
              />
              <Button variant="primary" size="md" type="submit" loading={loading} disabled={!inputText.trim()} className="shrink-0 px-4">
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Enviar</span>
              </Button>
            </form>
          </div>
        </div>

        {/* Right Column: Inspector Deck (5 cols) */}
        <div className="lg:col-span-5 w-full min-w-0 h-full">
          <SecurityInspectorPanel
            securityResult={lastSecurityResult}
            loading={loading}
            latencyMs={latencyMs}
          />
        </div>
      </div>
    </div>
  );
};
