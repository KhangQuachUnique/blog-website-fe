import { createBrowserRouter } from "react-router-dom";

import AdminLayout from "../components/layout/adminLayout";
import UserLayout from "../components/layout/userLayout";
import adminUserRoutes from "./admin/user.route";
import adminPostRoutes from "./admin/post.route";
import adminReportRoutes from "./admin/report.route";
import authRoutes from "./auth/auth.route";
import communityRoutes from "./community.route";

import manageBlogPostsRoutes from "./user/manageBlogPosts.route";
import newsfeedRoutes from "./newsfeed/newsfeed.route";
import HomePage from "../pages/home/HomePage";

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
        path: "saved",
        element: <div>Saved Posts</div>,
      },
      {
        path: "groups",
        element: <div>Groups Page</div>,
      },

      ...communityRoutes,
      ...manageBlogPostsRoutes,
      ...newsfeedRoutes,
    ],
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [...adminUserRoutes, ...adminPostRoutes, ...adminReportRoutes],
  },
  ...authRoutes,
]);