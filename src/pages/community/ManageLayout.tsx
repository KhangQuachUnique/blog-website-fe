import {
  NavLink,
  Outlet,
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";
import { useGetCommunitySettings } from "../../hooks/useCommunity";
import "../../styles/community.css";

const ManageLayout = () => {
  const { id } = useParams();
  const communityId = Number(id);
  const navigate = useNavigate();
  const location = useLocation();

  const { data, isLoading } = useGetCommunitySettings(communityId);

  if (isLoading) return <p>Đang tải...</p>;
  if (!data) return <p>Không tìm thấy cộng đồng</p>;

  const role = data.role;
  const coverSrc =
    data.thumbnailUrl ??
    "https://via.placeholder.com/1200x300?text=Community+Cover";

  // ✅ quay lại trang cộng đồng (match theo tab manage đang đứng)
  const goBackToCommunity = () => {
    const path = location.pathname.includes("/manage/members")
      ? `/community/${communityId}/members`
      : location.pathname.includes("/manage/posts")
      ? `/community/${communityId}` // posts (index)
      : `/community/${communityId}`; // settings -> index

    navigate(path);
  };

  const BackButton = () => (
    <button onClick={goBackToCommunity} className="btn-back-community">
      Quay lại trang chung
    </button>
  );

  // 🔵 MEMBER → chỉ xem, không có quyền quản lý
  if (role === "MEMBER") {
    return (
      <div className="community-page">
        <div className="community-header-img">
          <img src={coverSrc} alt="cover" />
        </div>

        <h2>{data.name}</h2>
        <p>{data.description}</p>

        <div style={{ marginTop: 12 }}>
          <BackButton />
        </div>

        <p style={{ marginTop: 16 }}>
          Bạn là <strong>Thành viên</strong>. Bạn không có quyền quản lý cộng
          đồng.
        </p>
      </div>
    );
  }

  // 🟡 PENDING → chờ duyệt
  if (role === "PENDING") {
    return (
      <div className="community-page">
        <div className="community-header-img">
          <img src={coverSrc} alt="cover" />
        </div>

        <h2>{data.name}</h2>
        <p>Yêu cầu tham gia cộng đồng của bạn đang chờ duyệt.</p>

        <div style={{ marginTop: 12 }}>
          <BackButton />
        </div>
      </div>
    );
  }

  // 🟢 ADMIN + MODERATOR → giao diện quản lý (full access)
  return (
    <div className="community-page">
      {/* HEADER */}
      <div className="community-header-img">
        <img src={coverSrc} alt="cover" />
      </div>

      <div style={{ marginTop: 20 }}>
        <h2 className="community-header-title">{data.name}</h2>
        <p className="community-header-sub">{data.description}</p>

        <p style={{ marginTop: 8 }}>
          Vai trò của bạn: <strong>{role}</strong>
        </p>

        {/* ✅ ROW: Tabs (left) + Back (right) */}
        <div
          style={{
            marginTop: 12,
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <nav className="community-tabs" style={{ margin: 0 }}>
            <NavLink
              to={`/community/${communityId}/manage`}
              end
              className={({ isActive }) =>
                "community-tab " + (isActive ? "community-tab-active" : "")
              }
            >
              Cài đặt
            </NavLink>

            <NavLink
              to={`/community/${communityId}/manage/posts`}
              className={({ isActive }) =>
                "community-tab " + (isActive ? "community-tab-active" : "")
              }
            >
              Bài viết
            </NavLink>

            <NavLink
              to={`/community/${communityId}/manage/members`}
              className={({ isActive }) =>
                "community-tab " + (isActive ? "community-tab-active" : "")
              }
            >
              Thành viên
            </NavLink>
          </nav>

          {/* spacer đẩy nút qua phải */}
          <div style={{ flex: 1 }} />

          <BackButton />
        </div>
      </div>

      <Outlet />
    </div>
  );
};

export default ManageLayout;
