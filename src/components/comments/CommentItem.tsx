import React, { useState } from 'react';
import type { Comment } from '../../types/comment.types';
import { ReplyForm } from './ReplyForm';
import { ChildCommentItem } from './ChildCommentItem';

interface CommentItemProps {
  comment: Comment;
  currentUserId?: number;
  onReply: (parentCommentId: number, content: string, replyToUserId?: number) => Promise<void>;
  onDelete: (commentId: number) => Promise<void>;
  onDeleteReply: (commentId: number, replyId: number) => Promise<void>;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  currentUserId,
  onReply,
  onDelete,
  onDeleteReply
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  const handleReply = async (content: string) => {
    if (!currentUserId) return;
    
    try {
      await onReply(comment.id, content);
      setShowReplyForm(false);
      setShowReplies(true); // Hiển thị replies sau khi tạo
    } catch (error) {
      console.error('Error creating reply:', error);
    }
  };

  const handleDelete = async () => {
    if (confirm('Bạn có chắc muốn xóa comment này?')) {
      try {
        await onDelete(comment.id);
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="comment-item border-b border-gray-200 py-4">
      {/* Comment Header */}
      <div className="flex items-start space-x-3">
        <img
          src={comment.commenter.avatarUrl || '/default-avatar.png'}
          alt={comment.commenter.username}
          className="w-10 h-10 rounded-full object-cover"
        />
        
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-gray-900">
              {comment.commenter.username}
            </span>
            <span className="text-sm text-gray-500">
              {formatDate(comment.createAt)}
            </span>
            
            {/* Delete button for comment owner */}
            {currentUserId === comment.commenter.id && (
              <button
                onClick={handleDelete}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Xóa
              </button>
            )}
          </div>
          
          {/* Comment Content */}
          <p className="mt-2 text-gray-700">{comment.content}</p>
          
          {/* Comment Actions */}
          <div className="mt-3 flex items-center space-x-4">
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Trả lời
            </button>
            
            {comment.childCommentsCount > 0 && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="text-gray-600 hover:text-gray-800 text-sm"
              >
                {showReplies ? 'Ẩn' : 'Xem'} {comment.childCommentsCount} phản hồi
              </button>
            )}
          </div>
          
          {/* Reply Form */}
          {showReplyForm && currentUserId && (
            <div className="mt-3">
              <ReplyForm
                onSubmit={handleReply}
                onCancel={() => setShowReplyForm(false)}
                placeholder={`Trả lời ${comment.commenter.username}...`}
              />
            </div>
          )}
          
          {/* Child Comments */}
          {showReplies && comment.childComments.length > 0 && (
            <div className="mt-4 ml-8 space-y-3">
              {comment.childComments.map((childComment) => (
                <ChildCommentItem
                  key={childComment.id}
                  childComment={childComment}
                  parentCommentId={comment.id}
                  currentUserId={currentUserId}
                  onReply={(content, replyToUserId) => 
                    onReply(comment.id, content, replyToUserId)
                  }
                  onDelete={(replyId) => onDeleteReply(comment.id, replyId)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};