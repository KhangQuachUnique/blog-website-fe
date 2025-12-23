import React from "react";
import { useGetBlockComments } from "../../hooks/useComments";
import { CommentForm } from "./CommentForm";
import { CommentItem } from "./CommentItem";

interface BlockCommentsProps {
  blockId: number;
}

export const BlockCommentsSection: React.FC<BlockCommentsProps> = ({
  blockId,
}) => {
  const {
    data: commentsData,
    isLoading: getCommentsLoading,
    isError: getCommentsError,
  } = useGetBlockComments(blockId);

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
            Bình luận ({commentsData?.length || 0})
          </h3>
        </div>
      </div>

      {/* Comment Form */}
      <CommentForm blockId={blockId} placeholder="Bình luận về block này..." />

      {/* Comments List */}
      <div className="comments-list space-y-6">
        {commentsData?.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
          </div>
        ) : (
          commentsData?.map((comment) => (
            <CommentItem key={comment.id} comment={comment} blockId={blockId} />
          ))
        )}
      </div>
    </div>
  );
};
