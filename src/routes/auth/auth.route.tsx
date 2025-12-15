import LoginPage from "../../pages/auth/loginPage";
import RegisterPage from "../../pages/auth/registerPage";
import VerifyEmailPage from "../../pages/auth/verifyEmailPage";
import ForgotPasswordPage from "../../pages/auth/forgotPasswordPage";

const authRoutes = [
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/verify-email",
    element: <VerifyEmailPage />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordPage />,
  },
];

export default authRoutes;
