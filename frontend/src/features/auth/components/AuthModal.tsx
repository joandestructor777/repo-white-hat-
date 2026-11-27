import React, { useState } from "react";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (username: string, password: string) => Promise<any>;
  onRegister: (username: string, email: string, password: string, role?: string) => Promise<any>;
  loading: boolean;
  error: string | null;
  onClearError: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onRegister,
  loading,
  error,
  onClearError,
}) => {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("SOC Lead Analyst");

  const handleTabChange = (newTab: "login" | "register") => {
    setTab(newTab);
    onClearError();
  };

  const handleFillDemo = (demoUser: "admin" | "analista" | "auditor") => {
    if (demoUser === "admin") {
      setUsername("admin");
      setPassword("AdminPassword123!");
    } else if (demoUser === "auditor") {
      setUsername("auditor");
      setPassword("AuditorPassword123!");
    } else {
      setUsername("analista");
      setPassword("Password123!");
    }
    onClearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (tab === "login") {
        await onLogin(username, password);
      } else {
        await onRegister(username, email || `${username}@joanvector.local`, password, role);
      }
      onClose();
      // Limpiar campos
      setUsername("");
      setPassword("");
      setEmail("");
    } catch {
      // El error ya es manejado por useAuth
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={tab === "login" ? "Autenticación de Operador SOC • Acceso Seguro" : "Registro de Nuevo Analista Forense"}
      maxWidth="md"
    >
      <div className="font-mono text-xs space-y-4">
        {/* Selector de Pestañas */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-black border border-zinc-800">
          <button
            type="button"
            onClick={() => handleTabChange("login")}
            className={`py-2 px-3 text-center transition-colors font-bold ${
              tab === "login"
                ? "bg-zinc-900 border border-zinc-700 text-emerald-400"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            [INICIAR SESIÓN]
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("register")}
            className={`py-2 px-3 text-center transition-colors font-bold ${
              tab === "register"
                ? "bg-zinc-900 border border-zinc-700 text-emerald-400"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            [REGISTRO RÁPIDO]
          </button>
        </div>

        {/* Botones de Pruebas Rápidas de Roles */}
        {tab === "login" && (
          <div className="p-3 bg-zinc-950/80 border border-zinc-800 space-y-2">
            <span className="text-[10px] text-zinc-500 block uppercase font-bold">
              Autocompletar Credenciales por Rol (Demostración RBAC):
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo("admin")}
                className="px-2 py-1.5 text-[10px] bg-red-950/40 border border-red-700/80 text-red-300 hover:bg-red-900/50 transition-colors uppercase font-bold text-center"
              >
                [ADMIN]
                <span className="block text-[8px] text-zinc-400 font-normal">Acceso Total</span>
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo("analista")}
                className="px-2 py-1.5 text-[10px] bg-emerald-950/40 border border-emerald-700/80 text-emerald-300 hover:bg-emerald-900/50 transition-colors uppercase font-bold text-center"
              >
                [SOC LEAD]
                <span className="block text-[8px] text-zinc-400 font-normal">Forense + Reglas</span>
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo("auditor")}
                className="px-2 py-1.5 text-[10px] bg-amber-950/40 border border-amber-700/80 text-amber-300 hover:bg-amber-900/50 transition-colors uppercase font-bold text-center"
              >
                [AUDITOR]
                <span className="block text-[8px] text-zinc-400 font-normal">Solo Lectura</span>
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-950/40 border border-red-800 text-red-300 text-xs flex items-center gap-2">
            <span className="text-red-500 font-bold">[ERROR]:</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-zinc-400 uppercase text-[10px] font-semibold mb-1">
              Nombre de Usuario {tab === "login" && "o Correo"}
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={tab === "login" ? "analista" : "nombre.operador"}
              className="w-full bg-black border border-zinc-800 px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {tab === "register" && (
            <div>
              <label className="block text-zinc-400 uppercase text-[10px] font-semibold mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operador@joanvector.local"
                className="w-full bg-black border border-zinc-800 px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          <div>
            <label className="block text-zinc-400 uppercase text-[10px] font-semibold mb-1">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-black border border-zinc-800 px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {tab === "register" && (
            <div>
              <label className="block text-zinc-400 uppercase text-[10px] font-semibold mb-1">
                Rol Operativo en SOC (Permisos RBAC)
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-black border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Administrator">Administrator (Control Total y Gestión)</option>
                <option value="SOC Lead Analyst">SOC Lead Analyst (Forense e Inyección de Reglas)</option>
                <option value="Security Engineer">Security Engineer (Políticas y Reglas)</option>
                <option value="Auditor Externo">Auditor Externo (Solo Lectura • Normativo)</option>
              </select>
              <p className="text-[10px] text-zinc-500 mt-1 font-mono">
                {role === "Auditor Externo"
                  ? "⚠️ Rol de solo lectura: Puede consultar telemetría pero no modificar reglas."
                  : role === "Administrator"
                  ? "🛡️ Privilegios administrativos completos en todo el Gateway."
                  : "✓ Permisos estándar de operador de seguridad."}
              </p>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between gap-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white font-mono text-xs font-bold transition-colors cursor-pointer"
            >
              [CANCELAR]
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 bg-emerald-950/90 hover:bg-emerald-900 border-2 border-emerald-500 text-emerald-100 hover:text-white font-mono text-xs font-bold transition-all shadow-[0_0_12px_rgba(16,185,129,0.3)] cursor-pointer text-center"
            >
              {loading
                ? "[AUTENTICANDO...]"
                : tab === "login"
                ? "[INGRESAR AL GATEWAY]"
                : "[COMPLETAR REGISTRO]"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
