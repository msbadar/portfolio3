"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import type { AuthUser, LoginCredentials, RegisterCredentials, AuthResponse } from "@/lib/auth-types";
import { apiClient, setAuthToken, getAuthToken } from "@/lib/api-client";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (credentials: RegisterCredentials) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch current user on mount
  const refreshUser = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      
      const data = await apiClient.get<AuthResponse>("/auth/me");
      if (data.success && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
        setAuthToken(null);
      }
    } catch {
      setUser(null);
      setAuthToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const data = await apiClient.post<AuthResponse>("/auth/login", credentials);

      if (data.success && data.user && data.token) {
        setAuthToken(data.token);
        setUser(data.user);
      }

      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : "An error occurred during login";
      return { success: false, error: message };
    }
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    try {
      const data = await apiClient.post<AuthResponse>("/auth/register", credentials);

      if (data.success && data.user && data.token) {
        setAuthToken(data.token);
        setUser(data.user);
      }

      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : "An error occurred during registration";
      return { success: false, error: message };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setAuthToken(null);
      setUser(null);
    }
  }, []);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
