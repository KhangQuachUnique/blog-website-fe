import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { EUserRole } from "../../types/user";

import LoginRequiredPage from "../../pages/errors/LoginRequiredPage";

interface RoleGuardProps {
  children: React.ReactNode;
  /** Các role được phép truy cập. Nếu không truyền = chỉ yêu cầu đăng nhập */
  allowedRoles?: EUserRole[];
  /** Redirect đến đâu khi không có quyền (default: /) */
  redirectTo?: string;
  /** Chế độ guest-only: redirect về home nếu đã đăng nhập */
  guestOnly?: boolean;
}

/**
 * Component bảo vệ route thống nhất
 *
 * Cách dùng:
 * - Yêu cầu đăng nhập: <RoleGuard><Page /></RoleGuard>
 * - Yêu cầu role cụ thể: <RoleGuard allowedRoles={[EUserRole.ADMIN]}><AdminPage /></RoleGuard>
 * - Chỉ guest (chưa đăng nhập): <RoleGuard guestOnly><LoginPage /></RoleGuard>
 */
const RoleGuard = ({
  children,
  allowedRoles,
  redirectTo = "/",
  guestOnly = false,
}: RoleGuardProps) => {
  const { user, isLoading, isAuthenticated } = useAuth();

  // Đang loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  // Guest-only mode (login, register pages)
  if (guestOnly) {
    if (isAuthenticated) {
      return <Navigate to="/" replace />;
    }
    return <>{children}</>;
  }

  // Yêu cầu đăng nhập
  if (!isAuthenticated || !user) {
    return <LoginRequiredPage />;
  }

  // Nếu có allowedRoles, kiểm tra role
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user.role as EUserRole;
    const hasPermission = allowedRoles.includes(userRole);

    if (!hasPermission) {
      return <Navigate to={redirectTo} replace />;
    }
  }

  return <>{children}</>;
};

export default RoleGuard;
