import { NavLink, Outlet, useParams } from "react-router-dom";
import { useGetCommunitySettings } from "../../hooks/useCommunity";
import "../../styles/community.css";

const ManageLayout = () => {
  const { id } = useParams();
  const communityId = Number(id);

  const { data, isLoading } = useGetCommunitySettings(communityId);

  if (isLoading) return <p>Đang tải...</p>;
  if (!data) return <p>Không tìm thấy cộng đồng</p>;

  const role = data.role;

  // 🔵 MEMBER → không được vào giao diện quản lý
  if (role === "MEMBER") {
    return (
      <div className="community-page">
        <h2>{data.name}</h2>
        <p>{data.description}</p>
        <p>Bạn là <strong>Thành viên</strong>. Bạn không có quyền quản lý cộng đồng.</p>
      </div>
    );
  }

  // 🟡 PENDING → chưa được duyệt
  if (role === "PENDING") {
    return (
      <div className="community-page">
        <h2>{data.name}</h2>
        <p>Yêu cầu tham gia cộng đồng của bạn đang chờ duyệt.</p>
      </div>
    );
  }

  // 🟢 ADMIN + MODERATOR → giao diện quản lý
  return (
    <div className="community-page">
      <header className="community-header">
        <h2 className="community-header-title">Quản lý cộng đồng: {data.name}</h2>
        <p className="community-header-sub">
          Quản lý cài đặt, bài viết và thành viên trong cộng đồng của bạn.
        </p>
      </header>

      <nav className="community-tabs">
        <NavLink to={`/community/${communityId}`} end className="community-tab">Settings</NavLink>
        <NavLink to={`/community/${communityId}/posts`} className="community-tab">Posts</NavLink>
        <NavLink to={`/community/${communityId}/members`} className="community-tab">Members</NavLink>
      </nav>

      <Outlet />
    </div>
  );
};

export default ManageLayout;