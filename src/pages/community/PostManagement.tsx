import { useState } from "react";

type PostStatus = "approved" | "pending";

interface Post {
  id: number;
  author: string;
  avatar: string;
  title: string;
  date: string;
  status: PostStatus;
}

const mockPosts: Post[] = [
  {
    id: 1,
    author: "Nguyễn Văn A",
    avatar: "https://i.pravatar.cc/60?img=1",
    title: "Hôm nay là một ngày đẹp trời!",
    date: "2025-01-12",
    status: "approved",
  },
  {
    id: 2,
    author: "Trần Thị B",
    avatar: "https://i.pravatar.cc/60?img=2",
    title: "Mọi người cho em hỏi về React với ạ.",
    date: "2025-01-13",
    status: "pending",
  },
];

const PostManagement = () => {
  const [filter, setFilter] = useState<"all" | PostStatus>("all");

  const filteredPosts =
    filter === "all"
      ? mockPosts
      : mockPosts.filter((post) => post.status === filter);

  return (
    <div style={{ paddingTop: 20 }}>
      <h3>Quản lý bài viết</h3>
      <p style={{ marginBottom: 20, color: "#666" }}>
        Xem và quản lý tất cả bài viết trong cộng đồng.
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
            filter === "approved" ? "community-tab-active" : ""
          }`}
          onClick={() => setFilter("approved")}
        >
          Đã duyệt
        </button>

        <button
          className={`community-tab ${
            filter === "pending" ? "community-tab-active" : ""
          }`}
          onClick={() => setFilter("pending")}
        >
          Chờ duyệt
        </button>
      </div>

      {/* Post list */}
      {filteredPosts.map((post) => (
        <div key={post.id} className="community-card" style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <img
            src={post.avatar}
            alt=""
            style={{
              width: 50,
              height: 50,
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />

          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600 }}>{post.title}</div>
            <div style={{ fontSize: 13, color: "#666" }}>
              {post.author} • {post.date}
            </div>
          </div>

          <div style={{ marginRight: 12, fontSize: 13 }}>
            {post.status === "approved" ? (
              <span style={{ color: "#4caf50" }}>Đã duyệt</span>
            ) : (
              <span style={{ color: "#ff9800" }}>Chờ duyệt</span>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10 }}>
            {post.status === "pending" && (
              <button className="community-save-btn" style={{ padding: "6px 14px" }}>
                Duyệt
              </button>
            )}

            <button
              style={{
                padding: "6px 14px",
                background: "white",
                border: "1px solid #f8bcd0",
                borderRadius: 999,
                cursor: "pointer",
              }}
            >
              Xem
            </button>

            <button
              style={{
                padding: "6px 14px",
                background: "#ff5370",
                color: "white",
                border: "none",
                borderRadius: 999,
                cursor: "pointer",
              }}
            >
              Xóa
            </button>
          </div>
        </div>
      ))}

      {filteredPosts.length === 0 && (
        <p style={{ color: "#888", marginTop: 20 }}>
          Không có bài viết nào trong mục này.
        </p>
      )}
    </div>
  );
};

export default PostManagement;
