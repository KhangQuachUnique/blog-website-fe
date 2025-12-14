import { useState } from "react";
import { NavLink, Outlet, useParams, useNavigate, useLocation } from "react-router-dom";
import { useGetCommunitySettings } from "../../hooks/useCommunity";
import { useLeaveCommunity } from "../../hooks/useManageCommunityMembers";
import "../../styles/community.css";

const CommunityLayout = () => {
  const { id } = useParams();
  const communityId = Number(id);
  const navigate = useNavigate();
  const location = useLocation();

  const { data, isLoading } = useGetCommunitySettings(communityId);

  const [openLeave, setOpenLeave] = useState(false);
  const leaveMutation = useLeaveCommunity(communityId);

  if (isLoading) return <p>Đang tải...</p>;
  if (!data) return <p>Không tìm thấy cộng đồng</p>;

  const role = data.role;
  const isAdminOrMod = role === "ADMIN" || role === "MODERATOR";

  const coverSrc =
    data.thumbnailUrl ??
    "https://via.placeholder.com/1200x300?text=Community+Cover";

  const basePath = `/community/${communityId}`;
  const isPostsTab = location.pathname === basePath;

  const canLeave = role !== "PENDING";

  const handleConfirmLeave = async () => {
    try {
      await leaveMutation.mutateAsync();
      setOpenLeave(false);
      navigate("/"); // ✅ nếu bạn có trang list cộng đồng thì đổi sang route đó
    } catch (e) {
      console.error(e);
      alert("Rời cộng đồng thất bại!");
    }
  };

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

        <div
          style={{
            marginTop: 8,
            fontSize: 14,
            color: "#666",
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
          }}
        >
          <span>
            Vai trò: <b>{role}</b>
          </span>
          <span>•</span>
          <span>{data.isPublic ? "Công khai" : "Riêng tư"}</span>
          <span>•</span>
          <span>{data.memberCount} thành viên</span>
        </div>

        {/* ✅ Action buttons */}
        <div className="community-actions">
          {isAdminOrMod && (
            <button
              onClick={() => navigate(`/community/${communityId}/manage`)}
              className="btn-manage"
            >
              Quản lý cộng đồng
            </button>
          )}

          {canLeave && (
            <button
              className="btn-leave-community"
              onClick={() => setOpenLeave(true)}
              disabled={leaveMutation.isPending}
              title="Rời khỏi cộng đồng này"
            >
              {leaveMutation.isPending ? "Đang xử lý..." : "Rời cộng đồng"}
            </button>
          )}
        </div>
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

      {/* ✅ CREATE POST BOX: chỉ hiện ở tab Bài viết */}
      {isPostsTab && data.role !== "PENDING" && (
        <div className="community-card" style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 12 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                background: "#ffd1e2",
                flexShrink: 0,
              }}
            />

            <button
              onClick={() => console.log("Open create post modal")}
              style={{
                flex: 1,
                textAlign: "left",
                padding: "10px 16px",
                borderRadius: 999,
                border: "1px solid #ffe4f1",
                background: "#fff",
                color: "#777",
                cursor: "pointer",
              }}
            >
              Bạn đang nghĩ gì?
            </button>
          </div>

          {data.requirePostApproval && (
            <div
              style={{
                marginTop: 10,
                fontSize: 13,
                color: "#d81b60",
              }}
            />
          )}
        </div>
      )}

      <Outlet />

      {/* ✅ Modal: Leave */}
      {openLeave && (
        <div className="community-modal-overlay" onClick={() => setOpenLeave(false)}>
          <div className="community-modal community-modal-small" onClick={(e) => e.stopPropagation()}>
            <button className="community-modal-close" onClick={() => setOpenLeave(false)}>
              ×
            </button>

            <h4 style={{ marginBottom: 8 }}>Rời cộng đồng?</h4>
            <p style={{ fontSize: 14, color: "#666", marginBottom: 20 }}>
              Bạn chắc chắn muốn rời khỏi cộng đồng <b>{data.name}</b> chứ?
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button className="btn-secondary" onClick={() => setOpenLeave(false)}>
                Hủy
              </button>

              <button
                className="btn-danger-community"
                onClick={handleConfirmLeave}
                disabled={leaveMutation.isPending}
              >
                {leaveMutation.isPending ? "Đang rời..." : "Rời"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityLayout;
