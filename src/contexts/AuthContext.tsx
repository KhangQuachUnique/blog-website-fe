import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import * as authService from "../services/auth";
import { ACCESS_TOKEN_KEY } from "../constants/auth";

interface User {
  id: number;
  username: string;
  email: string;
  role?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: try to restore session from localStorage token first
  useEffect(() => {
    const initAuth = async () => {
      console.log("[AuthContext] Initializing auth...");

      // First check if we have a token in localStorage
      const existingToken = localStorage.getItem(ACCESS_TOKEN_KEY);

      if (existingToken) {
        console.log("[AuthContext] Found existing token, loading user...");
        try {
          // Try to get current user with existing token
          const userData = await authService.getCurrentUser();
          console.log("[AuthContext] User loaded:", userData);
          setUser(userData);
          setIsLoading(false);
          return;
        } catch (error) {
          console.log(
            "[AuthContext] Token expired or invalid, trying refresh..."
          );
          // Token expired, try refresh below
        }
      }

      // If no token or token expired, try refresh
      try {
        console.log("[AuthContext] Calling /auth/refresh...");
        const refreshResponse = await authService.refresh();
        console.log("[AuthContext] Refresh response:", refreshResponse);

        if (refreshResponse.accessToken) {
          localStorage.setItem(ACCESS_TOKEN_KEY, refreshResponse.accessToken);
          console.log("[AuthContext] Token saved, loading user data...");
          const userData = await authService.getCurrentUser();
          console.log("[AuthContext] User data loaded:", userData);
          setUser(userData);
        }
      } catch (error) {
        // No valid refresh token - user not logged in
        console.log("[AuthContext] Refresh failed:", error);
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      // Token invalid or expired
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      setUser(null);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    if (response.accessToken) {
      localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
    }
    if (response.user) {
      setUser(response.user);
    } else {
      // If user not returned, fetch it
      await loadUser();
    }
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await authService.register({ name, email, password });
    if (response.accessToken) {
      localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
    }
    if (response.user) {
      setUser(response.user);
    } else {
      await loadUser();
    }
  };

  const logout = async () => {
    await authService.logout();
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    setUser(null);
  };

  const refreshUser = async () => {
    await loadUser();
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
