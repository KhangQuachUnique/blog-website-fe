import React from "react";
import { useGetPostComments } from "../../hooks/useComments";
import { CommentForm } from "./CommentForm";
import { CommentItem } from "./CommentItem";
import type { SortType } from "../../types/comment";

interface PostCommentsProps {
  postId: number;
}

export const PostCommentsSection: React.FC<PostCommentsProps> = ({
  postId,
}) => {
  const [sortBy, setSortBy] = React.useState<SortType>("newest");

  const changeSortBy = (newSortBy: SortType) => {
    setSortBy(newSortBy);
  };

  const {
    data: commentsData,
    isLoading: getCommentsLoading,
    isError: getCommentsError,
  } = useGetPostComments(postId, sortBy);
  if (getCommentsLoading) {
    return (
      <div className="comments-section">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Đang tải bình luận...</span>
        </div>
      </div>
    );
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
              <select
                value={commentsData.sortBy}
                onChange={(e) => changeSortBy(e.target.value as SortType)}
                className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Mới nhất</option>
                <option value="interactions">Tương tác nhiều</option>
              </select>
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
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      )}
    </div>
  );
};
