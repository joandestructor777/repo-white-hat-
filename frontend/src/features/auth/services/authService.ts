import { apiClient } from "../../../shared/api/axiosClient";

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

const TOKEN_KEY = "jv_auth_token";
const USER_KEY = "jv_auth_user";

export const authService = {
  async login(username: string, password: string): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>("/auth/login", { username, password });
    if (res.data.access_token) {
      localStorage.setItem(TOKEN_KEY, res.data.access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async register(username: string, email: string, password: string, role: string = "SOC Analyst"): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>("/auth/register", {
      username,
      email,
      password,
      role
    });
    if (res.data.access_token) {
      localStorage.setItem(TOKEN_KEY, res.data.access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async getMe(): Promise<AuthUser> {
    const res = await apiClient.get<AuthUser>("/auth/me");
    localStorage.setItem(USER_KEY, JSON.stringify(res.data));
    return res.data;
  },

  async getDemoAccount(): Promise<{ username: string; password: string; role: string; description: string }> {
    const res = await apiClient.get("/auth/demo-account");
    return res.data;
  },

  async getDemoAccounts(): Promise<Array<{ role: string; username: string; password: string; badge: string; description: string }>> {
    const res = await apiClient.get("/auth/demo-accounts");
    return res.data;
  },

  async getAllUsers(): Promise<AuthUser[]> {
    const res = await apiClient.get<AuthUser[]>("/auth/users");
    return res.data;
  },

  async getRolesMatrix(): Promise<any[]> {
    const res = await apiClient.get("/auth/roles");
    return res.data;
  },

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  getStoredUser(): AuthUser | null {
    try {
      const data = localStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  }
};
