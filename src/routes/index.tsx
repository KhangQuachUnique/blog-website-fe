import { createBrowserRouter } from "react-router-dom";

import AdminLayout from "../components/layout/adminLayout";
import adminUserRoutes from "./admin/user.route";
import adminPostRoutes from "./admin/post.route";
import adminReportRoutes from "./admin/report.route";
import authRoutes from "./auth/auth.route";

export const router = createBrowserRouter([
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [...adminUserRoutes, ...adminPostRoutes, ...adminReportRoutes],
  },
  ...authRoutes,
]);
