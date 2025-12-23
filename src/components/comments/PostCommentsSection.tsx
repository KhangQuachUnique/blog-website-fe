import React from "react";
import { useGetPostComments } from "../../hooks/useComments";
import { CommentForm } from "./CommentForm";
import { CommentItem } from "./CommentItem";
import PostCommentsSectionSkeleton from "../skeleton/PostCommentsSectionSkeleton";
import type { SortType } from "../../types/comment";

interface PostCommentsProps {
  postId: number;
}

export const PostCommentsSection: React.FC<PostCommentsProps> = ({
  postId,
}) => {
  const [sortBy, setSortBy] = React.useState<SortType>("newest");
  const [openSort, setOpenSort] = React.useState(false);
  const sortRef = React.useRef<HTMLDivElement | null>(null);

  const changeSortBy = (newSortBy: SortType) => {
    setSortBy(newSortBy);
  };

  React.useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setOpenSort(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const {
    data: commentsData,
    isLoading: getCommentsLoading,
    isError: getCommentsError,
  } = useGetPostComments(postId, sortBy);
  if (getCommentsLoading) {
    return <PostCommentsSectionSkeleton />;
  }

  if (getCommentsError) {
    return (
      <div className="comments-section">
        <div className="text-center py-8 text-red-500">
          <p>Đã xảy ra lỗi khi tải bình luận. Vui lòng thử lại sau.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="comments-section space-y-6">
      {/* Comments Header */}
      <div className="comments-header">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">
            Bình luận ({commentsData?.totalCount || 0})
          </h3>

          {/* Sort Options */}
          {postId && commentsData?.totalCount > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sắp xếp theo:</span>

              <div
                ref={sortRef}
                className="relative inline-block text-left"
                id="post-comments-sort"
              >
                {/* Custom dropdown: button + list */}
                <button
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={openSort}
                  onClick={() => setOpenSort((s) => !s)}
                  className="flex items-center justify-between gap-3 w-[170px] text-sm border border-[#F7D6DC] rounded-lg px-4 py-1.5 bg-white focus:outline-none focus:border-[#F295B6] focus:ring-4 focus:ring-[#F295B6]/20"
                >
                  <span className="truncate">
                    {sortBy === "newest" ? "Mới nhất" : "Tương tác nhiều"}
                  </span>
                  <svg
                    className={`transform transition-transform ${
                      openSort ? "-rotate-180" : "rotate-0"
                    } text-[#BA2243]`}
                    width="18"
                    height="18"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6 8l4 4 4-4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {openSort && (
                  <ul
                    role="listbox"
                    tabIndex={-1}
                    className="absolute right-0 mt-2 w-[170px] bg-white border border-[#F7D6DC] rounded-md z-20"
                  >
                    <li
                      role="option"
                      aria-selected={sortBy === "newest"}
                      onClick={() => {
                        changeSortBy("newest");
                        setOpenSort(false);
                      }}
                      className={`px-4 py-2 text-sm cursor-pointer hover:bg-[#FFF0F4] ${
                        sortBy === "newest"
                          ? "text-[#BA2243] font-semibold"
                          : "text-gray-700"
                      }`}
                    >
                      Mới nhất
                    </li>
                    <li
                      role="option"
                      aria-selected={sortBy === "interactions"}
                      onClick={() => {
                        changeSortBy("interactions");
                        setOpenSort(false);
                      }}
                      className={`px-4 py-2 text-sm cursor-pointer hover:bg-[#FFF0F4] ${
                        sortBy === "interactions"
                          ? "text-[#BA2243] font-semibold"
                          : "text-gray-700"
                      }`}
                    >
                      Tương tác nhiều
                    </li>
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comment Form */}
      <CommentForm
        postId={postId}
        placeholder={
          postId ? "Bình luận về bài viết này..." : "Bình luận về block này..."
        }
      />

      {/* Comments List */}
      <div className="comments-list space-y-6">
        {commentsData?.comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
          </div>
        ) : (
          commentsData?.comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} postId={postId} />
          ))
        )}
      </div>

      {/* Loading indicator when loading more */}
      {getCommentsLoading && commentsData?.comments.length > 0 && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#FEB2CD] mx-auto"></div>
        </div>
      )}
    </div>
  );
};
