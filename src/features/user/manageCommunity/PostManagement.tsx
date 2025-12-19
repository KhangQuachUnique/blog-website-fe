import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  useApprovePost,
  useDeletePost,
  useGetCommunityManagePosts,
} from "../../../hooks/usePost"; // chỉnh path nếu khác

type TabFilter = "all" | "approved" | "pending";

const mapTabToStatusParam = (tab: TabFilter): string | undefined => {
  if (tab === "approved") return "ACTIVE";
  if (tab === "pending") return "DRAFT";
  return undefined; // all
};

const formatDate = (dateInput: string | Date) => {
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  return d.toLocaleDateString("vi-VN");
};

const PostManagement = () => {
  const { id } = useParams();
  const communityId = Number(id);

  const [filter, setFilter] = useState<TabFilter>("all");

  // modal xem chi tiết
  const [selectedPost, setSelectedPost] = useState<any | null>(null);

  // modal xoá
  const [postToDelete, setPostToDelete] = useState<any | null>(null);

  const statusParam = useMemo(() => mapTabToStatusParam(filter), [filter]);

  const {
    data: posts,
    isLoading,
    isError,
  } = useGetCommunityManagePosts(communityId, statusParam);

  const approveMutation = useApprovePost(communityId);
  const deleteMutation = useDeletePost(communityId);

  const handleApprove = (postId: number) => {
    approveMutation.mutate(postId);
  };

  const handleOpenView = (post: any) => setSelectedPost(post);
  const handleCloseView = () => setSelectedPost(null);

  const handleOpenDelete = (post: any) => setPostToDelete(post);
  const handleCloseDelete = () => setPostToDelete(null);

  const handleConfirmDelete = () => {
    if (!postToDelete) return;
    deleteMutation.mutate(postToDelete.id, {
      onSuccess: () => setPostToDelete(null),
    });
  };

  const list = Array.isArray(posts) ? posts : [];

  return (
    <div style={{ paddingTop: 20 }}>
      <h3>Quản lý bài viết</h3>
      <p style={{ marginBottom: 20, color: "#666" }}>
        Xem và quản lý tất cả bài viết trong cộng đồng.
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
          className={`community-tab ${filter === "approved" ? "community-tab-active" : ""}`}
          onClick={() => setFilter("approved")}
        >
          Đã duyệt
        </button>

        <button
          className={`community-tab ${filter === "pending" ? "community-tab-active" : ""}`}
          onClick={() => setFilter("pending")}
        >
          Chờ duyệt
        </button>
      </div>

      {/* Loading / Error */}
      {isLoading && <p style={{ color: "#888" }}>Đang tải bài viết...</p>}
      {isError && <p style={{ color: "#ff5370" }}>Lỗi khi tải danh sách bài viết.</p>}

      {/* Danh sách bài viết */}
      {!isLoading &&
        !isError &&
        list.map((post: any) => {
          const isPending = post.status === "DRAFT";
          const authorName = post.author?.fullName || post.author?.username || "Người dùng";
          const avatar = post.author?.avatarUrl || post.author?.avatar || "https://i.pravatar.cc/60";
          const date = post.createdAt ? formatDate(post.createdAt) : "";

          return (
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
                src={avatar}
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
                  {authorName} {date ? `• ${date}` : ""}
                </div>
              </div>

              <div style={{ marginRight: 12, fontSize: 13 }}>
                {isPending ? (
                  <span style={{ color: "#ff9800" }}>Chờ duyệt</span>
                ) : (
                  <span style={{ color: "#4caf50" }}>Đã duyệt</span>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 10 }}>
                {isPending && (
                  <button
                    className="community-save-btn"
                    style={{ padding: "6px 14px" }}
                    onClick={() => handleApprove(post.id)}
                    disabled={approveMutation.isPending}
                  >
                    {approveMutation.isPending ? "Đang duyệt..." : "Duyệt"}
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
                    opacity: deleteMutation.isPending ? 0.7 : 1,
                  }}
                  onClick={() => handleOpenDelete(post)}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? "Đang xóa..." : "Xóa"}
                </button>
              </div>
            </div>
          );
        })}

      {!isLoading && !isError && list.length === 0 && (
        <p style={{ color: "#888", marginTop: 20 }}>
          Không có bài viết nào trong mục này.
        </p>
      )}

      {/* Modal xem chi tiết */}
      {selectedPost && (
        <div className="community-modal-overlay" onClick={handleCloseView}>
          <div className="community-modal" onClick={(e) => e.stopPropagation()}>
            <button className="community-modal-close" onClick={handleCloseView}>
              ×
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <img
                src={
                  selectedPost.author?.avatarUrl ||
                  selectedPost.author?.avatar ||
                  "https://i.pravatar.cc/60"
                }
                alt=""
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
              <div>
                <div style={{ fontWeight: 600 }}>
                  {selectedPost.author?.fullName ||
                    selectedPost.author?.username ||
                    "Người dùng"}
                </div>
                <div style={{ fontSize: 13, color: "#666" }}>
                  {selectedPost.createdAt ? formatDate(selectedPost.createdAt) : ""} ·{" "}
                  {selectedPost.status === "DRAFT" ? "Chờ duyệt" : "Đã duyệt"}
                </div>
              </div>
            </div>

            <h4 style={{ marginTop: 16 }}>{selectedPost.title}</h4>
            <p style={{ fontSize: 14, whiteSpace: "pre-line" }}>
              {selectedPost.shortDescription || "—"}
            </p>

            {selectedPost.thumbnailUrl && (
              <div style={{ marginTop: 12 }}>
                <img
                  src={selectedPost.thumbnailUrl}
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
        <div className="community-modal-overlay" onClick={handleCloseDelete}>
          <div
            className="community-modal community-modal-small"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="community-modal-close" onClick={handleCloseDelete}>
              ×
            </button>

            <h4 style={{ marginBottom: 8 }}>Xóa bài viết?</h4>
            <p style={{ fontSize: 14, color: "#666", marginBottom: 20 }}>
              Bạn có chắc chắn muốn xóa bài <strong>{postToDelete.title}</strong> không? Hành động
              này không thể hoàn tác.
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
                  opacity: deleteMutation.isPending ? 0.7 : 1,
                }}
                onClick={handleConfirmDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Đang xóa..." : "Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostManagement;
