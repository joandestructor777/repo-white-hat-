import { useState, useEffect } from "react";

export interface UserProfile {
  name: string;
  role: string;
  avatarUrl: string; // Base64 data URL o vacío si no ha subido foto
}

const STORAGE_KEY = "nexasentry_user_profile_v2";

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return {
      name: "Analista de Ciberseguridad",
      role: "Auditor SOC / Ethical Hacker",
      avatarUrl: "/hacker-icon.jpg",
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
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
      if (file.size > 5 * 1024 * 1024) {
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
