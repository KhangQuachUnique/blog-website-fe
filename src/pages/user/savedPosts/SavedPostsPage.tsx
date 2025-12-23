import { useRef } from "react";
import { Link } from "react-router-dom";
import { Loader2, Bookmark } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { useGetSavedPosts } from "../../../hooks/useSavedPost";
import Card from "../../../components/card/Card";
import "../../../styles/savedPosts/SavedPosts.css";
import "../../../styles/newsfeed/Card.css";

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

  // Not logged in
  if (!userId) {
    return (
      <div className="saved-posts-page">
        <div className="saved-posts-empty">
          <Bookmark
            size={64}
            strokeWidth={1.5}
            className="saved-posts-empty__icon"
          />
          <h2 className="saved-posts-empty__title">
            Đăng nhập để xem bài viết đã lưu
          </h2>
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
      <div style={{ padding: "20px 150px", background: "#fff" }}>
        {/* Header */}
        <div className="saved-posts-header">
          <div className="saved-posts-header__left">
            <Bookmark size={28} className="saved-posts-header__icon" />
            <div>
              <h1 className="saved-posts-header__title">Bài viết đã lưu</h1>
            </div>
          </div>
        </div>

        {/* Empty state */}
        {items.length === 0 ? (
          <div className="saved-posts-empty">
            <Bookmark
              size={64}
              strokeWidth={1.5}
              className="saved-posts-empty__icon"
            />
            <h2 className="saved-posts-empty__title">
              Chưa có bài viết nào được lưu
            </h2>
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
              {items.map((item) => (
                <div
                  key={item.id}
                  style={{ position: "relative", marginBottom: 12 }}
                >
                  {/** Map saved item -> minimal post shape for Card */}
                  <Card post={item} />
                </div>
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
    </div>
  );
}

// Removed unused SavedPostCard and local formatDate helper — using `Card` component instead
