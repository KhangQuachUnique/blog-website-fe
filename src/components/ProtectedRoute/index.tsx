import RoleGuard from '../guards/RoleGuard';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

/**
 * @deprecated Sử dụng RoleGuard thay thế
 */
export const ProtectedRoute = ({ 
  children, 
  requireAuth = true,
  redirectTo = '/login'
}: ProtectedRouteProps) => {
  // Guest-only mode
  if (!requireAuth) {
    return <RoleGuard guestOnly>{children}</RoleGuard>;
  }

  // Require auth mode
  return <RoleGuard redirectTo={redirectTo}>{children}</RoleGuard>;
};
