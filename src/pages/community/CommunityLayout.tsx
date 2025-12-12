import { NavLink, Outlet, useParams, useNavigate } from "react-router-dom";
import { useGetCommunitySettings } from "../../hooks/useCommunity";
import "../../styles/community.css";

const CommunityLayout = () => {
  const { id } = useParams();
  const communityId = Number(id);
  const navigate = useNavigate();

  const { data, isLoading } = useGetCommunitySettings(communityId);

  if (isLoading) return <p>Đang tải...</p>;
  if (!data) return <p>Không tìm thấy cộng đồng</p>;

  const role = data.role;
  const isAdmin = role === "ADMIN" || role === "MODERATOR";

  const coverSrc =
    data.thumbnailUrl ??
    "https://via.placeholder.com/1200x300?text=Community+Cover";

  return (
    <div className="community-page">
      {/* COVER */}
      <div className="community-header-img">
        <img src={coverSrc} alt="cover" />
      </div>

      {/* INFO */}
      <div style={{ padding: "20px 0" }}>
        <h1 style={{ fontSize: 30, fontWeight: 700 }}>{data.name}</h1>
        <p style={{ maxWidth: 700 }}>{data.description}</p>

        <div style={{ marginTop: 8, fontSize: 14, color: "#666" }}>
          Vai trò của bạn: <b>{role}</b>
        </div>

        {/* ADMIN / MOD → nút quản lý */}
        {isAdmin && (
          <button
            onClick={() => navigate(`/community/${communityId}/manage`)}
            className="btn-manage"
            style={{ marginTop: 12 }}
          >
            Quản lý cộng đồng
          </button>
        )}
      </div>

      {/* TABS */}
      <nav className="community-tabs">
        <NavLink
          to={`/community/${communityId}`}
          end
          className={({ isActive }) =>
            "community-tab " + (isActive ? "community-tab-active" : "")
          }
        >
          Bài viết
        </NavLink>

        <NavLink
          to={`/community/${communityId}/about`}
          className={({ isActive }) =>
            "community-tab " + (isActive ? "community-tab-active" : "")
          }
        >
          Giới thiệu
        </NavLink>

        <NavLink
          to={`/community/${communityId}/members`}
          className={({ isActive }) =>
            "community-tab " + (isActive ? "community-tab-active" : "")
          }
        >
          Thành viên
        </NavLink>
      </nav>

      {/* NỘI DUNG TAB */}
      <Outlet />
    </div>
  );
};

export default CommunityLayout;
