import { Link, useParams } from "react-router-dom";
import { useGetCommunityPosts } from "../../../hooks/usePost";
import { useGetCommunitySettings } from "../../../hooks/useCommunity";

const formatDate = (dateInput: string | Date) => {
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  return d.toLocaleDateString("vi-VN");
};

const CommunityPosts = () => {
  const { id } = useParams();
  const communityId = Number(id);

  // check lock (community private + chưa join)
  const { data: settings } = useGetCommunitySettings(communityId);
  const role = settings?.role;
  const isMemberApproved = role === "ADMIN" || role === "MODERATOR" || role === "MEMBER";
  const isPrivateLocked = settings ? (!settings.isPublic && !isMemberApproved) : false;

  const { data: posts, isLoading, isError } = useGetCommunityPosts(communityId);

  if (isPrivateLocked) {
    return (
      <div className="community-card" style={{ marginTop: 20 }}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>🔒 Cộng đồng riêng tư</div>
        <div style={{ color: "#666", fontSize: 14 }}>
          Bạn cần tham gia để xem bài viết.
        </div>
      </div>
    );
  }

  if (isLoading) return <p style={{ marginTop: 20 }}>Đang tải bài viết...</p>;
  if (isError) return <p style={{ marginTop: 20 }}>Lỗi khi tải bài viết.</p>;

  const list = Array.isArray(posts) ? posts : [];

  return (
    <div style={{ marginTop: 20 }}>
      <h3>Bài viết gần đây</h3>

      {list.length === 0 ? (
        <div className="community-card" style={{ marginTop: 12 }}>
          Chưa có bài viết nào trong cộng đồng này.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
          {list.map((p: any) => (
            <Link
              key={p.id}
              to={`/post/${p.id}`}
              className="community-card"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div style={{ display: "flex", gap: 14 }}>
                {p.thumbnailUrl ? (
                  <img
                    src={p.thumbnailUrl}
                    alt={p.title}
                    style={{
                      width: 120,
                      height: 80,
                      borderRadius: 12,
                      objectFit: "cover",
                      border: "1px solid #ffe4f1",
                    }}
                  />
                ) : null}

                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0 }}>{p.title}</h4>
                  <p style={{ margin: "6px 0 0", color: "#666" }}>
                    {p.shortDescription || "—"}
                  </p>
                  <div style={{ marginTop: 8, fontSize: 12, color: "#888" }}>
                    {p.author?.username ?? "Người dùng"} • {formatDate(p.createdAt)}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommunityPosts;
