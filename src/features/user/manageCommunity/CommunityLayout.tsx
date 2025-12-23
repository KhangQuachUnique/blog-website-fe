import { useState, type MouseEvent } from "react";
import {
  NavLink,
  Outlet,
  useParams,
  useNavigate,
  // useLocation,
} from "react-router-dom";
import { useGetCommunitySettings } from "../../../hooks/useCommunity";
import {
  useJoinCommunity,
  useLeaveCommunity,
} from "../../../hooks/useManageCommunityMembers";
import { useToast } from "../../../contexts/toast";
import "../../../styles/community.css";
import CustomButton from "../../../components/button";

const CommunityLayout = () => {
  const { id } = useParams();
  const communityId = Number(id);

  const navigate = useNavigate();
  // const location = useLocation();

  // ✅ luôn gọi hooks đủ, kể cả id không hợp lệ
  const safeCommunityId =
    Number.isFinite(communityId) && communityId > 0 ? communityId : 0;

  const { data, isLoading } = useGetCommunitySettings(safeCommunityId);
  const { showToast } = useToast();

  const [openLeave, setOpenLeave] = useState(false);

  const joinMutation = useJoinCommunity(safeCommunityId);
  const leaveMutation = useLeaveCommunity(safeCommunityId);

  // ✅ return sớm đặt SAU khi đã gọi hết hooks
  if (!Number.isFinite(communityId) || communityId <= 0) {
    return <p>Community id không hợp lệ</p>;
  }

  if (isLoading) return <p>Đang tải...</p>;
  if (!data) return <p>Không tìm thấy cộng đồng</p>;

  const role = data.role; // "ADMIN" | "MODERATOR" | "MEMBER" | "PENDING" | "NONE"(nếu bạn có)
  const isBanned = !!data.isBanned;
  const isAdminOrMod = role === "ADMIN" || role === "MODERATOR";
  const isMemberApproved =
    role === "ADMIN" || role === "MODERATOR" || role === "MEMBER";

  // ✅ private: nếu chưa approved thì lock posts/members
  const isPrivateLocked = !data.isPublic && !isMemberApproved;

  const coverSrc =
    data.thumbnailUrl ??
    "https://via.placeholder.com/1200x300?text=Community+Cover";

  // ✅ chỉ member thật sự mới được leave
  const canLeave = isMemberApproved;

  // ✅ không cần useMemo
  let joinLabel = "";
  if (role === "PENDING") joinLabel = "Đang chờ duyệt";
  else if (role === "NONE") {
    joinLabel =
      data.isPublic && !data.requireMemberApproval
        ? "Tham gia cộng đồng"
        : "Gửi yêu cầu tham gia";
  }

  const handleJoin = async () => {
    try {
      const res = await joinMutation.mutateAsync();
      const status = res?.status; // "JOINED" | "PENDING"

      if (status === "JOINED") {
        showToast({
          type: "success",
          message: "Tham gia cộng đồng thành công!",
          duration: 2500,
        });
      } else {
        showToast({
          type: "info",
          message: "Đã gửi yêu cầu tham gia. Vui lòng chờ duyệt.",
          duration: 3000,
        });
      }
    } catch (e: any) {
      console.error(e);
      const msg =
        e?.response?.data?.message || "Tham gia thất bại. Vui lòng thử lại.";
      showToast({ type: "error", message: msg, duration: 3000 });
    }
  };

  const handleConfirmLeave = async () => {
    try {
      await leaveMutation.mutateAsync();
      showToast({
        type: "success",
        message: "Đã rời cộng đồng thành công.",
        duration: 2500,
      });
      setOpenLeave(false);
      // Removed automatic redirect so user stays on community page after leaving.
    } catch (e: any) {
      console.error(e);
      const msg =
        e?.response?.data?.message ||
        "Rời cộng đồng thất bại. Vui lòng thử lại.";
      showToast({ type: "error", message: msg, duration: 3000 });
    }
  };

  const preventIfLocked = (e: MouseEvent) => {
    if (!isPrivateLocked) return;
    e.preventDefault();
    showToast({
      type: "info",
      message: "Cộng đồng riêng tư. Hãy tham gia để xem nội dung.",
      duration: 2500,
    });
  };

  return (
    <div className="community-page">
      <div className="community-header-img">
        <img src={coverSrc} alt="cover" />
      </div>

      <div className="community-content">
        <div className="community-header-row">
          <div className="community-header-main">
            <h1 className="community-title">{data.name}</h1>
            <div className="community-meta">
              <span>{data.isPublic ? "Công khai" : "Riêng tư"}</span>
              <span>•</span>
              <span>{data.memberCount} thành viên</span>
            </div>
            <p className="community-sub mt-10 !text-lg">{data.description}</p>
          </div>

          <div className="community-header-actions">
            <div className="community-actions">
              <div className="community-actions__left">
                {isAdminOrMod && (
                  <button
                    onClick={() => navigate(`/community/${communityId}/manage`)}
                    className="btn-manage"
                  >
                    Quản lý cộng đồng
                  </button>
                )}

                {role === "NONE" && !isBanned && (
                  <CustomButton
                    style={{
                      background: "#ff9eb5",
                      color: "#fff",
                      border: "1px solid #ffd1e2",
                      boxShadow: "0 4px 8px rgba(0,0,0,0.06)",
                      width: "auto",
                    }}
                    onClick={handleJoin}
                    disabled={joinMutation.isPending}
                    title={data.isPublic ? "Tham gia" : "Yêu cầu tham gia"}
                  >
                    {joinMutation.isPending ? "Đang xử lý..." : joinLabel}
                  </CustomButton>
                )}

                {role === "NONE" && isBanned && (
                  <CustomButton
                    style={{
                      background: "#fff",
                      color: "#999",
                      border: "1px solid #f0e7ea",
                      width: "auto",
                    }}
                    disabled
                    title="Bạn đã bị kick khỏi cộng đồng này nên không thể tham gia lại"
                  >
                    Không thể tham gia
                  </CustomButton>
                )}

                {role === "PENDING" && (
                  <CustomButton
                    style={{
                      background: "#fff",
                      color: "#f295b6",
                      border: "1px solid #ffd1e2",
                      width: "auto",
                    }}
                    disabled
                    title="Yêu cầu đang chờ duyệt"
                  >
                    {joinLabel}
                  </CustomButton>
                )}

                {canLeave && (
                  <CustomButton
                    style={{
                      background: "#fff",
                      color: "#f295b6",
                      border: "2px solid #f295b6",
                      width: "auto",
                    }}
                    onClick={() => setOpenLeave(true)}
                    disabled={leaveMutation.isPending}
                    title="Rời khỏi cộng đồng này"
                  >
                    {leaveMutation.isPending
                      ? "Đang xử lý..."
                      : "Rời cộng đồng"}
                  </CustomButton>
                )}
              </div>

              {/* header right actions removed — create button moved into tabs */}
            </div>
          </div>
        </div>

        {isPrivateLocked && (
          <div className="community-card mt-14">
            <div style={{ fontWeight: 700, marginBottom: 6 }}>
              🔒 Cộng đồng riêng tư
            </div>
            <div style={{ color: "#666", fontSize: 14 }}>
              Bạn cần tham gia (và được duyệt nếu có) để xem bài viết và danh
              sách thành viên.
            </div>
          </div>
        )}
      </div>

      <div className="community-tabs-wrapper">
        <div className="community-content">
          <div className="community-tabs">
            <nav aria-label="community tabs" className="community-tabs-nav">
              <NavLink
                to={`/community/${communityId}`}
                end
                onClick={preventIfLocked}
                className={({ isActive }) =>
                  "community-tab " +
                  (isActive ? "community-tab-active" : "") +
                  (isPrivateLocked ? " community-tab-disabled" : "")
                }
              >
                Bài viết
              </NavLink>

              {/* 'Giới thiệu' tab removed */}

              <NavLink
                to={`/community/${communityId}/members`}
                onClick={preventIfLocked}
                className={({ isActive }) =>
                  "community-tab " +
                  (isActive ? "community-tab-active" : "") +
                  (isPrivateLocked ? " community-tab-disabled" : "")
                }
              >
                Thành viên
              </NavLink>
            </nav>

            {/* create button removed from layout tabs; kept inside posts content */}
          </div>
        </div>
      </div>

      <div className="community-content community-content--outlet">
        <Outlet />
      </div>

      {openLeave && (
        <div
          className="community-modal-overlay"
          onClick={() => setOpenLeave(false)}
        >
          <div
            className="community-modal community-modal-small"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="community-modal-close"
              onClick={() => setOpenLeave(false)}
              disabled={leaveMutation.isPending}
            >
              ×
            </button>

            <h4 style={{ marginBottom: 8 }}>Rời cộng đồng?</h4>
            <p style={{ fontSize: 14, color: "#666", marginBottom: 20 }}>
              Bạn chắc chắn muốn rời khỏi cộng đồng <b>{data.name}</b> chứ?
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
              }}
            >
              <button
                className="btn-secondary"
                onClick={() => setOpenLeave(false)}
                disabled={leaveMutation.isPending}
              >
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
