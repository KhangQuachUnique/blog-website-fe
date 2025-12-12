import CommunityLayout from "../pages/community/CommunityLayout";
import CommunityPosts from "../pages/community/CommunityPosts";
import CommunityAbout from "../pages/community/CommunityAbout";
import CommunityMembers from "../pages/community/CommunityMembers";

import ManageLayout from "../pages/community/ManageLayout";
import ForumSetting from "../pages/community/ForumSetting";
import PostManagement from "../pages/community/PostManagement";
import MemberManagement from "../pages/community/MemberManagement";

const communityRoutes = [
  // 🌍 FACEBOOK-STYLE COMMUNITY PAGE (ALL ROLES)
  {
    path: "community/:id",
    element: <CommunityLayout />,
    children: [
      { index: true, element: <CommunityPosts /> },
      { path: "about", element: <CommunityAbout /> },
      { path: "members", element: <CommunityMembers /> },
    ],
  },

  // 🔒 COMMUNITY MANAGEMENT (ADMIN / MOD ONLY)
  {
    path: "community/:id/manage",
    element: <ManageLayout />,
    children: [
      { index: true, element: <ForumSetting /> },
      { path: "posts", element: <PostManagement /> },
      { path: "members", element: <MemberManagement /> },
    ],
  },
];

export default communityRoutes;
