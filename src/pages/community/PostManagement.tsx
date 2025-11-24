import { useState } from "react";

type PostStatus = "approved" | "pending";

interface Post {
  id: number;
  author: string;
  avatar: string;
  title: string;
  content: string;
  date: string;
  status: PostStatus;
  image?: string;
}

const mockPosts: Post[] = [
  {
    id: 1,
    author: "Nguyễn Văn A",
    avatar: "https://i.pravatar.cc/60?img=1",
    title: "Hôm nay là một ngày đẹp trời!",
    content:
      "Hôm nay trời nhiều nắng, ngồi code React mà thấy cuộc đời cũng dịu dàng hơn 😆. Mọi người hôm nay học gì rồi?",
    date: "2025-01-12",
    status: "approved",
    image: "https://images.pexels.com/photos/34088/pexels-photo.jpg",
  },
  {
    id: 2,
    author: "Trần Thị B",
    avatar: "https://i.pravatar.cc/60?img=2",
    title: "Mọi người cho em hỏi về React với ạ.",
    content:
      "Em mới học React, chưa hiểu rõ về useEffect và dependency array. Anh chị có thể giải thích dễ hiểu giúp em được không ạ?",
    date: "2025-01-13",
    status: "pending",
  },
];

const PostManagement = () => {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [filter, setFilter] = useState<"all" | PostStatus>("all");

  // modal xem chi tiết
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // modal xoá
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);

  const filteredPosts =
    filter === "all"
      ? posts
      : posts.filter((post) => post.status === filter);

  const handleApprove = (id: number) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: "approved" } : p
      )
    );
  };

  const handleOpenView = (post: Post) => {
    setSelectedPost(post);
  };

  const handleCloseView = () => {
    setSelectedPost(null);
  };

  const handleOpenDelete = (post: Post) => {
    setPostToDelete(post);
  };

  const handleCloseDelete = () => {
    setPostToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (!postToDelete) return;
    setPosts((prev) => prev.filter((p) => p.id !== postToDelete.id));
    setPostToDelete(null);
  };

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

      {/* Danh sách bài viết */}
      {filteredPosts.map((post) => (
        <div
          key={post.id}
          className="community-card"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
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
              <button
                className="community-save-btn"
                style={{ padding: "6px 14px" }}
                onClick={() => handleApprove(post.id)}
              >
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
              onClick={() => handleOpenView(post)}
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
              onClick={() => handleOpenDelete(post)}
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

      {/* Modal xem chi tiết */}
      {selectedPost && (
        <div className="community-modal-overlay" onClick={handleCloseView}>
          <div
            className="community-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="community-modal-close"
              onClick={handleCloseView}
            >
              ×
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <img
                src={selectedPost.avatar}
                alt=""
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
              <div>
                <div style={{ fontWeight: 600 }}>{selectedPost.author}</div>
                <div style={{ fontSize: 13, color: "#666" }}>
                  {selectedPost.date} ·{" "}
                  {selectedPost.status === "approved"
                    ? "Đã duyệt"
                    : "Chờ duyệt"}
                </div>
              </div>
            </div>

            <h4 style={{ marginTop: 16 }}>{selectedPost.title}</h4>
            <p style={{ fontSize: 14, whiteSpace: "pre-line" }}>
              {selectedPost.content}
            </p>

            {selectedPost.image && (
              <div style={{ marginTop: 12 }}>
                <img
                  src={selectedPost.image}
                  alt=""
                  style={{
                    width: "100%",
                    borderRadius: 12,
                    maxHeight: 260,
                    objectFit: "cover",
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal xoá */}
      {postToDelete && (
        <div
          className="community-modal-overlay"
          onClick={handleCloseDelete}
        >
          <div
            className="community-modal community-modal-small"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="community-modal-close"
              onClick={handleCloseDelete}
            >
              ×
            </button>

            <h4 style={{ marginBottom: 8 }}>Xóa bài viết?</h4>
            <p style={{ fontSize: 14, color: "#666", marginBottom: 20 }}>
              Bạn có chắc chắn muốn xóa bài{" "}
              <strong>{postToDelete.title}</strong> không? Hành động này
              không thể hoàn tác.
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
                onClick={handleCloseDelete}
              >
                Hủy
              </button>

              <button
                style={{
                  padding: "8px 16px",
                  borderRadius: 999,
                  border: "none",
                  background: "#ff5370",
                  color: "#fff",
                  cursor: "pointer",
                }}
                onClick={handleConfirmDelete}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostManagement;
