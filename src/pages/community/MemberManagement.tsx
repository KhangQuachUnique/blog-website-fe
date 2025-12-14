import { useState } from "react";
import { useParams } from "react-router-dom";

import {
  useManageCommunityMembers,
  useRemoveMember,
  useUpdateMemberRole,
} from "../../hooks/useManageCommunityMembers";

import type {
  CommunityMember,
  CommunityRole,
  ManageCommunityRole,
} from "../../services/user/community/communityService";

type Filter = "all" | CommunityRole | "PENDING";

interface MemberUI {
  id: number; // community_members.id
  name: string;
  avatar: string;
  role: ManageCommunityRole;
  joinDate: string;
}

const mapApiToUI = (m: CommunityMember): MemberUI => ({
  id: m.id,
  name: m.user.username,
  avatar: m.user.avatarUrl || "https://i.pravatar.cc/60?img=1",
  role: m.role as ManageCommunityRole,
  joinDate: m.joinedAt?.slice(0, 10) || "",
});

export default function MemberManagement() {
  const { id } = useParams();
  const communityId = Number(id);

  const [filter, setFilter] = useState<Filter>("all");
  const [memberToKick, setMemberToKick] = useState<MemberUI | null>(null);

  // role param cho API
  const roleParam: ManageCommunityRole | undefined =
    filter === "all" ? undefined : (filter as ManageCommunityRole);

  const { data, isLoading, isError, refetch } = useManageCommunityMembers(
    communityId,
    roleParam
  );

  const updateRole = useUpdateMemberRole(communityId);
  const removeMember = useRemoveMember(communityId);

  const members: MemberUI[] = (data ?? []).map(mapApiToUI);

  const handleApprove = async (memberId: number) => {
    // Approve = set role MEMBER
    await updateRole.mutateAsync({ memberId, role: "MEMBER" });
  };

  const handleChangeRole = async (memberId: number, role: CommunityRole) => {
    await updateRole.mutateAsync({ memberId, role });
  };

  const handleConfirmKick = async () => {
    if (!memberToKick) return;
    await removeMember.mutateAsync(memberToKick.id);
    setMemberToKick(null);
  };

  if (!Number.isFinite(communityId) || communityId <= 0) {
    return <div style={{ paddingTop: 20 }}>Community id không hợp lệ.</div>;
  }

  if (isError) {
    return (
      <div style={{ paddingTop: 20 }}>
        <h3>Quản lý thành viên</h3>
        <p style={{ color: "crimson" }}>Không tải được danh sách thành viên.</p>
        <button onClick={() => refetch()}>Thử lại</button>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 20 }}>
      <h3>Quản lý thành viên</h3>
      <p style={{ marginBottom: 20, color: "#666" }}>
        Quản lý vai trò, phê duyệt và kiểm soát thành viên trong cộng đồng.
      </p>

      {/* Tabs filter */}
      <div className="community-tabs" style={{ marginBottom: 24 }}>
        <button
          className={`community-tab ${filter === "all" ? "community-tab-active" : ""}`}
          onClick={() => setFilter("all")}
        >
          Tất cả
        </button>

        <button
          className={`community-tab ${filter === "ADMIN" ? "community-tab-active" : ""}`}
          onClick={() => setFilter("ADMIN")}
        >
          Admin
        </button>

        <button
          className={`community-tab ${filter === "MODERATOR" ? "community-tab-active" : ""}`}
          onClick={() => setFilter("MODERATOR")}
        >
          Mod
        </button>

        <button
          className={`community-tab ${filter === "MEMBER" ? "community-tab-active" : ""}`}
          onClick={() => setFilter("MEMBER")}
        >
          Thành viên
        </button>

        <button
          className={`community-tab ${filter === "PENDING" ? "community-tab-active" : ""}`}
          onClick={() => setFilter("PENDING")}
        >
          Chờ duyệt
        </button>
      </div>

      {isLoading && <p style={{ color: "#888" }}>Đang tải danh sách...</p>}

      {!isLoading &&
        members.map((member) => (
          <div
            key={member.id}
            className="community-card"
            style={{ display: "flex", alignItems: "center", gap: 16 }}
          >
            <img
              src={member.avatar}
              alt=""
              style={{
                width: 50,
                height: 50,
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{member.name}</div>
              <div style={{ fontSize: 13, color: "#666" }}>
                {member.joinDate}
                {member.role === "PENDING" && " · Chờ duyệt"}
              </div>
            </div>

            {/* Role select (không hiện với PENDING) */}
            {member.role !== "PENDING" && (
              <select
                value={member.role}
                disabled={updateRole.isPending}
                onChange={(e) =>
                  handleChangeRole(member.id, e.target.value as CommunityRole)
                }
                style={{
                  padding: "6px 10px",
                  borderRadius: 12,
                  border: "1px solid #f7bad0",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                <option value="ADMIN">Admin</option>
                <option value="MODERATOR">Moderator</option>
                <option value="MEMBER">Member</option>
              </select>
            )}

            {/* Buttons */}
            <div style={{ display: "flex", gap: 10 }}>
              {member.role === "PENDING" && (
                <button
                  className="community-save-btn"
                  style={{ padding: "6px 14px" }}
                  disabled={updateRole.isPending}
                  onClick={() => handleApprove(member.id)}
                >
                  Duyệt
                </button>
              )}

              <button
                style={{
                  padding: "6px 14px",
                  background: "#ff5370",
                  color: "white",
                  border: "none",
                  borderRadius: 999,
                  cursor: "pointer",
                  opacity: removeMember.isPending ? 0.7 : 1,
                }}
                disabled={removeMember.isPending}
                onClick={() => setMemberToKick(member)}
              >
                {member.role === "PENDING" ? "Từ chối" : "Kick"}
              </button>
            </div>
          </div>
        ))}

      {!isLoading && members.length === 0 && (
        <p style={{ color: "#888", marginTop: 20 }}>
          Không có thành viên nào trong mục này.
        </p>
      )}

      {/* Modal kick */}
      {memberToKick && (
        <div className="community-modal-overlay" onClick={() => setMemberToKick(null)}>
          <div
            className="community-modal community-modal-small"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="community-modal-close" onClick={() => setMemberToKick(null)}>
              ×
            </button>

            <h4 style={{ marginBottom: 8 }}>
              {memberToKick.role === "PENDING" ? "Từ chối yêu cầu?" : "Kick thành viên?"}
            </h4>

            <p style={{ fontSize: 14, color: "#666", marginBottom: 20 }}>
              Bạn có chắc muốn{" "}
              <strong>
                {memberToKick.role === "PENDING" ? "từ chối" : "kick"} {memberToKick.name}
              </strong>{" "}
              không?
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                style={{
                  padding: "8px 16px",
                  borderRadius: 999,
                  border: "1px solid #ddd",
                  background: "#fff",
                  cursor: "pointer",
                }}
                onClick={() => setMemberToKick(null)}
              >
                Hủy
              </button>

              <button
                style={{
                  padding: "8px 16px",
                  borderRadius: 999,
                  background: "#ff5370",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  opacity: removeMember.isPending ? 0.7 : 1,
                }}
                disabled={removeMember.isPending}
                onClick={handleConfirmKick}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
