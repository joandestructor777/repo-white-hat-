import { useState } from "react";
import { assistantService, AssistantChatResponse, SecurityInspectionResult } from "../services/assistantService";
import { DEFAULT_CHAT_WELCOME } from "../../../constants/security.constants";

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  securityResult?: SecurityInspectionResult;
  blocked?: boolean;
}

export function useAssistantChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "assistant",
      text: DEFAULT_CHAT_WELCOME,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [lastSecurityResult, setLastSecurityResult] = useState<SecurityInspectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setError(null);

    try {
      const res: AssistantChatResponse = await assistantService.sendMessage(text);
      setLastSecurityResult(res.security_eval);

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "assistant",
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        securityResult: res.security_eval,
        blocked: res.blocked,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "No se pudo comunicar con el backend de seguridad.");
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome-1",
        sender: "assistant",
        text: DEFAULT_CHAT_WELCOME,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setLastSecurityResult(null);
  };

  return {
    messages,
    loading,
    lastSecurityResult,
    error,
    sendMessage,
    clearChat,
  };
}
