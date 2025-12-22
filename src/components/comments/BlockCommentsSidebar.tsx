import React from 'react';
import { X } from 'lucide-react';
import { CommentsSection } from './CommentsSection';

interface BlockCommentsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  blockId: number;
  imageUrl?: string;
  currentUser?: {
    id: number;
    username: string;
    avatarUrl?: string;
  };
}

export const BlockCommentsSidebar: React.FC<BlockCommentsSidebarProps> = ({
  isOpen,
  onClose,
  blockId,
  imageUrl, // Biến này sẽ undefined nếu là Text Block
  currentUser,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 
          transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {/* [SỬA] Tiêu đề linh hoạt */}
          <h2 className="text-lg font-semibold text-gray-900">
            {imageUrl ? 'Bình luận về ảnh' : 'Thảo luận về nội dung'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Đóng"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Image Preview - Chỉ hiện nếu có imageUrl
        {imageUrl && (
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <img
              src={imageUrl}
              alt="Block preview"
              className="w-full h-40 object-contain rounded-lg"
            />
          </div>
        )} */}

        {/* Text Block Preview (Optional) - Nếu muốn hiện trích đoạn text */}
        {!imageUrl && (
          <div className="p-4 border-b border-gray-200 bg-gray-50 text-sm text-gray-500 italic">
            
          </div>
        )}

        {/* Comments Section */}
        <div 
          className="flex-1 overflow-y-auto p-4" 
          style={{ 
            height: imageUrl ? 'calc(100vh - 240px)' : 'calc(100vh - 120px)' 
          }}
        >
          <CommentsSection
            blockId={blockId}
            currentUser={currentUser}
          />
        </div>
      </div>
    </>
  );
};