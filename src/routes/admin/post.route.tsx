import PostListPage from "../../pages/admin/postManage/PostListPage";
import PostDetailPage from "../../pages/admin/postManage/postDetailPage";

const adminPostRoutes = [
  {
    path: "/admin/posts/list",
    element: <PostListPage />,
  },
  {
    path: "/admin/posts/detail",
    element: <PostDetailPage />,
  },
];

export default adminPostRoutes;
