import ProfilePage from "../../pages/user/profile/profilePage";
import ProfileEditPage from "../../pages/user/profile/profileEditPage";

const profileRoutes = [
  {
    path: "profile/:userId",
    element: <ProfilePage />,
  },
  {
    path: "profile/edit",
    element: <ProfileEditPage />,
  },
];

export default profileRoutes;
