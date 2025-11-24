import ManageLayout from "../pages/community/ManageLayout";
import ForumSetting from "../pages/community/ForumSetting";
import PostManagement from "../pages/community/PostManagement";
import MemberManagement from "../pages/community/MemberManagement";

const communityRoutes = [
  {
    path: "community",
    element: <ManageLayout />,
    children: [
      {
        path: "manage",
        children: [
          { index: true, element: <ForumSetting /> },
          { path: "posts", element: <PostManagement /> },
          { path: "members", element: <MemberManagement /> },
        ],
      },
    ],
  },
];

export default communityRoutes;
