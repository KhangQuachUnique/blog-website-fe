import { useState } from "react";
import {
  NavLink,
  Outlet,
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";
import { useGetCommunitySettings } from "../../hooks/useCommunity";
import { useDeleteCommunity } from "../../hooks/useManageCommunityMembers";
import { useToast } from "../../contexts/toast";
import "../../styles/community.css";

const ManageLayout = () => {
  const { id } = useParams();
  const communityId = Number(id);
  const navigate = useNavigate();
  const location = useLocation();

  const { data, isLoading } = useGetCommunitySettings(communityId);

  const { showToast } = useToast();

  const [openDelete, setOpenDelete] = useState(false);
  const deleteMutation = useDeleteCommunity(communityId);

  if (isLoading) return <p>Đang tải...</p>;
  if (!data) return <p>Không tìm thấy cộng đồng</p>;

  const role = data.role;

  const coverSrc =
    data.thumbnailUrl ??
    "https://via.placeholder.com/1200x300?text=Community+Cover";

  const goBackToCommunity = () => {
    const path = location.pathname.includes("/manage/members")
      ? `/community/${communityId}/members`
      : location.pathname.includes("/manage/posts")
      ? `/community/${communityId}`
      : `/community/${communityId}`;

    navigate(path);
  };

  const BackButton = () => (
    <button onClick={goBackToCommunity} className="btn-back-community">
      Quay lại trang chung
    </button>
  );

  const handleConfirmDelete = async () => {
    try {
      await deleteMutation.mutateAsync();

      showToast({
        type: "success",
        message: "Đã xóa cộng đồng thành công.",
        duration: 2500,
      });

      setOpenDelete(false);
      navigate("/groups"); // ✅ đổi route nếu bạn có trang danh sách community riêng
    } catch (e: any) {
      console.error(e);

      const msg =
        e?.response?.data?.message ||
        "Xóa cộng đồng thất bại. Vui lòng thử lại.";

      showToast({ type: "error", message: msg, duration: 3000 });
    }
  };

  // MEMBER → chỉ xem
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
          Bạn là <strong>Thành viên</strong>. Bạn không có quyền quản lý cộng đồng.
        </p>
      </div>
    );
  }

  // PENDING → chờ duyệt
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

  // ADMIN + MODERATOR
  return (
    <div className="community-page">
      <div className="community-header-img">
        <img src={coverSrc} alt="cover" />
      </div>

      <div style={{ marginTop: 20 }}>
        <h2 className="community-header-title">{data.name}</h2>
        <p className="community-header-sub">{data.description}</p>

        <p style={{ marginTop: 8 }}>
          Vai trò của bạn: <strong>{role}</strong>
        </p>

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

          <div style={{ flex: 1 }} />

          {/* ✅ chỉ ADMIN mới có nút xóa */}
          {role === "ADMIN" && (
            <button
              className="btn-danger-community"
              onClick={() => setOpenDelete(true)}
              disabled={deleteMutation.isPending}
              title="Xóa cộng đồng"
            >
              {deleteMutation.isPending ? "Đang xóa..." : "Xóa cộng đồng"}
            </button>
          )}

          <BackButton />
        </div>
      </div>

      <Outlet />

      {/* ✅ Modal: Delete */}
      {openDelete && (
        <div
          className="community-modal-overlay"
          onClick={() => setOpenDelete(false)}
        >
          <div
            className="community-modal community-modal-small"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="community-modal-close"
              onClick={() => setOpenDelete(false)}
              disabled={deleteMutation.isPending}
            >
              ×
            </button>

            <h4 style={{ marginBottom: 8 }}>Xóa cộng đồng?</h4>
            <p style={{ fontSize: 14, color: "#666", marginBottom: 20 }}>
              Hành động này <b>không thể hoàn tác</b>. Bạn chắc chắn muốn xóa cộng đồng{" "}
              <b>{data.name}</b> chứ?
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                className="btn-secondary"
                onClick={() => setOpenDelete(false)}
                disabled={deleteMutation.isPending}
              >
                Hủy
              </button>

              <button
                className="btn-danger-community"
                onClick={handleConfirmDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Đang xóa..." : "Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageLayout;
