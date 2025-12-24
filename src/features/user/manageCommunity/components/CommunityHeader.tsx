import { useNavigate } from "react-router-dom";

interface Props {
  community: {
    id: number;
    name: string;
    description: string;
    thumbnailUrl?: string | null;
    role: "ADMIN" | "MODERATOR" | "MEMBER" | "PENDING";
  };
}

const CommunityHeader = ({ community }: Props) => {
  const navigate = useNavigate();

  const isAdmin = community.role === "ADMIN" || community.role === "MODERATOR";

  const coverSrc =
    community.thumbnailUrl ??
    "https://via.placeholder.com/1200x300?text=Community+Cover";

  return (
    <div style={{ width: "100%", marginBottom: 24 }}>
      {/* COVER IMAGE */}
      <div
        style={{
          width: "100%",
          height: 220,
          borderRadius: 14,
          overflow: "hidden",
          backgroundColor: "#eee",
        }}
      >
        <img
          src={coverSrc}
          alt="cover"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>

      {/* MAIN INFO */}
      <div style={{ marginTop: 18 }}>
        <h2 style={{ fontSize: 26, fontWeight: 700 }}>{community.name}</h2>

        <p style={{ color: "#555", maxWidth: 720 }}>{community.description}</p>

        <div style={{ marginTop: 6, fontSize: 14, color: "#777" }}>
          <b>Vai trò của bạn:</b> {community.role}
        </div>
      </div>

      {/* 🔐 MANAGEMENT BOX — chỉ ADMIN / MOD */}
      {isAdmin && (
        <div
          style={{
            marginTop: 16,
            padding: "14px 18px",
            borderRadius: 14,
            backgroundColor: "#fff6f9",
            border: "1px solid #ffd1e2",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div>
            <div
              style={{
                fontWeight: 600,
                color: "#d63384",
                marginBottom: 4,
              }}
            >
              Quản lý cộng đồng
            </div>

            <div style={{ fontSize: 14, color: "#555", maxWidth: 520 }}>
              Bạn có quyền <b>{community.role}</b>. Truy cập khu vực quản lý để
              chỉnh sửa cài đặt, bài viết và thành viên.
            </div>
          </div>

          <button
            onClick={() => navigate(`/community/${community.id}/manage`)}
            style={{
              background: "#ff5fa2",
              color: "#fff",
              border: "none",
              borderRadius: 999,
              padding: "10px 18px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Đi tới quản lý →
          </button>
        </div>
      )}
    </div>
  );
};

export default CommunityHeader;
