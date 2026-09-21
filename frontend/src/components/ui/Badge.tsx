import React from "react";
import clsx from "clsx";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "danger" | "warning" | "success" | "outline";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  className,
}) => {
  const variantStyles = {
    default: "bg-zinc-900 text-zinc-300 border-zinc-800",
    danger: "bg-red-950/50 text-red-300 border-red-800/80",
    warning: "bg-yellow-950/40 text-yellow-300 border-yellow-800/70",
    success: "bg-emerald-950/40 text-emerald-300 border-emerald-800/70",
    outline: "bg-transparent text-zinc-300 border-zinc-700",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
