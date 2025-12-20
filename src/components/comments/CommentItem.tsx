import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import type { Comment } from '../../types/comment.types';
import { ReplyForm } from './ReplyForm';

interface CommentItemProps {
  comment: Comment;
  currentUserId?: number;
  currentUser?: {
    id: number;
    username: string;
    avatarUrl?: string;
  };
  onReply: (parentCommentId: number, content: string, replyToUserId?: number) => Promise<void>;
  onDelete: (commentId: number) => Promise<void>;
  onDeleteReply: (commentId: number, replyId: number) => Promise<void>;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  currentUserId,
  currentUser,
  onReply,
  onDelete,
  onDeleteReply
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replyingToChildId, setReplyingToChildId] = useState<number | null>(null);

  const handleReply = async (content: string) => {
    if (!currentUserId) return;
    try {
      // Truyền thêm comment.commenter.id vào tham số thứ 3
      await onReply(comment.id, content, comment.commenter.id);
      setShowReplyForm(false);
      setShowReplies(true);
    } catch (error) {
      console.error('Error creating reply:', error);
      alert('Không thể tạo reply. Vui lòng thử lại.');
    }
  };

  const handleChildReply = async (childCommentUserId: number, content: string) => {
    if (!currentUserId) return;
    
    try {
      await onReply(comment.id, content, childCommentUserId);
      setReplyingToChildId(null);
      setShowReplies(true);
    } catch (error) {
      console.error('Error replying to child comment:', error);
      alert('Không thể tạo reply. Vui lòng thử lại.');
    }
  };

  const handleDelete = async () => {
    if (confirm('Bạn có chắc muốn xóa comment này?')) {
      try {
        await onDelete(comment.id);
      } catch (error) {
        console.error('Error deleting comment:', error);
        alert('Không thể xóa comment. Vui lòng thử lại.');
      }
    }
  };

  const handleChildDelete = async (childId: number) => {
    if (confirm('Bạn có chắc muốn xóa reply này?')) {
      try {
        await onDeleteReply(comment.id, childId);
      } catch (error) {
        console.error('Error deleting reply:', error);
        alert('Không thể xóa reply. Vui lòng thử lại.');
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

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
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
            {currentUserId && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Trả lời
              </button>
            )}
            
            {/* Reply count with icon */}
            {(comment.childComments?.length > 0 || comment.childCommentsCount > 0) && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="flex items-center gap-1 text-gray-600 hover:text-gray-800 text-sm"
              >
                <MessageCircle size={16} />
                <span>{comment.childComments?.length || comment.childCommentsCount || 0}</span>
              </button>
            )}
          </div>
          
          {/* Reply Form for parent comment */}
          {showReplyForm && currentUserId && currentUser && (
            <div className="mt-3 ml-0">
              <div className="flex items-start space-x-2">
                <img
                  src={currentUser.avatarUrl || '/default-avatar.png'}
                  alt={currentUser.username}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-1">
                  <ReplyForm
                    onSubmit={handleReply}
                    onCancel={() => setShowReplyForm(false)}
                    placeholder={`Trả lời ${comment.commenter.username}...`}
                    size="small"
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Child Comments */}
          {showReplies && comment.childComments && comment.childComments.length > 0 && (
            <div className="mt-4 space-y-3">
              {comment.childComments.map((childComment) => {
                const commenter = childComment.commentUser ?? (childComment as any).commenter ?? { 
                  id: 0, 
                  username: 'Người dùng', 
                  avatarUrl: '/default-avatar.png' 
                };
                const repliedTo = childComment.replyToUser;

                return (
                  <div key={childComment.id} className="child-comment-item ml-8">
                    <div className="flex items-start space-x-2">
                      <img
                        src={commenter.avatarUrl || '/default-avatar.png'}
                        alt={commenter.username}
                        className="w-8 h-8 rounded-full object-cover"
                      />

                      <div className="flex-1">
                        <div className="flex items-center space-x-2 flex-wrap">
                          <span className="font-medium text-gray-900 text-sm">
                            {commenter.username}
                          </span>

                          {repliedTo && (
                            <>
                              <span className="text-gray-500 text-sm">→</span>
                              <span className="font-medium text-blue-600 text-sm">
                                {repliedTo.username}
                              </span>
                            </>
                          )}

                          <span className="text-xs text-gray-500">
                            {formatShortDate(childComment.createAt)}
                          </span>

                          {currentUserId === commenter.id && (
                            <button 
                              onClick={() => handleChildDelete(childComment.id)} 
                              className="text-red-500 hover:text-red-700 text-xs"
                            >
                              Xóa
                            </button>
                          )}
                        </div>

                        <p className="mt-1 text-sm text-gray-700">{childComment.content}</p>

                        {/* Reply button for child comments */}
                        {currentUserId && (
                          <div className="mt-2">
                            {replyingToChildId === childComment.id ? (
                              <div className="flex items-start space-x-2">
                                <img
                                  src={currentUser?.avatarUrl || '/default-avatar.png'}
                                  alt={currentUser?.username || 'User'}
                                  className="w-7 h-7 rounded-full object-cover"
                                />
                                <div className="flex-1">
                                  <ReplyForm
                                    onSubmit={(content) => handleChildReply(commenter.id, content)}
                                    onCancel={() => setReplyingToChildId(null)}
                                    placeholder={`Trả lời ${commenter.username}...`}
                                    size="small"
                                  />
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => setReplyingToChildId(childComment.id)}
                                className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                              >
                                Trả lời
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};