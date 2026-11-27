import React, { useState, useRef, useEffect } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { UserProfile } from "../../shared/hooks/useUserProfile";
import { DEFAULT_OPERATOR_NAME, DEFAULT_OPERATOR_ROLE } from "../../constants/security.constants";
import { authService, AuthUser } from "../../features/auth/services/authService";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (name: string, role: string, avatarUrl: string) => void;
  onUploadImage: (file: File) => Promise<string>;
  onRemoveAvatar?: () => void;
  authUser?: AuthUser | null;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  onUploadImage,
  onRemoveAvatar,
  authUser,
}) => {
  const [activeTab, setActiveTab] = useState<"profile" | "db_users">("profile");
  const [dbUsers, setDbUsers] = useState<AuthUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [name, setName] = useState(profile.name);
  const [role, setRole] = useState(profile.role);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDbUsers = async () => {
    setLoadingUsers(true);
    try {
      const users = await authService.getAllUsers();
      setDbUsers(users);
    } catch (e: any) {
      console.warn("Error al cargar usuarios de la base de datos:", e);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDbUsers();
    }
  }, [isOpen]);

  const handleProcessFile = async (file: File) => {
    try {
      setUploading(true);
      setError(null);
      const base64 = await onUploadImage(file);
      setAvatarUrl(base64);
    } catch (err: any) {
      setError(err.message || "Error al procesar el archivo de imagen.");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleProcessFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleProcessFile(file);
  };

  const handleRemovePhoto = () => {
    setAvatarUrl("");
    if (onRemoveAvatar) onRemoveAvatar();
  };

  const handleSave = () => {
    onSaveProfile(
      name.trim() || DEFAULT_OPERATOR_NAME,
      role.trim() || DEFAULT_OPERATOR_ROLE,
      avatarUrl
    );
    onClose();
  };

  const getInitials = (n: string) => {
    return (
      n
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase() || "JO"
    );
  };

  const getRoleBadgeStyle = (userRole: string) => {
    const r = userRole.toLowerCase();
    if (r.includes("admin")) return "bg-red-950/60 text-red-300 border-red-700";
    if (r.includes("soc lead")) return "bg-emerald-950/60 text-emerald-300 border-emerald-700";
    if (r.includes("security")) return "bg-cyan-950/60 text-cyan-300 border-cyan-700";
    if (r.includes("auditor")) return "bg-amber-950/60 text-amber-300 border-amber-700";
    return "bg-zinc-900 text-zinc-300 border-zinc-700";
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={activeTab === "profile" ? "CONFIGURACIÓN DE IDENTIDAD - OPERADOR" : "USUARIOS REGISTRADOS EN POSTGRESQL (RBAC)"}
      maxWidth="lg"
    >
      <div className="space-y-4 font-sans">
        {/* Selector de Pestañas */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-black border border-zinc-800 font-mono text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`py-2 px-3 text-center transition-colors font-bold ${
              activeTab === "profile"
                ? "bg-zinc-900 border border-zinc-700 text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            [MI IDENTIDAD]
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("db_users");
              fetchDbUsers();
            }}
            className={`py-2 px-3 text-center transition-colors font-bold flex items-center justify-center gap-1.5 ${
              activeTab === "db_users"
                ? "bg-zinc-900 border border-zinc-700 text-emerald-400"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <span>[BASE DE DATOS: USUARIOS ({dbUsers.length})]</span>
          </button>
        </div>

        {activeTab === "db_users" ? (
          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 bg-zinc-950/80 border border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-zinc-500 block uppercase font-bold">
                  Persistencia en PostgreSQL:
                </span>
                <span className="text-zinc-300 text-xs">
                  Tabla: <code className="text-emerald-400 font-bold">users</code> • Host: 127.0.0.1:5432
                </span>
              </div>
              <button
                type="button"
                onClick={fetchDbUsers}
                disabled={loadingUsers}
                className="px-3 py-1.5 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-700 text-emerald-300 text-[10px] font-bold uppercase transition-colors"
              >
                {loadingUsers ? "Cargando..." : "🔄 Refrescar de DB"}
              </button>
            </div>

            <div className="border border-zinc-800 overflow-x-auto max-h-72 overflow-y-auto">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400">
                    <th className="py-2 px-3">ID</th>
                    <th className="py-2 px-3">USUARIO</th>
                    <th className="py-2 px-3">CORREO</th>
                    <th className="py-2 px-3">ROL (RBAC)</th>
                    <th className="py-2 px-3">ESTADO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {dbUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-zinc-950/60 transition-colors">
                      <td className="py-2 px-3 text-zinc-500 font-bold">#{u.id}</td>
                      <td className="py-2 px-3 text-white font-bold">{u.username}</td>
                      <td className="py-2 px-3 text-zinc-400 truncate max-w-[160px]">{u.email}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 text-[9px] font-bold border uppercase ${getRoleBadgeStyle(u.role)}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <span className="text-emerald-400 font-bold text-[10px]">✓ ACTIVO</span>
                      </td>
                    </tr>
                  ))}
                  {dbUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-zinc-600">
                        {loadingUsers ? "Consultando PostgreSQL..." : "No se encontraron usuarios en la tabla"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-2.5 bg-black border border-zinc-800 text-[10px] text-zinc-500 flex items-center justify-between">
              <span>Total registros en PostgreSQL: <strong className="text-white">{dbUsers.length}</strong></span>
              <span className="text-emerald-400 font-bold">✓ SINCRONIZADO EN TIEMPO REAL</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <div className="p-3 bg-red-950/40 border border-red-800 text-xs text-red-300 font-mono">
                {error}
              </div>
            )}

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`p-6 border border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
                dragOver
                  ? "border-white bg-zinc-900"
                  : "border-zinc-800 bg-black/60 hover:border-zinc-600 hover:bg-zinc-950"
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="mb-3">
                <div className="w-24 h-24 border border-zinc-700 bg-zinc-950 flex items-center justify-center overflow-hidden">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 text-white font-mono text-xl font-bold tracking-wider">
                      <span className="text-zinc-500 text-xs">[AVATAR]</span>
                      <span className="text-sm text-zinc-300 mt-1">{getInitials(name)}</span>
                    </div>
                  )}
                </div>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/jpg, image/webp"
                className="hidden"
              />

              <div className="space-y-1 font-mono">
                <div className="text-xs font-semibold text-zinc-200">
                  [SELECCIONAR O ARRASTRAR ARCHIVO DE IMAGEN]
                </div>
                <p className="text-[11px] text-zinc-500">
                  Formatos aceptados: PNG, JPG, WEBP (Máx 5MB)
                </p>
              </div>
            </div>

            {avatarUrl && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemovePhoto();
                  }}
                  className="px-3 py-1 font-mono text-xs text-rose-400 hover:text-rose-200 border border-zinc-800 hover:border-rose-900 bg-rose-950/20 transition-colors cursor-pointer"
                >
                  [REMOVER IMAGEN ACTUAL]
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono">
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold uppercase text-zinc-400">
                  Identificador / Usuario
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={DEFAULT_OPERATOR_NAME}
                  className="w-full bg-black border border-zinc-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-600 transition-all font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold uppercase text-zinc-400">
                  Rol / Asignación en SOC
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder={DEFAULT_OPERATOR_ROLE}
                  className="w-full bg-black border border-zinc-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-600 transition-all font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800 font-mono">
              <Button variant="ghost" size="md" onClick={onClose} disabled={uploading} className="text-xs">
                [CANCELAR]
              </Button>
              <Button variant="primary" size="md" onClick={handleSave} loading={uploading} className="text-xs">
                [GUARDAR CAMBIOS]
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
