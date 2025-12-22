import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useApprovePost,
  useDeletePost,
  useGetCommunityManagePosts,
} from "../../../hooks/usePost";

import Card from "../../../components/card/Card";

const PostManagement = () => {
  const { id } = useParams();
  const communityId = Number(id);
  const navigate = useNavigate();

  const statusParam = "DRAFT";

  const [approvingPostId, setApprovingPostId] = useState<number | null>(null);
  const [rejectingPostId, setRejectingPostId] = useState<number | null>(null);

  // ✅ [CHANGE] lấy thêm refetch để reload list sau khi duyệt/từ chối
  const {
    data: posts,
    isLoading,
    isError,
    refetch, // ✅
  } = useGetCommunityManagePosts(communityId, statusParam);

  const approveMutation = useApprovePost(communityId);
  const deleteMutation = useDeletePost(communityId); // dùng làm "Từ chối"

  const openReviewPost = (postId: number) => {
    navigate(`/post/${postId}?review=1`);
  };

  const handleApprove = (postId: number) => {
    setApprovingPostId(postId);
    approveMutation.mutate(postId, {
      onSuccess: async () => {
        await refetch(); // ✅ [ADD] duyệt xong thì load lại danh sách
      },
      onSettled: () => setApprovingPostId(null),
    });
  };

  const handleReject = (postId: number) => {
    setRejectingPostId(postId);
    deleteMutation.mutate(postId, {
      onSuccess: async () => {
        await refetch(); // ✅ [ADD] từ chối xong thì load lại danh sách
      },
      onSettled: () => setRejectingPostId(null),
    });
  };

  const list = Array.isArray(posts) ? posts : [];

  return (
    <div style={{ paddingTop: 20 }}>
      <h3>Quản lý bài viết</h3>
      <p style={{ marginBottom: 20, color: "#666" }}>
        Danh sách bài viết đang chờ duyệt trong cộng đồng.
      </p>

      {isLoading && <p style={{ color: "#888" }}>Đang tải bài viết...</p>}
      {isError && (
        <p style={{ color: "#ff5370" }}>Lỗi khi tải danh sách bài viết.</p>
      )}

      {!isLoading && !isError && list.length === 0 && (
        <div className="community-card" style={{ marginTop: 16 }}>
          Không có bài viết nào đang chờ duyệt.
        </div>
      )}

      {!isLoading &&
        !isError &&
        list.map((post: any) => {
          const isApprovingThis =
            approveMutation.isPending && approvingPostId === post.id;
          const isRejectingThis =
            deleteMutation.isPending && rejectingPostId === post.id;

          const disabled = approveMutation.isPending || deleteMutation.isPending;

          return (
            <div key={post.id} className="manage-post-card">
              <div
                role="button"
                tabIndex={0}
                style={{ cursor: "pointer" }}
                onClickCapture={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.closest(".manage-post-card__actions")) return;
                  const a = target.closest("a");
                  if (a) e.preventDefault();
                }}
                onClick={() => openReviewPost(post.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    openReviewPost(post.id);
                }}
              >
                <Card post={post} />
              </div>

              <div
                className="manage-post-card__actions"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="manage-post-btn manage-post-btn--reject"
                  onClick={() => handleReject(post.id)}
                  disabled={disabled}
                >
                  {isRejectingThis ? "Đang từ chối..." : "Từ chối"}
                </button>

                <button
                  className="manage-post-btn manage-post-btn--approve"
                  onClick={() => handleApprove(post.id)}
                  disabled={disabled}
                >
                  {isApprovingThis ? "Đang chấp nhận..." : "Chấp nhận"}
                </button>
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default PostManagement;
