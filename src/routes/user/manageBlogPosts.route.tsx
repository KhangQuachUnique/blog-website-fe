import { ProtectedRoute } from "../../components/ProtectedRoute";
import CreateBlogPostPage from "../../pages/user/manageBlogPosts/createPostPage";
import UpdateBlogPostPage from "../../pages/user/manageBlogPosts/updatePostPage";

const manageBlogPostsRoutes = [
  {
    path: "/post/create",
    element: (
      <ProtectedRoute>
        <CreateBlogPostPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/post/edit/:id",
    element: (
      <ProtectedRoute>
        <UpdateBlogPostPage />
      </ProtectedRoute>
    ),
  },
];

export default manageBlogPostsRoutes;
