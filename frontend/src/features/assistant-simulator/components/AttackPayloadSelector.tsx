import React from "react";
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
    <div className="bg-[#070709] border border-zinc-800 p-4 w-full min-w-0 font-sans">
      <div className="flex items-center justify-between mb-3 gap-2 flex-wrap pb-2 border-b border-zinc-800/80">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-emerald-500 inline-block" />
          <span className="text-xs font-mono font-medium text-zinc-300 uppercase tracking-wider">
            Vectores de Prueba (OWASP LLM & CWE Payloads):
          </span>
        </div>
        <span className="text-[10px] text-zinc-500 font-mono">
          Selecciona un payload para evaluar en el Gateway
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
              className={`group flex items-center gap-2 px-3 py-1.5 text-xs font-mono transition-all cursor-pointer border text-left ${
                isSafe
                  ? "bg-black border-zinc-800 text-zinc-300 hover:border-zinc-600 hover:text-white"
                  : "bg-black border-zinc-800 text-zinc-300 hover:border-red-900 hover:text-red-300"
              }`}
            >
              <span
                className={`px-1.5 py-0.5 text-[10px] font-bold border ${
                  isSafe
                    ? "bg-emerald-950/40 text-emerald-400 border-emerald-900"
                    : "bg-red-950/40 text-red-400 border-red-900"
                }`}
              >
                {p.code}
              </span>
              <span className="truncate max-w-[180px] sm:max-w-[220px]">{p.title}</span>
              <span className="text-[10px] text-zinc-500 group-hover:text-zinc-300 transition-colors">
                [&gt;]
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
