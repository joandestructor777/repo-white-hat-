import React, { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "md",
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClass = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className={`w-full ${maxWidthClass} bg-[#09090b] border border-zinc-700/80 shadow-2xl flex flex-col font-sans`}
      >
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-zinc-800 bg-[#0c0c0e]">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 bg-emerald-500 inline-block" />
            <span className="text-xs font-mono font-semibold tracking-wider uppercase text-zinc-100">
              {title}
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-2 py-0.5 font-mono text-xs text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-600 bg-zinc-900 transition-colors"
          >
            [X]
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[80vh]">{children}</div>
      </div>
    </div>
  );
};
