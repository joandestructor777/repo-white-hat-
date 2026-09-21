import React, { useState, useRef } from "react";
import { Upload, Camera, Trash2, User, Shield, Check, Image as ImageIcon } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { UserProfile } from "../../shared/hooks/useUserProfile";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (name: string, role: string, avatarUrl: string) => void;
  onUploadImage: (file: File) => Promise<string>;
  onRemoveAvatar?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  onUploadImage,
  onRemoveAvatar,
}) => {
  const [name, setName] = useState(profile.name);
  const [role, setRole] = useState(profile.role);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcessFile = async (file: File) => {
    try {
      setUploading(true);
      setError(null);
      const base64 = await onUploadImage(file);
      setAvatarUrl(base64);
    } catch (err: any) {
      setError(err.message || "Error al cargar la imagen.");
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
    onSaveProfile(name.trim() || "Analista de Ciberseguridad", role.trim() || "Auditor SOC", avatarUrl);
    onClose();
  };

  const getInitials = (n: string) => {
    return n
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "AS";
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Personalizar Foto de Perfil & Usuario"
      maxWidth="md"
    >
      <div className="space-y-6 p-2">
        {error && (
          <div className="p-3.5 bg-red-950/40 border border-red-800/80 rounded-xl text-xs text-red-300 font-mono">
            {error}
          </div>
        )}

        {/* Upload & Preview Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`relative p-8 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
            dragOver
              ? "border-white bg-zinc-900/60"
              : "border-zinc-800 bg-[#09090b] hover:border-zinc-600 hover:bg-zinc-900/30"
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          {/* Avatar Preview */}
          <div className="relative mb-4 group">
            <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-white/80 shadow-2xl bg-zinc-900 flex items-center justify-center">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={name}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 text-white font-mono text-xl font-bold tracking-wider">
                  <User className="w-8 h-8 mb-1 text-zinc-500" />
                  <span className="text-sm text-zinc-400">{getInitials(name)}</span>
                </div>
              )}
            </div>

            <div className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[11px] font-mono">
              <Camera className="w-5 h-5 mb-1" />
              <span>Cambiar</span>
            </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/jpg, image/webp"
            className="hidden"
          />

          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2 text-sm font-semibold text-white">
              <Upload className="w-4 h-4 text-white" />
              <span>Haz clic o arrastra tu foto aquí</span>
            </div>
            <p className="text-xs text-zinc-400 font-mono">
              Sube tu foto real desde tu computadora (PNG, JPG, WEBP • Máx 5MB)
            </p>
          </div>
        </div>

        {/* Action Buttons for Avatar */}
        {avatarUrl && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemovePhoto();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-red-900/60 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Quitar mi foto actual</span>
            </button>
          </div>
        )}

        {/* Name and Role inputs with generous padding */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">
              Nombre de Usuario
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: David García"
              className="w-full bg-[#121215] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-white transition-all font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">
              Rol / Cargo en el SOC
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Ej: Analista de Seguridad Senior"
              className="w-full bg-[#121215] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-white transition-all font-mono"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800/80">
          <Button variant="ghost" size="md" onClick={onClose} disabled={uploading}>
            Cancelar
          </Button>
          <Button variant="primary" size="md" onClick={handleSave} loading={uploading}>
            Guardar Cambios
          </Button>
        </div>
      </div>
    </Modal>
  );
};
