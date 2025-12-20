import React, { useState } from 'react';

interface ReplyFormProps {
  onSubmit: (content: string) => Promise<void>;
  onCancel: () => void;
  placeholder?: string;
  size?: 'normal' | 'small';
}

export const ReplyForm: React.FC<ReplyFormProps> = ({
  onSubmit,
  onCancel,
  placeholder = 'Viết phản hồi...',
  size = 'normal'
}) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      await onSubmit(content.trim());
      setContent('');
    } catch (error) {
      console.error('Error submitting reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const textareaClass = size === 'small' 
    ? 'w-full p-2 text-sm border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
    : 'w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500';

  return (
    <form onSubmit={handleSubmit} className="reply-form">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        className={textareaClass}
        rows={size === 'small' ? 2 : 3}
        disabled={isSubmitting}
      />
      
      <div className="flex justify-end space-x-2 mt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
          disabled={isSubmitting}
        >
          Hủy
        </button>
        
        <button
          type="submit"
          disabled={!content.trim() || isSubmitting}
          className="px-4 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Đang gửi...' : 'Gửi'}
        </button>
      </div>
    </form>
  );
};