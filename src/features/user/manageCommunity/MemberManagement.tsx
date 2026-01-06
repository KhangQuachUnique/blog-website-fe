import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  useManageCommunityMembers,
  useRemoveMember,
  useUpdateMemberRole,
} from "../../../hooks/useManageCommunityMembers";

import { useAuthUser } from "../../../hooks/useAuth";
import { useGetCommunitySettings } from "../../../hooks/useCommunity";
import { useToast } from "../../../contexts/toast";
import type {
  ECommunityRole,
  EManageCommunityRole,
  IMemberResponse,
} from "../../../types/community";

type Filter = "all" | EManageCommunityRole;

interface MemberUI {
  id: number; // community_members.id
  userId: number;
  name: string;
  avatar: string;
  role: EManageCommunityRole;
  joinDate: string;
}

const mapApiToUI = (m: IMemberResponse): MemberUI => ({
  id: m.id,
  userId: m.user.id,
  name: m.user.username,
  avatar: m.user.avatarUrl || "https://i.pravatar.cc/60?img=1",
  role: m.role as EManageCommunityRole,
  joinDate: m.joinedAt?.slice(0, 10) || "",
});

export default function MemberManagement() {
  const { id } = useParams();
  const communityId = Number(id);
  const navigate = useNavigate();

  const { showToast } = useToast();

  const [filter, setFilter] = useState<Filter>("all");
  const [memberToKick, setMemberToKick] = useState<MemberUI | null>(null);

  //  draft role (chưa áp dụng)
  const [draftRoles, setDraftRoles] = useState<
    Record<number, EManageCommunityRole>
  >({});

  // current user
  const { user } = useAuthUser();
  const currentUserId = user?.id;

  // role của mình trong community (ADMIN/MOD/MEMBER/PENDING)
  const { data: settings } = useGetCommunitySettings(communityId);
  const viewerRole = settings?.role;
  const isMod = viewerRole === "MODERATOR";

  // role param cho API
  const roleParam: EManageCommunityRole | undefined =
    filter === "all" ? undefined : (filter as EManageCommunityRole);

  const { data, isLoading, isError, refetch } = useManageCommunityMembers(
    communityId,
    roleParam
  );

  const updateRole = useUpdateMemberRole(communityId);
  const removeMember = useRemoveMember(communityId);

  const members: MemberUI[] = useMemo(
    () => (data ?? []).map(mapApiToUI),
    [data]
  );

  //  khi đổi filter hoặc reload list → clear draft để tránh lệch dữ liệu
  useEffect(() => {
    setDraftRoles({});
  }, [filter, communityId]);

  const setDraftRole = (memberId: number, role: EManageCommunityRole) => {
    setDraftRoles((prev) => ({ ...prev, [memberId]: role }));
  };

  const clearDraft = () => setDraftRoles({});

  const hasChanges = useMemo(() => {
    return Object.entries(draftRoles).some(([id, role]) => {
      const m = members.find((x) => x.id === Number(id));
      return m && m.role !== role;
    });
  }, [draftRoles, members]);

  const pendingChangesCount = useMemo(() => {
    let count = 0;
    for (const [id, role] of Object.entries(draftRoles)) {
      const m = members.find((x) => x.id === Number(id));
      if (m && m.role !== role) count++;
    }
    return count;
  }, [draftRoles, members]);

  const handleApprove = async (memberId: number) => {
    try {
      // Approve = set role MEMBER
      await updateRole.mutateAsync({ memberId, role: "MEMBER" });
      await refetch();
      showToast({ type: "success", message: "Đã duyệt thành viên!" });
    } catch (e) {
      console.error(e);
      showToast({ type: "error", message: "Duyệt thành viên thất bại!" });
    }
  };

  // Apply: commit tất cả draftRoles
  const handleApply = async () => {
    try {
      const updates = Object.entries(draftRoles)
        .map(([id, newRole]) => {
          const memberId = Number(id);
          const current = members.find((m) => m.id === memberId);
          if (!current) return null;
          if (current.role === newRole) return null;
          return {
            memberId,
            role: newRole as ECommunityRole,
            currentRole: current.role,
          };
        })
        .filter(Boolean) as {
        memberId: number;
        role: ECommunityRole;
        currentRole: EManageCommunityRole;
      }[];

      if (updates.length === 0) {
        showToast({ type: "info", message: "Không có thay đổi để áp dụng." });
        return;
      }

      // RULES FOR MODERATOR
      if (isMod) {
        // 1) MOD không được promote ai lên ADMIN
        const hasPromoteToAdmin = updates.some((u) => u.role === "ADMIN");
        if (hasPromoteToAdmin) {
          showToast({
            type: "error",
            message: "Moderator không thể nâng ai lên Admin.",
          });
          return;
        }

        // 2) MOD không được đổi role của ADMIN
        const touchesAdmin = updates.some((u) => u.currentRole === "ADMIN");
        if (touchesAdmin) {
          showToast({
            type: "error",
            message: "Moderator không thể thay đổi vai trò của Admin.",
          });
          return;
        }
      }

      await Promise.all(
        updates.map((u) =>
          updateRole.mutateAsync({ memberId: u.memberId, role: u.role })
        )
      );

      clearDraft();
      await refetch();

      showToast({
        type: "success",
        message: `Đã áp dụng ${updates.length} thay đổi!`,
      });
    } catch (e) {
      console.error(e);
      showToast({ type: "error", message: "Áp dụng thay đổi thất bại!" });
    }
  };

  const handleConfirmKick = async () => {
    if (!memberToKick) return;

    //  MOD không được kick ADMIN (double-safety)
    if (isMod && memberToKick.role === "ADMIN") {
      showToast({ type: "error", message: "Moderator không thể kick Admin." });
      setMemberToKick(null);
      return;
    }

    try {
      const shouldBan = memberToKick.role !== "PENDING";
      await removeMember.mutateAsync({
        memberId: memberToKick.id,
        ban: shouldBan,
      });
      const kicked = memberToKick;
      setMemberToKick(null);
      await refetch();

      showToast({
        type: "success",
        message:
          kicked.role === "PENDING"
            ? "Đã từ chối yêu cầu tham gia."
            : "Đã kick thành viên.",
      });
    } catch (e) {
      console.error(e);
      showToast({ type: "error", message: "Thao tác thất bại!" });
    }
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
      <p style={{ marginBottom: 16, color: "#666" }}>
        Quản lý vai trò, phê duyệt và kiểm soát thành viên trong cộng đồng.
      </p>

      {/* Tabs filter */}
      <div className="community-tabs" style={{ marginBottom: 14 }}>
        <button
          className={`community-tab ${
            filter === "all" ? "community-tab-active" : ""
          }`}
          onClick={() => setFilter("all")}
        >
          Tất cả
        </button>

        <button
          className={`community-tab ${
            filter === "ADMIN" ? "community-tab-active" : ""
          }`}
          onClick={() => setFilter("ADMIN")}
        >
          Admin
        </button>

        <button
          className={`community-tab ${
            filter === "MODERATOR" ? "community-tab-active" : ""
          }`}
          onClick={() => setFilter("MODERATOR")}
        >
          Mod
        </button>

        <button
          className={`community-tab ${
            filter === "MEMBER" ? "community-tab-active" : ""
          }`}
          onClick={() => setFilter("MEMBER")}
        >
          Thành viên
        </button>

        <button
          className={`community-tab ${
            filter === "PENDING" ? "community-tab-active" : ""
          }`}
          onClick={() => setFilter("PENDING")}
        >
          Chờ duyệt
        </button>
      </div>

      {/* Action bar: Apply / Cancel */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          justifyContent: "flex-end",
          marginBottom: 18,
        }}
      >
        {hasChanges && (
          <span style={{ fontSize: 13, color: "#d81b60", marginRight: 6 }}>
            Có {pendingChangesCount} thay đổi chưa áp dụng
          </span>
        )}

        <button
          onClick={clearDraft}
          disabled={!hasChanges || updateRole.isPending}
          style={{
            padding: "8px 14px",
            borderRadius: 999,
            border: "1px solid #ddd",
            background: "#fff",
            cursor:
              !hasChanges || updateRole.isPending ? "not-allowed" : "pointer",
            opacity: !hasChanges || updateRole.isPending ? 0.6 : 1,
          }}
        >
          Hủy
        </button>

        <button
          className="community-save-btn"
          style={{
            marginTop: 0,
            padding: "8px 16px",
            opacity: !hasChanges || updateRole.isPending ? 0.6 : 1,
          }}
          onClick={handleApply}
          disabled={!hasChanges || updateRole.isPending}
        >
          {updateRole.isPending ? "Đang áp dụng..." : "Áp dụng"}
        </button>
      </div>

      {isLoading && <p style={{ color: "#888" }}>Đang tải danh sách...</p>}

      {!isLoading &&
        members.map((member) => {
          const draft = draftRoles[member.id];
          const roleValue = draft ?? (member.role as EManageCommunityRole);
          const isDirty = draft && draft !== member.role;

          const isSelf =
            currentUserId != null && member.userId === currentUserId;

          //  MOD restrictions
          const modCannotEditAdmin = isMod && member.role === "ADMIN";
          const modCannotShowAdminOption = isMod;

          // Ẩn hẳn Kick nếu là ADMIN
          const hideKick = member.role === "ADMIN";

          return (
            <div
              key={member.id}
              className="community-card"
              style={{ display: "flex", alignItems: "center", gap: 16 }}
            >
              {/* Click avatar/name => chuyển sang trang cá nhân */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  flex: 1,
                  cursor: "pointer",
                }}
                title="Xem trang cá nhân"
                onClick={() => navigate(`/profile/${member.userId}`)}
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

                <div>
                  <div style={{ fontWeight: 600 }}>
                    {member.name}
                    {isSelf && (
                      <span
                        style={{
                          marginLeft: 8,
                          fontSize: 12,
                          color: "#c06292",
                        }}
                      >
                        (Bạn)
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: 13, color: "#666" }}>
                    {member.joinDate}
                    {member.role === "PENDING" && " · Chờ duyệt"}
                    {isDirty && (
                      <span style={{ color: "#d81b60" }}> · Chưa áp dụng</span>
                    )}
                    {modCannotEditAdmin && (
                      <span style={{ color: "#c06292" }}>
                        {" "}
                        · Admin (không thể chỉnh)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Role select (không hiện với PENDING) */}
              {member.role !== "PENDING" && (
                <select
                  value={roleValue}
                  disabled={updateRole.isPending || modCannotEditAdmin}
                  onChange={(e) => {
                    const nextRole = e.target.value as EManageCommunityRole;

                    // MOD: chặn promote lên ADMIN
                    if (isMod && nextRole === "ADMIN") {
                      showToast({
                        type: "error",
                        message: "Moderator không thể nâng ai lên Admin.",
                      });
                      return;
                    }

                    // MOD: không cho sửa admin
                    if (modCannotEditAdmin) {
                      showToast({
                        type: "error",
                        message:
                          "Moderator không thể thay đổi vai trò của Admin.",
                      });
                      return;
                    }

                    setDraftRole(member.id, nextRole);
                  }}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 12,
                    border: isDirty ? "1px solid #d81b60" : "1px solid #f7bad0",
                    background: "#fff",
                    cursor:
                      updateRole.isPending || modCannotEditAdmin
                        ? "not-allowed"
                        : "pointer",
                    opacity: modCannotEditAdmin ? 0.6 : 1,
                  }}
                >
                  {/* MOD không hiện ADMIN option */}
                  {!modCannotShowAdminOption && (
                    <option value="ADMIN">Admin</option>
                  )}
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

                {/* Admin: ẩn nút Kick */}
                {!hideKick && (
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
                )}
              </div>
            </div>
          );
        })}

      {!isLoading && members.length === 0 && (
        <p style={{ color: "#888", marginTop: 20 }}>
          Không có thành viên nào trong mục này.
        </p>
      )}

      {/* Modal kick */}
      {memberToKick && (
        <div
          className="community-modal-overlay"
          onClick={() => setMemberToKick(null)}
        >
          <div
            className="community-modal community-modal-small"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="community-modal-close"
              onClick={() => setMemberToKick(null)}
            >
              ×
            </button>

            <h4 style={{ marginBottom: 8 }}>
              {memberToKick.role === "PENDING"
                ? "Từ chối yêu cầu?"
                : "Kick thành viên?"}
            </h4>

            <p style={{ fontSize: 14, color: "#666", marginBottom: 20 }}>
              Bạn có chắc muốn{" "}
              <strong>
                {memberToKick.role === "PENDING" ? "từ chối" : "kick"}{" "}
                {memberToKick.name}
              </strong>{" "}
              không?
            </p>

            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}
            >
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
                {removeMember.isPending ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
