import CreateBlogPostPage from "../../pages/user/manageBlogPosts/createPostPage";
import UpdateBlogPostPage from "../../pages/user/manageBlogPosts/updatePostPage";
import PostDetailPage from "../../pages/user/post/postDetailsPage";

const manageBlogPostsRoutes = [
  {
    path: "post/create",
    element: <CreateBlogPostPage />,
  },
  {
    path: "post/edit/:id",
    element: <UpdateBlogPostPage />,
  },
  {
    path: "post/:id",
    element: <PostDetailPage />,
  },
];

export default manageBlogPostsRoutes;
