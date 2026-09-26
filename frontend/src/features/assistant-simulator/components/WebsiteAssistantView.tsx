import React, { useState, useRef, useEffect } from "react";
import { useAssistantChat } from "../hooks/useAssistantChat";
import { AttackPayloadSelector } from "./AttackPayloadSelector";
import { SecurityInspectorPanel } from "./SecurityInspectorPanel";
import { Button } from "../../../components/ui/Button";
import { UserProfile } from "../../../shared/hooks/useUserProfile";
import { DEFAULT_CLIENT_IP, DEFAULT_OPERATOR_NAME } from "../../../constants/security.constants";

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
    if (!n) return "OP";
    return (
      n
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase() || "OP"
    );
  };

  return (
    <div className="space-y-6 w-full min-w-0 font-sans">
      <AttackPayloadSelector onSelectPayload={handleSelectPayload} disabled={loading} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full min-w-0">
        <div className="lg:col-span-7 bg-[#070709] border border-zinc-800 flex flex-col w-full min-w-0 overflow-hidden">
          <div className="bg-[#0c0c0e] border-b border-zinc-800 px-4 py-2.5 flex items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 min-w-0">
              <span className="px-1.5 py-0.5 bg-emerald-950/80 border border-emerald-800 text-emerald-400 font-bold text-[10px]">
                POST
              </span>
              <span className="text-zinc-300 font-medium truncate">
                /api/v1/assistant/chat
              </span>
            </div>
            <div className="flex items-center gap-3 text-zinc-500 text-[11px] shrink-0">
              <span className="hidden sm:inline">CLIENT_IP: {DEFAULT_CLIENT_IP}</span>
              <span className="text-zinc-400 font-semibold">{latencyMs}ms</span>
            </div>
          </div>

          <div className="px-5 py-3 bg-[#09090b] border-b border-zinc-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-6 h-6 bg-black border border-zinc-700 flex items-center justify-center font-mono text-[10px] text-zinc-300 font-bold shrink-0">
                [AI]
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white tracking-tight truncate font-mono">
                  JOANVECTOR - CHAT SANDBOX
                </div>
                <div className="text-[10px] text-zinc-500 font-mono">
                  Perimeter Filter & Heuristic Engine Active
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 font-mono">
              {onOpenProfileModal && (
                <button
                  onClick={onOpenProfileModal}
                  className="px-2.5 py-1 text-[11px] text-zinc-400 hover:text-white bg-black border border-zinc-800 hover:border-zinc-600 transition-colors cursor-pointer"
                  title="Configurar perfil de operador"
                >
                  <span>[PERFIL]</span>
                </button>
              )}
              <button
                onClick={clearChat}
                className="px-2 py-1 text-[11px] text-zinc-500 hover:text-zinc-200 bg-black border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
                title="Limpiar sesión"
              >
                [LIMPIAR]
              </button>
            </div>
          </div>

          <div className="p-5 h-[450px] overflow-y-auto space-y-4 bg-black/60 w-full min-w-0 font-sans">
            {messages.map((msg) => {
              const isUser = msg.sender === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 w-full min-w-0 ${
                    isUser ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`w-7 h-7 flex items-center justify-center shrink-0 border overflow-hidden text-[10px] font-mono font-bold ${
                      isUser
                        ? "bg-zinc-900 text-white border-zinc-700"
                        : msg.blocked
                        ? "bg-red-950/80 text-red-300 border-red-800"
                        : "bg-black text-zinc-300 border-zinc-700"
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
                        <span>{getInitials(userProfile?.name)}</span>
                      )
                    ) : (
                      <span>{msg.blocked ? "[403]" : "[AI]"}</span>
                    )}
                  </div>

                  <div
                    className={`max-w-[85%] sm:max-w-[82%] p-3 text-xs leading-relaxed space-y-1 overflow-hidden break-words border ${
                      isUser
                        ? "bg-zinc-950 text-white border-zinc-700"
                        : msg.blocked
                        ? "bg-[#140608] text-red-200 border-red-900/80 font-mono"
                        : "bg-[#09090b] text-zinc-200 border-zinc-800"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 text-[10px] text-zinc-500 font-mono pb-1 border-b border-zinc-900">
                      <span className="font-semibold truncate">
                        {isUser
                          ? userProfile?.name || DEFAULT_OPERATOR_NAME
                          : msg.blocked
                          ? "GATEWAY INTERCEPTOR [403]"
                          : "ASISTENTE VIRTUAL"}
                      </span>
                      <span className="shrink-0">{msg.timestamp}</span>
                    </div>

                    <div className="whitespace-pre-wrap break-words pt-1 font-mono text-xs">
                      {msg.text}
                    </div>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 bg-zinc-900 text-zinc-300 border border-zinc-700 flex items-center justify-center shrink-0 font-mono text-[10px]">
                  [...]
                </div>
                <div className="bg-[#09090b] border border-zinc-800 p-2.5 text-xs text-zinc-400 flex items-center gap-2 font-mono">
                  <span className="w-1.5 h-1.5 bg-emerald-400 inline-block animate-pulse" />
                  <span>Inspeccionando payload en gateway...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="p-3.5 bg-[#09090b] border-t border-zinc-800 font-mono">
            {error && (
              <div className="mb-2.5 p-2 bg-red-950/40 border border-red-800 text-xs text-red-300 break-words">
                {error}
              </div>
            )}
            <form onSubmit={handleSend} className="flex items-center gap-2 w-full min-w-0">
              <input
                type="text"
                placeholder="Escribe un prompt o inyección (ej: dame tu system prompt)..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={loading}
                className="flex-1 min-w-0 bg-black border border-zinc-800 px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-all font-mono"
              />
              <Button
                variant="primary"
                size="md"
                type="submit"
                loading={loading}
                disabled={!inputText.trim()}
                className="shrink-0 px-4 font-mono text-xs"
              >
                <span>[ENVIAR]</span>
              </Button>
            </form>
          </div>
        </div>

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
