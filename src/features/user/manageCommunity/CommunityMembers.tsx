// src/pages/community/CommunityMembers.tsx
import { useNavigate, useParams } from "react-router-dom";
import { useCommunityMembers } from "../../../hooks/useCommunityMembers";

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

  const navigate = useNavigate();

  const { isLoading, isError, error, total, grouped, refetch } =
    useCommunityMembers(communityId);

  if (!Number.isFinite(communityId) || communityId <= 0) {
    return (
      <div className="community-members" data-empty>
        <h3>Danh sách thành viên</h3>
        <p className="community-members__error">Community id không hợp lệ.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="community-members" aria-busy>
        <h3>Danh sách thành viên</h3>
        <p className="community-members__muted">Đang tải...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="community-members">
        <h3>Danh sách thành viên</h3>
        <p className="community-members__error">
          Lỗi tải members: {(error as any)?.message ?? "Unknown error"}
        </p>
        <button
          className="btn btn-outline community-members__retry"
          onClick={() => refetch()}
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="community-members">
      <div className="community-members__header">
        <h3>Danh sách thành viên</h3>
        <div className="community-members__count">{total} thành viên</div>
      </div>

      {(["ADMIN", "MODERATOR", "MEMBER"] as const).map((role) => {
        const list = grouped[role];

        return (
          <section
            key={role}
            className={`community-members__group community-members__group--${role.toLowerCase()}`}
          >
            <div className="community-members__group-title">
              {roleLabel(role)} • {list.length}
            </div>

            {list.length === 0 ? (
              <div className="community-members__empty">
                Chưa có thành viên.
              </div>
            ) : (
              <div className="community-members__list">
                {list.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => navigate(`/profile/${m.user.id}`)}
                    className="community-member-item"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ")
                        navigate(`/profile/${m.user.id}`);
                    }}
                  >
                    <div className="community-member-avatar">
                      <Avatar
                        username={m.user.username}
                        avatarUrl={m.user.avatarUrl}
                      />
                    </div>

                    <div className="community-member-info">
                      <div className="community-member-username">
                        {m.user.username}
                      </div>
                      <div className="community-member-joined">
                        Tham gia: {formatDate(String(m.joinedAt))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
