import UserCreatePage from "../../pages/admin/userManage/userCreatePage";
import UserDetailPage from "../../pages/admin/userManage/userDetailPage";
import UserListPage from "../../pages/admin/userManage/userListPage";

const adminUserRoutes = [
  {
    path: "/admin/users/list",
    element: <UserListPage />,
  },
  {
    path: "/admin/users/create",
    element: <UserCreatePage />,
  },
  {
    path: "/admin/users/detail/:id",
    element: <UserDetailPage />,
  },
];

export default adminUserRoutes;
