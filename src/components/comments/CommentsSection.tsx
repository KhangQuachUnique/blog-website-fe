import React from 'react';
import { useComments } from '../../hooks/useComments';
import { CommentForm } from './CommentForm';
import { CommentItem } from './CommentItem';
import type { SortType } from '../../types/comment.types';

interface CommentsSectionProps {
  postId?: number;
  blockId?: number;
  currentUser?: {
    id: number;
    username: string;
    avatarUrl?: string;
  };
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({
  postId,
  blockId,
  currentUser
}) => {
  const {
    comments,
    loading,
    error,
    sortBy,
    totalCount,
    createComment,
    createReply,
    deleteComment,
    deleteReply,
    changeSortBy
  } = useComments(postId, blockId);

  const handleCreateComment = async (content: string) => {
    if (!currentUser) throw new Error('User not logged in');
    await createComment(content, currentUser.id);
  };

  const handleCreateReply = async (
    parentCommentId: number, 
    content: string, 
    replyToUserId?: number
  ) => {
    if (!currentUser) throw new Error('User not logged in');
    await createReply(parentCommentId, content, currentUser.id, replyToUserId);
  };

  if (loading && comments.length === 0) {
    return (
      <div className="comments-section">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Đang tải bình luận...</span>
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
            Bình luận ({totalCount})
          </h3>
          
          {/* Sort Options */}
          {postId && totalCount > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sắp xếp theo:</span>
              <select
                value={sortBy}
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
        onSubmit={handleCreateComment}
        currentUser={currentUser}
        placeholder={postId ? 'Bình luận về bài viết này...' : 'Bình luận về block này...'}
      />

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Comments List */}
      <div className="comments-list space-y-6">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUser?.id}
              currentUser={currentUser}
              onReply={handleCreateReply}
              onDelete={deleteComment}
              onDeleteReply={deleteReply}
            />
          ))
        )}
      </div>

      {/* Loading indicator when loading more */}
      {loading && comments.length > 0 && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      )}
    </div>
  );
};