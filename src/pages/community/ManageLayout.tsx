import { NavLink, Outlet } from "react-router-dom";
import "../../styles/community.css";

const ManageLayout = () => {
  return (
    <div className="community-page">
      <header className="community-header">
        <h2 className="community-header-title">Community Management</h2>
        <p className="community-header-sub">
          Quản lý cài đặt, bài viết và thành viên trong cộng đồng của bạn.
        </p>
      </header>

      <nav className="community-tabs">
        <NavLink
          to="/community/manage"
          end
          className={({ isActive }: { isActive: boolean }) =>
            "community-tab " + (isActive ? "community-tab-active" : "")
          }
        >
          Settings
        </NavLink>

        <NavLink
          to="/community/manage/posts"
          className={({ isActive }: { isActive: boolean }) =>
            "community-tab " + (isActive ? "community-tab-active" : "")
          }
        >
          Posts
        </NavLink>

        <NavLink
          to="/community/manage/members"
          className={({ isActive }: { isActive: boolean }) =>
            "community-tab " + (isActive ? "community-tab-active" : "")
          }
        >
          Members
        </NavLink>
      </nav>

      <Outlet />
    </div>
  );
};

export default ManageLayout;
