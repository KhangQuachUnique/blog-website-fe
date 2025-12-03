import CreateBlogPostPage from "../../pages/user/manageBlogPosts/createPostPage";
import UpdateBlogPostPage from "../../pages/user/manageBlogPosts/updatePostPage";

const manageBlogPostsRoutes = [
  {
    path: "post/create",
    element: <CreateBlogPostPage />,
  },
  {
    path: "post/edit/:id",
    element: <UpdateBlogPostPage />,
  },
];

export default manageBlogPostsRoutes;
