import { useAuth } from '../contexts/AuthContext';
import { EUserRole } from '../types/user';

/**
 * Hook để kiểm tra role của user hiện tại
 */
export const useRole = () => {
  const { user } = useAuth();

  const role = user?.role as EUserRole | undefined;

  const isAdmin = role === EUserRole.ADMIN;
  const isUser = role === EUserRole.USER;

  /**
   * Kiểm tra user có một trong các role được chỉ định không
   */
  const hasRole = (...roles: EUserRole[]) => {
    if (!role) return false;
    return roles.includes(role);
  };

  /**
   * Kiểm tra user có phải admin không
   */
  const checkIsAdmin = () => isAdmin;

  return {
    role,
    isAdmin,
    isUser,
    hasRole,
    checkIsAdmin,
  };
};

export default useRole;
