import { NavLink, Outlet } from "react-router-dom";

const ManageLayout = () => {
  return (
    <div style={{ padding: 24 }}>
      <h2>Community Management</h2>

      <nav style={{ margin: "16px 0" }}>
        <NavLink to="/community/manage" end style={{ marginRight: 12 }}>
          Settings
        </NavLink>
        <NavLink to="/community/manage/posts" style={{ marginRight: 12 }}>
          Posts
        </NavLink>
        <NavLink to="/community/manage/members">
          Members
        </NavLink>
      </nav>

      <Outlet />
    </div>
  );
};

export default ManageLayout;
