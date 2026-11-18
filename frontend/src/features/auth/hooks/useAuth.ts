import { useState, useEffect, useCallback } from "react";
import { authService, AuthUser } from "../services/authService";

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(() => authService.getStoredUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => authService.isAuthenticated());
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authService.getToken()) {
      authService.getMe()
        .then((fetchedUser) => {
          setUser(fetchedUser);
          setIsAuthenticated(true);
        })
        .catch(() => {
          // Token expirado o inválido
          authService.logout();
          setUser(null);
          setIsAuthenticated(false);
        });
    }
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.login(username, password);
      setUser(res.user);
      setIsAuthenticated(true);
      return res;
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Error al autenticar con el servidor";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (username: string, email: string, password: string, role?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.register(username, email, password, role);
      setUser(res.user);
      setIsAuthenticated(true);
      return res;
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Error al registrar analista";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  }, []);

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    clearError: () => setError(null),
  };
};
