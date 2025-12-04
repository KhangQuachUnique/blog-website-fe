import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import * as authService from '../services/auth';
import { ACCESS_TOKEN_KEY } from '../constants/auth';

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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: try to restore session from refresh token cookie
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Try to refresh token using HttpOnly cookie
        const refreshResponse = await authService.refresh();
        if (refreshResponse.accessToken) {
          localStorage.setItem(ACCESS_TOKEN_KEY, refreshResponse.accessToken);
          // Load user data
          const userData = await authService.getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        // No valid refresh token - user not logged in
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
