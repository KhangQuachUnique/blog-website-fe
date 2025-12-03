import { createBrowserRouter } from "react-router-dom";

import AdminLayout from "../components/layout/adminLayout";
import UserLayout from "../components/layout/userLayout";
import adminUserRoutes from "./admin/user.route";
import adminPostRoutes from "./admin/post.route";
import adminReportRoutes from "./admin/report.route";
import authRoutes from "./auth/auth.route";
import { SearchResultPage } from "../pages/search/searchResultsPage";
import { TestHomePage } from "../pages/testHomePage";
import { SimpleTestPage } from "../pages/simpleTestPage";

import manageBlogPostsRoutes from "./user/manageBlogPosts.route";
import newsfeedRoutes from "./newsfeed/newsfeed.route";
export const router = createBrowserRouter([
  {
    path: "/",
    element: <SimpleTestPage />,
  },
  {
    path: "/app",
    element: <UserLayout />,
    children: [
      {
        index: true,
        element: <TestHomePage />,
      },
      ...manageBlogPostsRoutes,
      ...newsfeedRoutes,
    ],
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [...adminUserRoutes, ...adminPostRoutes, ...adminReportRoutes],
  },
  {
    path: "/search",
    element: <SearchResultPage />,
  },
  ...authRoutes,
]);
