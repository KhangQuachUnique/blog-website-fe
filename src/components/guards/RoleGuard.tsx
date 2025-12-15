import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { EUserRole } from '../../types/user';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: EUserRole[];
  redirectTo?: string;
}

/**
 * Component bảo vệ route dựa trên role của user
 * Sử dụng: <RoleGuard allowedRoles={[EUserRole.ADMIN]}><AdminPage /></RoleGuard>
 */
const RoleGuard = ({ 
  children, 
  allowedRoles, 
  redirectTo = '/' 
}: RoleGuardProps) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Đang loading, hiển thị spinner hoặc skeleton
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  // Chưa đăng nhập -> redirect về login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Kiểm tra role
  const userRole = user.role as EUserRole;
  const hasPermission = allowedRoles.includes(userRole);

  if (!hasPermission) {
    // Không có quyền -> redirect về trang chỉ định hoặc trang chủ
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default RoleGuard;
