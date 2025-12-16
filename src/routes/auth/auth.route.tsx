import LoginPage from "../../pages/auth/loginPage";
import RegisterPage from "../../pages/auth/registerPage";
import VerifyEmailPage from "../../pages/auth/verifyEmailPage";
import ForgotPasswordPage from "../../pages/auth/forgotPasswordPage";
import RoleGuard from "../../components/guards/RoleGuard";

const authRoutes = [
  {
    path: "/login",
    element: (
      <RoleGuard guestOnly>
        <LoginPage />
      </RoleGuard>
    ),
  },
  {
    path: "/register",
    element: (
      <RoleGuard guestOnly>
        <RegisterPage />
      </RoleGuard>
    ),
  },
  {
    path: "/verify-email",
    element: <VerifyEmailPage />,
  },
  {
    path: "/forgot-password",
    element: (
      <RoleGuard guestOnly>
        <ForgotPasswordPage />
      </RoleGuard>
    ),
  },
];

export default authRoutes;
