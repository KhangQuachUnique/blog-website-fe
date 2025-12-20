import { useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Loader2, Bookmark, Trash2, ExternalLink } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { useGetSavedPosts, useRemoveSavedPost, useGetSavedPostsCount } from "../../../hooks/useSavedPost";
import type { SavedPostItem } from "../../../types/savedPost";
import "../../../styles/savedPosts/SavedPosts.css";

/**
 * 🔖 SavedPostsPage
 * Hiển thị danh sách bài viết đã lưu của user
 */
export default function SavedPostsPage() {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  // State for pagination
  const currentPage = useRef(1);

  // Fetch saved posts
  const {
    data: savedPostsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetSavedPosts(userId, currentPage.current, 20);

  // Fetch count
  const { data: savedCount = 0 } = useGetSavedPostsCount(userId);

  // Remove mutation
  const { mutate: removeSaved, isPending: isRemoving } = useRemoveSavedPost();

  const handleRemove = useCallback(
    (itemId: number) => {
      if (!userId) return;
      removeSaved({ itemId, userId });
    },
    [userId, removeSaved]
  );

  const formatDate = (dateInput: string | Date) => {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return "vừa xong";
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  // Not logged in
  if (!userId) {
    return (
      <div className="saved-posts-page">
        <div className="saved-posts-empty">
          <Bookmark size={64} strokeWidth={1.5} className="saved-posts-empty__icon" />
          <h2 className="saved-posts-empty__title">Đăng nhập để xem bài viết đã lưu</h2>
          <p className="saved-posts-empty__desc">
            Bạn cần đăng nhập để lưu và xem lại các bài viết yêu thích
          </p>
          <Link to="/auth/login" className="saved-posts-empty__btn">
            Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  // Loading
  if (isLoading) {
    return (
      <div className="saved-posts-page">
        <div className="saved-posts-loading">
          <Loader2 className="saved-posts-loading__spinner" />
          <span>Đang tải...</span>
        </div>
      </div>
    );
  }

  // Error
  if (isError) {
    return (
      <div className="saved-posts-page">
        <div className="saved-posts-error">
          <h2>Không thể tải dữ liệu</h2>
          <p>{error instanceof Error ? error.message : "Đã có lỗi xảy ra"}</p>
          <button onClick={() => refetch()} className="saved-posts-error__btn">
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const items = savedPostsData?.items ?? [];
  const totalPages = savedPostsData?.totalPages ?? 0;

  return (
    <div className="saved-posts-page">
      {/* Header */}
      <div className="saved-posts-header">
        <div className="saved-posts-header__left">
          <Bookmark size={28} className="saved-posts-header__icon" />
          <div>
            <h1 className="saved-posts-header__title">Bài viết đã lưu</h1>
            <p className="saved-posts-header__count">
              {savedCount} bài viết
            </p>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {items.length === 0 ? (
        <div className="saved-posts-empty">
          <Bookmark size={64} strokeWidth={1.5} className="saved-posts-empty__icon" />
          <h2 className="saved-posts-empty__title">Chưa có bài viết nào được lưu</h2>
          <p className="saved-posts-empty__desc">
            Nhấn vào biểu tượng 🔖 trên các bài viết để lưu lại và xem sau
          </p>
          <Link to="/" className="saved-posts-empty__btn">
            Khám phá ngay
          </Link>
        </div>
      ) : (
        <>
          {/* Saved posts list */}
          <div className="saved-posts-list">
            {items.map((item: SavedPostItem) => (
              <SavedPostCard
                key={item.id}
                item={item}
                onRemove={handleRemove}
                isRemoving={isRemoving}
                formatDate={formatDate}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="saved-posts-pagination">
              <span className="saved-posts-pagination__info">
                Trang {savedPostsData?.page} / {totalPages}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/**
 * 📄 SavedPostCard Component
 */
interface SavedPostCardProps {
  item: SavedPostItem;
  onRemove: (itemId: number) => void;
  isRemoving: boolean;
  formatDate: (date: string | Date) => string;
}

function SavedPostCard({ item, onRemove, isRemoving, formatDate }: SavedPostCardProps) {
  return (
    <article className="saved-post-card">
      {/* Thumbnail */}
      {item.postThumbnail && (
        <Link to={`/post/${item.postId}`} className="saved-post-card__thumbnail">
          <img
            src={item.postThumbnail}
            alt={item.postTitle}
            loading="lazy"
          />
        </Link>
      )}

      {/* Content */}
      <div className="saved-post-card__content">
        <Link to={`/post/${item.postId}`} className="saved-post-card__title">
          {item.postTitle || "Bài viết không có tiêu đề"}
        </Link>

        {item.postPreview && (
          <p className="saved-post-card__preview">
            {item.postPreview}
          </p>
        )}

        {/* Author & Meta */}
        <div className="saved-post-card__meta">
          <div className="saved-post-card__author">
            {item.author?.avatarUrl && (
              <img
                src={item.author.avatarUrl}
                alt={item.author.username}
                className="saved-post-card__avatar"
              />
            )}
            <span className="saved-post-card__username">
              {item.author?.username || "Unknown"}
            </span>
          </div>
          <span className="saved-post-card__saved-time">
            Đã lưu {formatDate(item.savedAt)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="saved-post-card__actions">
        <Link
          to={`/post/${item.postId}`}
          className="saved-post-card__action saved-post-card__action--view"
          title="Xem bài viết"
        >
          <ExternalLink size={18} />
        </Link>
        <button
          onClick={() => onRemove(item.id)}
          disabled={isRemoving}
          className="saved-post-card__action saved-post-card__action--remove"
          title="Bỏ lưu"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </article>
  );
}
