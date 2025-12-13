// src/pages/community/CommunityMembers.tsx
import { useParams } from "react-router-dom";
import { useCommunityMembers } from "../../hooks/useCommunityMembers";

function formatDate(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(d);
}

function roleLabel(role: "ADMIN" | "MODERATOR" | "MEMBER") {
  if (role === "ADMIN") return "Admin";
  if (role === "MODERATOR") return "Moderator";
  return "Member";
}

function Avatar({
  username,
  avatarUrl,
}: {
  username: string;
  avatarUrl?: string | null;
}) {
  const fallback = username?.trim()?.[0]?.toUpperCase() ?? "?";
  return avatarUrl ? (
    <img
      src={avatarUrl}
      alt={username}
      style={{ width: 36, height: 36, borderRadius: 999, objectFit: "cover" }}
    />
  ) : (
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: 999,
        display: "grid",
        placeItems: "center",
        background: "#f3f4f6",
        fontWeight: 700,
      }}
      title={username}
    >
      {fallback}
    </div>
  );
}

export default function CommunityMembers() {
  const { id } = useParams();
  const communityId = Number(id);

  const { isLoading, isError, error, total, grouped, refetch } =
    useCommunityMembers(Number.isFinite(communityId) ? communityId : undefined);

  if (!Number.isFinite(communityId) || communityId <= 0) {
    return (
      <div style={{ marginTop: 20 }}>
        <h3>Danh sách thành viên</h3>
        <p style={{ color: "crimson" }}>Community id không hợp lệ.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ marginTop: 20 }}>
        <h3>Danh sách thành viên</h3>
        <p>Đang tải...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ marginTop: 20 }}>
        <h3>Danh sách thành viên</h3>
        <p style={{ color: "crimson" }}>
          Lỗi tải members: {(error as any)?.message ?? "Unknown error"}
        </p>
        <button onClick={() => refetch()}>Thử lại</button>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h3>Danh sách thành viên</h3>
        <div style={{ opacity: 0.7 }}>{total} thành viên</div>
      </div>

      {(["ADMIN", "MODERATOR", "MEMBER"] as const).map((role) => {
        const list = grouped[role];

        return (
          <div key={role} style={{ marginTop: 14 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>
              {roleLabel(role)} • {list.length}
            </div>

            {list.length === 0 ? (
              <div style={{ opacity: 0.7 }}>Chưa có thành viên.</div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {list.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: 10,
                      border: "1px solid #eee",
                      borderRadius: 12,
                    }}
                  >
                    <Avatar
                      username={m.user.username}
                      avatarUrl={m.user.avatarUrl}
                    />
                    <div>
                      <div style={{ fontWeight: 600 }}>{m.user.username}</div>
                      <div style={{ fontSize: 12, opacity: 0.7 }}>
                        Tham gia: {formatDate(m.joinedAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
