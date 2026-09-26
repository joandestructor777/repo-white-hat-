import React, { useState, useRef } from "react";
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
      name.trim() || "Joan",
      role.trim() || "SecOps Analyst",
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="CONFIGURACIÓN DE IDENTIDAD // OPERADOR"
      maxWidth="md"
    >
      <div className="space-y-5 font-sans">
        {error && (
          <div className="p-3 bg-red-950/40 border border-red-800 text-xs text-red-300 font-mono">
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
          className={`p-6 border border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
            dragOver
              ? "border-white bg-zinc-900"
              : "border-zinc-800 bg-black/60 hover:border-zinc-600 hover:bg-zinc-950"
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          {/* Avatar Preview */}
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

        {/* Action Buttons for Avatar */}
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

        {/* Name and Role inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono">
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold uppercase text-zinc-400">
              Identificador / Usuario
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Joan"
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
              placeholder="White Hat / SOC Lead"
              className="w-full bg-black border border-zinc-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-600 transition-all font-mono"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800 font-mono">
          <Button variant="ghost" size="md" onClick={onClose} disabled={uploading} className="text-xs">
            [CANCELAR]
          </Button>
          <Button variant="primary" size="md" onClick={handleSave} loading={uploading} className="text-xs">
            [GUARDAR CAMBIOS]
          </Button>
        </div>
      </div>
    </Modal>
  );
};
