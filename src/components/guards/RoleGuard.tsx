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
  /** Cho phép admin truy cập (default: true) */
  allowAdmin?: boolean;
  /** Yêu cầu đăng nhập (default: true khi có allowedRoles, false khi không có) */
  requireAuth?: boolean;
}

/**
 * Component bảo vệ route thống nhất
 *
 * Cách dùng:
 * - Yêu cầu đăng nhập: <RoleGuard requireAuth><Page /></RoleGuard>
 * - Yêu cầu role cụ thể: <RoleGuard allowedRoles={[EUserRole.ADMIN]}><AdminPage /></RoleGuard>
 * - Chỉ guest (chưa đăng nhập): <RoleGuard guestOnly><LoginPage /></RoleGuard>
 * - Chặn admin vào trang user (guest vẫn vào được): <RoleGuard allowAdmin={false}><UserPage /></RoleGuard>
 */
const RoleGuard = ({
  children,
  allowedRoles,
  redirectTo = "/",
  guestOnly = false,
  allowAdmin = true,
  requireAuth,
}: RoleGuardProps) => {
  const { user, isLoading, isAuthenticated } = useAuth();

  // Xác định có yêu cầu đăng nhập không
  // Nếu không truyền requireAuth, mặc định = true khi có allowedRoles
  const shouldRequireAuth = requireAuth ?? (allowedRoles && allowedRoles.length > 0);

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
      // Nếu là admin, redirect về /admin, ngược lại về /
      const redirectPath = user?.role === EUserRole.ADMIN ? "/admin" : "/";
      return <Navigate to={redirectPath} replace />;
    }
    return <>{children}</>;
  }

  // Kiểm tra nếu là Admin và không cho phép Admin truy cập route này
  // (áp dụng cho các trang user bình thường - guest vẫn vào được)
  if (isAuthenticated && !allowAdmin && user?.role === EUserRole.ADMIN) {
    // Redirect admin về trang admin dashboard
    return <Navigate to="/admin" replace />;
  }

  // Yêu cầu đăng nhập (chỉ khi shouldRequireAuth = true)
  if (shouldRequireAuth && (!isAuthenticated || !user)) {
    return <LoginRequiredPage />;
  }

  // Nếu có allowedRoles và đã đăng nhập, kiểm tra role
  if (allowedRoles && allowedRoles.length > 0 && isAuthenticated && user) {
    const userRole = user.role as EUserRole;
    const hasPermission = allowedRoles.includes(userRole);

    if (!hasPermission) {
      return <Navigate to={redirectTo} replace />;
    }
  }

  return <>{children}</>;
};

export default RoleGuard;
