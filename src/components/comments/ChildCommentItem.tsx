import React, { useState } from 'react';
import { ChildComment } from '../../types/comment.types';
import { ReplyForm } from './ReplyForm';

interface ChildCommentItemProps {
  childComment: ChildComment;
  parentCommentId: number;
  currentUserId?: number;
  onReply: (content: string, replyToUserId?: number) => Promise<void>;
  onDelete: (replyId: number) => Promise<void>;
}

export const ChildCommentItem: React.FC<ChildCommentItemProps> = ({
  childComment,
  currentUserId,
  onReply,
  onDelete
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);

  const handleReply = async (content: string) => {
    if (!currentUserId) return;
    
    try {
      await onReply(content, childComment.commentUser.id);
      setShowReplyForm(false);
    } catch (error) {
      console.error('Error creating reply:', error);
    }
  };

  const handleDelete = async () => {
    if (confirm('Bạn có chắc muốn xóa phản hồi này?')) {
      try {
        await onDelete(childComment.id);
      } catch (error) {
        console.error('Error deleting reply:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="child-comment-item">
      <div className="flex items-start space-x-3">
        <img
          src={childComment.commentUser.avatarUrl || '/default-avatar.png'}
          alt={childComment.commentUser.username}
          className="w-8 h-8 rounded-full object-cover"
        />
        
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-900 text-sm">
              {childComment.commentUser.username}
            </span>
            
            {childComment.replyToUser && (
              <>
                <span className="text-gray-500 text-sm">→</span>
                <span className="font-medium text-blue-600 text-sm">
                  {childComment.replyToUser.username}
                </span>
              </>
            )}
            
            <span className="text-xs text-gray-500">
              {formatDate(childComment.createAt)}
            </span>
            
            {/* Delete button for reply owner */}
            {currentUserId === childComment.commentUser.id && (
              <button
                onClick={handleDelete}
                className="text-red-500 hover:text-red-700 text-xs"
              >
                Xóa
              </button>
            )}
          </div>
          
          {/* Reply Content */}
          <p className="mt-1 text-sm text-gray-700">{childComment.content}</p>
          
          {/* Reply Action */}
          <div className="mt-2">
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="text-blue-600 hover:text-blue-800 text-xs font-medium"
            >
              Trả lời
            </button>
          </div>
          
          {/* Reply Form */}
          {showReplyForm && currentUserId && (
            <div className="mt-2">
              <ReplyForm
                onSubmit={handleReply}
                onCancel={() => setShowReplyForm(false)}
                placeholder={`Trả lời ${childComment.commentUser.username}...`}
                size="small"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};