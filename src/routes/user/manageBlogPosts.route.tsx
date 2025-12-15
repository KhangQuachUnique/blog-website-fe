import { RoleGuard } from "../../components/guards";
import CreateBlogPostPage from "../../pages/user/manageBlogPosts/createPostPage";
import UpdateBlogPostPage from "../../pages/user/manageBlogPosts/updatePostPage";

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
];

export default manageBlogPostsRoutes;
