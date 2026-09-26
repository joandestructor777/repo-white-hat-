import { useState, useEffect } from "react";
import {
  DEFAULT_OPERATOR_NAME,
  DEFAULT_OPERATOR_ROLE,
  MAX_AVATAR_SIZE_BYTES,
  DEFAULT_PROFILE_STORAGE_KEY,
} from "../../constants/security.constants";

export interface UserProfile {
  name: string;
  role: string;
  avatarUrl: string;
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(DEFAULT_PROFILE_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return {
      name: DEFAULT_OPERATOR_NAME,
      role: DEFAULT_OPERATOR_ROLE,
      avatarUrl: "",
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(DEFAULT_PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.warn("No se pudo guardar el perfil en localStorage", e);
    }
  }, [profile]);

  const updateAvatar = (newAvatarUrl: string) => {
    setProfile((prev) => ({ ...prev, avatarUrl: newAvatarUrl }));
  };

  const removeAvatar = () => {
    setProfile((prev) => ({ ...prev, avatarUrl: "" }));
  };

  const updateProfile = (name: string, role: string, avatarUrl: string) => {
    setProfile({ name, role, avatarUrl });
  };

  const uploadCustomImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith("image/")) {
        reject(new Error("El archivo seleccionado debe ser una imagen válida (.png, .jpg, .webp, .jpeg)."));
        return;
      }
      if (file.size > MAX_AVATAR_SIZE_BYTES) {
        reject(new Error("La imagen no debe superar los 5 MB de tamaño."));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        updateAvatar(base64);
        resolve(base64);
      };
      reader.onerror = () => reject(new Error("Error al procesar el archivo de imagen."));
      reader.readAsDataURL(file);
    });
  };

  return {
    profile,
    updateAvatar,
    removeAvatar,
    updateProfile,
    uploadCustomImage,
  };
}
