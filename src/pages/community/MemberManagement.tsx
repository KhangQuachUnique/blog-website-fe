import { useState } from "react";

type Role = "admin" | "moderator" | "member";
type Status = "active" | "pending";

interface Member {
  id: number;
  name: string;
  avatar: string;
  role: Role;
  joinDate: string;
  status: Status;
}

const mockMembers: Member[] = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    avatar: "https://i.pravatar.cc/60?img=1",
    role: "admin",
    joinDate: "2024-12-18",
    status: "active",
  },
  {
    id: 2,
    name: "Trần Thị B",
    avatar: "https://i.pravatar.cc/60?img=2",
    role: "moderator",
    joinDate: "2024-12-20",
    status: "active",
  },
  {
    id: 3,
    name: "Đặng Minh C",
    avatar: "https://i.pravatar.cc/60?img=3",
    role: "member",
    joinDate: "2024-12-25",
    status: "active",
  },
  {
    id: 4,
    name: "Phạm Thị D",
    avatar: "https://i.pravatar.cc/60?img=4",
    role: "member",
    joinDate: "2025-01-10",
    status: "pending",
  },
];

const MemberManagement = () => {
  const [members, setMembers] = useState<Member[]>(mockMembers);
  const [filter, setFilter] = useState<"all" | Role | "pending">("all");

  const [memberToKick, setMemberToKick] = useState<Member | null>(null);

  const filteredMembers =
    filter === "all"
      ? members
      : filter === "pending"
      ? members.filter((m) => m.status === "pending")
      : members.filter((m) => m.role === filter && m.status === "active");

  const handleApprove = (id: number) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, status: "active" } : m
      )
    );
  };

  const handleChangeRole = (id: number, newRole: Role) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, role: newRole } : m
      )
    );
  };

  const handleOpenKick = (member: Member) => {
    setMemberToKick(member);
  };

  const handleCloseKick = () => {
    setMemberToKick(null);
  };

  const handleConfirmKick = () => {
    if (!memberToKick) return;
    setMembers((prev) => prev.filter((m) => m.id !== memberToKick.id));
    setMemberToKick(null);
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
          className={`community-tab ${filter === "all" ? "community-tab-active" : ""}`}
          onClick={() => setFilter("all")}
        >
          Tất cả
        </button>

        <button
          className={`community-tab ${filter === "admin" ? "community-tab-active" : ""}`}
          onClick={() => setFilter("admin")}
        >
          Admin
        </button>

        <button
          className={`community-tab ${filter === "moderator" ? "community-tab-active" : ""}`}
          onClick={() => setFilter("moderator")}
        >
          Mod
        </button>

        <button
          className={`community-tab ${filter === "member" ? "community-tab-active" : ""}`}
          onClick={() => setFilter("member")}
        >
          Thành viên
        </button>

        <button
          className={`community-tab ${filter === "pending" ? "community-tab-active" : ""}`}
          onClick={() => setFilter("pending")}
        >
          Chờ duyệt
        </button>
      </div>

      {/* Member list */}
      {filteredMembers.map((member) => (
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
              {member.status === "pending" && " · Chờ duyệt"}
            </div>
          </div>

          {/* Role */}
          {member.status === "active" && (
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
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
              <option value="member">Member</option>
            </select>
          )}

          {/* Buttons */}
          <div style={{ display: "flex", gap: 10 }}>
            {member.status === "pending" && (
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

      {filteredMembers.length === 0 && (
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
            <button className="community-modal-close" onClick={handleCloseKick}>
              ×
            </button>

            <h4 style={{ marginBottom: 8 }}>Kick thành viên?</h4>

            <p style={{ fontSize: 14, color: "#666", marginBottom: 20 }}>
              Bạn có chắc muốn kick{" "}
              <strong>{memberToKick.name}</strong> khỏi cộng đồng không?
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
