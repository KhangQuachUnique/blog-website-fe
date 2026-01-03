// src/pages/community/CommunityMembers.tsx
import { useNavigate, useParams } from "react-router-dom";
import { useCommunityMembers } from "../../../hooks/useCommunityMembers";
import Avatar from "@mui/material/Avatar";
import { stringAvatar } from "../../../utils/avatarHelper";
import { formatShortDateVi } from "../../../utils/timeHelper";

function roleLabel(role: "ADMIN" | "MODERATOR" | "MEMBER") {
  if (role === "ADMIN") return "Quản trị viên";
  if (role === "MODERATOR") return "Điều hành viên";
  return "Thành viên";
}

function MemberAvatar({
  username,
  avatarUrl,
}: {
  username: string;
  avatarUrl?: string | null;
}) {
  return avatarUrl ? (
    <Avatar src={avatarUrl} alt={username} sx={{ width: 36, height: 36 }} />
  ) : (
    <Avatar {...stringAvatar(username, 36, "0.9rem", "", "none")} />
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
          Lỗi tải thành viên: {(error as any)?.message ?? "Lỗi không xác định"}
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
                      <MemberAvatar
                        username={m.user.username}
                        avatarUrl={m.user.avatarUrl}
                      />
                    </div>

                    <div className="community-member-info">
                      <div className="community-member-username">
                        {m.user.username}
                      </div>
                      <div className="community-member-joined">
                        Tham gia: {formatShortDateVi(String(m.joinedAt))}
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
