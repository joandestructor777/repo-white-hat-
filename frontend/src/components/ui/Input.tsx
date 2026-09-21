import React from "react";
import clsx from "clsx";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helper,
  className,
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={clsx(
          "w-full bg-[#0a0a0c] border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500",
          "focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      {helper && !error && <p className="mt-1 text-xs text-zinc-500">{helper}</p>}
    </div>
  );
};
