import LoginPage from "../../pages/auth/loginPage";
import RegisterPage from "../../pages/auth/registerPage";
import VerifyEmailPage from "../../pages/auth/verifyEmailPage";

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
];

export default authRoutes;
