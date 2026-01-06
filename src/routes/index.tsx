import { createBrowserRouter } from "react-router-dom";

import AdminLayout from "../components/layout/adminLayout";
import UserLayout from "../components/layout/userLayout";
import { RoleGuard } from "../components/guards";
import { EUserRole } from "../types/user";
import adminDashboardRoutes from "./admin/dashboard.route";
import adminUserRoutes from "./admin/user.route";
import adminPostRoutes from "./admin/post.route";
import adminReportRoutes from "./admin/report.route";
import authRoutes from "./auth/auth.route";
import communityRoutes from "./user/community.route";

import manageBlogPostsRoutes from "./user/manageBlogPosts.route";
import profileRoutes from "./user/profile.route";

import newsfeedRoutes from "./user/newsfeed.route";
import { SearchResultPage } from "../pages/search/searchResultsPage";
import PostDetailsPage from "../pages/user/post/postDetailsPage";
import { savedPostsRoutes } from "./user/savedPosts.route";
import NotFoundPage from "../pages/errors/NotFoundPage";

/**
 * Component wrapper để chặn Admin vào các trang user
 * Admin sẽ được redirect về /admin
 */
const UserOnlyLayout = () => {
  return (
    <RoleGuard allowAdmin={false}>
      <UserLayout />
    </RoleGuard>
  );
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <UserOnlyLayout />,
    children: [
      ...newsfeedRoutes,
      {
        path: "search",
        element: <SearchResultPage />,
      },
      {
        path: "/post/:id",
        element: <PostDetailsPage />,
      },

      ...communityRoutes,
      ...manageBlogPostsRoutes,
      ...savedPostsRoutes,
      ...profileRoutes,
    ],
  },
  {
    path: "/admin",
    element: (
      <RoleGuard allowedRoles={[EUserRole.ADMIN]} redirectTo="/">
        <AdminLayout />
      </RoleGuard>
    ),
    children: [
      ...adminDashboardRoutes,
      ...adminUserRoutes,
      ...adminPostRoutes,
      ...adminReportRoutes,
    ],
  },
  ...authRoutes,
  // 404 Not Found - Catch all unmatched routes
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
