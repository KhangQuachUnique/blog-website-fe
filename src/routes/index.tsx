import { createBrowserRouter } from "react-router-dom";

import AdminLayout from "../components/layout/adminLayout";
import UserLayout from "../components/layout/userLayout";
import { RoleGuard } from "../components/guards";
import { EUserRole } from "../types/user";
import adminUserRoutes from "./admin/user.route";
import adminPostRoutes from "./admin/post.route";
import adminReportRoutes from "./admin/report.route";
import authRoutes from "./auth/auth.route";
import manageBlogPostsRoutes from "./user/manageBlogPosts.route";
import HomePage from "../pages/home/HomePage";
import newsfeedRoutes from "./user/newsfeed.route";
import PostDetailsPage from "../pages/user/post/postDetailsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <UserLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "/post/:id",
        element: <PostDetailsPage />,
      },
      ...manageBlogPostsRoutes,
      ...newsfeedRoutes,
    ],
  },
  {
    path: "/admin",
    element: (
      <RoleGuard allowedRoles={[EUserRole.ADMIN]} redirectTo="/">
        <AdminLayout />
      </RoleGuard>
    ),
    children: [...adminUserRoutes, ...adminPostRoutes, ...adminReportRoutes],
  },
  ...authRoutes,
]);
