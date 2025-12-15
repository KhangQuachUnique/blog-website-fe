import RoleGuard from './RoleGuard';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * @deprecated Sử dụng RoleGuard thay thế
 * Component bảo vệ route yêu cầu đăng nhập (không quan tâm role)
 * Sử dụng: <AuthGuard><ProtectedPage /></AuthGuard>
 */
const AuthGuard = ({ children }: AuthGuardProps) => {
  return <RoleGuard>{children}</RoleGuard>;
};

export default AuthGuard;
