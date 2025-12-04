import { useAuth } from '../contexts/AuthContext';

export const useAuthUser = () => {
  const { user, isLoading, isAuthenticated } = useAuth();
  return { user, isLoading, isAuthenticated };
};

export const useAuthActions = () => {
  const { login, register, logout, refreshUser } = useAuth();
  return { login, register, logout, refreshUser };
};
export { useAuth };

