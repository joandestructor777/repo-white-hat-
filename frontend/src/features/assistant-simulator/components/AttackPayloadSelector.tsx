import React from "react";
import { Terminal, ArrowRight, Play } from "lucide-react";
import { DEMO_ATTACK_PAYLOADS } from "../../../constants/security.constants";

interface AttackPayloadSelectorProps {
  onSelectPayload: (prompt: string) => void;
  disabled?: boolean;
}

export const AttackPayloadSelector: React.FC<AttackPayloadSelectorProps> = ({
  onSelectPayload,
  disabled,
}) => {
  return (
    <div className="bg-[#0e0e11] border border-[#222226] rounded-xl p-4 w-full min-w-0">
      <div className="flex items-center justify-between mb-3 gap-2 flex-wrap pb-2 border-b border-[#1c1c20]">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-xs font-mono font-medium text-zinc-300">
            Escenarios de Prueba (Vectores OWASP & CWE):
          </span>
        </div>
        <span className="text-[10px] text-zinc-500 font-mono">
          Selecciona un payload para inyectar en el Gateway
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {DEMO_ATTACK_PAYLOADS.map((p, idx) => {
          const isSafe = p.expected === "SAFE";
          return (
            <button
              key={idx}
              disabled={disabled}
              onClick={() => onSelectPayload(p.prompt)}
              className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer border text-left ${
                isSafe
                  ? "bg-[#141418] border-zinc-800 text-zinc-300 hover:border-zinc-600 hover:text-white"
                  : "bg-[#141418] border-zinc-800 text-zinc-300 hover:border-red-900/80 hover:text-red-300"
              }`}
            >
              <span
                className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${
                  isSafe
                    ? "bg-emerald-950/40 text-emerald-400 border-emerald-900/60"
                    : "bg-red-950/40 text-red-400 border-red-900/60"
                }`}
              >
                {p.code}
              </span>
              <span className="truncate max-w-[180px] sm:max-w-[220px]">{p.title}</span>
              <Play className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100 transition-opacity text-zinc-400 shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
