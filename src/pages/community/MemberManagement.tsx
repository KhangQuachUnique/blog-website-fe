import { useEffect, useState } from "react";
import {
  getCommunityMembers,
  updateMemberRole,
  updateMemberStatus,
  deleteMember,
  // ApiRole,
  // ApiStatus,
  // ApiCommunityMember,
} from "./community.api"; // chỉnh lại path đúng với dự án của bạn

import type {
  ApiRole,
  ApiStatus,
  ApiCommunityMember,
} from "./community.api";

type Role = ApiRole;
type Status = ApiStatus;
type Filter = "all" | Role | "PENDING";

interface Member {
  id: number;       // id của community_members
  name: string;     // user.username
  avatar: string;
  role: Role;
  joinDate: string; // format yyyy-mm-dd
  status: Status;
}

const MemberManagement = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [filter, setFilter] = useState<Filter>("all");

  const [loading, setLoading] = useState<boolean>(true);
  const [memberToKick, setMemberToKick] = useState<Member | null>(null);

  // Map từ API sang UI
  const mapApiToMember = (m: ApiCommunityMember): Member => ({
    id: m.id,
    name: m.user.username,
    avatar:
      m.user.avatarUrl ||
      "https://i.pravatar.cc/60?img=1", // fallback nhẹ nhàng
    role: m.role,
    joinDate: m.joinedAt?.slice(0, 10) || "",
    status: m.status,
  });

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const data = await getCommunityMembers();
      setMembers(data.map(mapApiToMember));
    } catch (err) {
      console.error(err);
      alert("Không tải được danh sách thành viên!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const filteredMembers =
    filter === "all"
      ? members
      : filter === "PENDING"
      ? members.filter((m) => m.status === "PENDING")
      : members.filter((m) => m.role === filter && m.status === "ACTIVE");

  const handleApprove = async (id: number) => {
    try {
      await updateMemberStatus(id, "ACTIVE");
      setMembers((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, status: "ACTIVE" } : m
        )
      );
    } catch (err) {
      console.error(err);
      alert("Không duyệt được thành viên!");
    }
  };

  const handleChangeRole = async (id: number, newRole: Role) => {
    try {
      await updateMemberRole(id, newRole);
      setMembers((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, role: newRole } : m
        )
      );
    } catch (err) {
      console.error(err);
      alert("Không cập nhật được vai trò!");
    }
  };

  const handleOpenKick = (member: Member) => {
    setMemberToKick(member);
  };

  const handleCloseKick = () => {
    setMemberToKick(null);
  };

  const handleConfirmKick = async () => {
    if (!memberToKick) return;
    try {
      await deleteMember(memberToKick.id);
      setMembers((prev) => prev.filter((m) => m.id !== memberToKick.id));
      setMemberToKick(null);
    } catch (err) {
      console.error(err);
      alert("Kick thành viên thất bại!");
    }
  };

  return (
    <div style={{ paddingTop: 20 }}>
      <h3>Quản lý thành viên</h3>
      <p style={{ marginBottom: 20, color: "#666" }}>
        Quản lý vai trò, phê duyệt và kiểm soát thành viên trong cộng đồng.
      </p>

      {/* Tabs filter */}
      <div className="community-tabs" style={{ marginBottom: 24 }}>
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

      {loading && <p style={{ color: "#888" }}>Đang tải danh sách...</p>}

      {/* Member list */}
      {!loading &&
        filteredMembers.map((member) => (
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
                {member.status === "PENDING" && " · Chờ duyệt"}
              </div>
            </div>

            {/* Role */}
            {member.status === "ACTIVE" && (
              <select
                value={member.role}
                onChange={(e) =>
                  handleChangeRole(member.id, e.target.value as Role)
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
              {member.status === "PENDING" && (
                <button
                  className="community-save-btn"
                  style={{ padding: "6px 14px" }}
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
                }}
                onClick={() => handleOpenKick(member)}
              >
                Kick
              </button>
            </div>
          </div>
        ))}

      {!loading && filteredMembers.length === 0 && (
        <p style={{ color: "#888", marginTop: 20 }}>
          Không có thành viên nào trong mục này.
        </p>
      )}

      {/* Modal kick */}
      {memberToKick && (
        <div className="community-modal-overlay" onClick={handleCloseKick}>
          <div
            className="community-modal community-modal-small"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="community-modal-close"
              onClick={handleCloseKick}
            >
              ×
            </button>

            <h4 style={{ marginBottom: 8 }}>Kick thành viên?</h4>

            <p style={{ fontSize: 14, color: "#666", marginBottom: 20 }}>
              Bạn có chắc muốn kick{" "}
              <strong>{memberToKick.name}</strong> khỏi cộng đồng không?
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
                onClick={handleCloseKick}
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
                }}
                onClick={handleConfirmKick}
              >
                Kick
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberManagement;
