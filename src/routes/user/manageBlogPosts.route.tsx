import { RoleGuard } from "../../components/guards";
import CreateBlogPostPage from "../../pages/user/manageBlogPosts/createPostPage";
import UpdateBlogPostPage from "../../pages/user/manageBlogPosts/updatePostPage";
import PostDetailPage from "../../pages/user/post/postDetailsPage";

const manageBlogPostsRoutes = [
  {
    path: "/post/create",
    element: (
      <RoleGuard>
        <CreateBlogPostPage />
      </RoleGuard>
    ),
  },
  {
    path: "/post/edit/:id",
    element: (
      <RoleGuard>
        <UpdateBlogPostPage />
      </RoleGuard>
    ),
  },
  {
    path: "post/:id",
    element: <PostDetailPage />,
  },
];

export default manageBlogPostsRoutes;
