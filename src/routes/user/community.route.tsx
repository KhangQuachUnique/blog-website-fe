import CommunityLayout from "../../features/user/manageCommunity/CommunityLayout";
import CommunityPosts from "../../features/user/manageCommunity/CommunityPosts";
import CommunityMembers from "../../features/user/manageCommunity/CommunityMembers";

import ManageLayout from "../../features/user/manageCommunity/ManageLayout";
import ForumSetting from "../../features/user/manageCommunity/ForumSetting";
import PostManagement from "../../features/user/manageCommunity/PostManagement";
import MemberManagement from "../../features/user/manageCommunity/MemberManagement";
import CreateCommunityPostPage from "../../pages/user/community/CreateCommunityPostPage";
import { RoleGuard } from "../../components/guards";
import MyCommunitiesPage from "../../pages/user/community/MyCommunitiesPage";

const communityRoutes = [
  {
    path: "me/my-communities",
    element: (
      <RoleGuard>
        <MyCommunitiesPage />
      </RoleGuard>
    ),
  },
  // 🌍 FACEBOOK-STYLE COMMUNITY PAGE (ALL ROLES)
  {
    path: "community/:id",
    element: <CommunityLayout />,
    children: [
      { index: true, element: <CommunityPosts /> },
      { path: "members", element: <CommunityMembers /> },
    ],
  },

  // 🔒 COMMUNITY MANAGEMENT (ADMIN / MOD ONLY)
  {
    path: "community/:id/manage",
    element: (
      <RoleGuard>
        <ManageLayout />
      </RoleGuard>
    ),
    children: [
      { index: true, element: <ForumSetting /> },
      { path: "posts", element: <PostManagement /> },
      { path: "members", element: <MemberManagement /> },
    ],
  },
  {
    path: "community/:id/create-post",
    element: (
      <RoleGuard>
        <CreateCommunityPostPage />
      </RoleGuard>
    ),
  },
];

export default communityRoutes;
