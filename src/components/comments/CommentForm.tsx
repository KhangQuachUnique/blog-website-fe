import React, { useState } from 'react';

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  currentUser?: {
    id: number;
    username: string;
    avatarUrl?: string;
  };
  placeholder?: string;
}

export const CommentForm: React.FC<CommentFormProps> = ({
  onSubmit,
  currentUser,
  placeholder = 'Viết bình luận...'
}) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() || !currentUser) return;
    
    setIsSubmitting(true);
    
    try {
      await onSubmit(content.trim());
      setContent('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="comment-form bg-gray-50 p-4 rounded-lg text-center">
        <p className="text-gray-600">Đăng nhập để bình luận</p>
      </div>
    );
  }

  return (
    <div className="comment-form bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <img
          src={currentUser.avatarUrl || '/default-avatar.png'}
          alt={currentUser.username}
          className="w-10 h-10 rounded-full object-cover"
        />
        
        <div className="flex-1">
          <form onSubmit={handleSubmit}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={placeholder}
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              disabled={isSubmitting}
            />
            
            <div className="flex justify-between items-center mt-3">
              <span className="text-sm text-gray-500">
                Đang viết với tên {currentUser.username}
              </span>
              
              <button
                type="submit"
                disabled={!content.trim() || isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Đang đăng...' : 'Đăng bình luận'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};