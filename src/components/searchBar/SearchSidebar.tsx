import React, { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { searchAPI } from '../../services/search.service';
import type { SearchResultItem } from '../../services/search.service';
import Card from '../../components/card/Card'; // Tái sử dụng Card của bạn
import type { IPostResponseDto } from '../../types/post';
import { Link } from 'react-router-dom';

interface SearchSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  keyword: string;
}

export const SearchSidebar: React.FC<SearchSidebarProps> = ({
  isOpen,
  onClose,
  keyword,
}) => {
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!keyword || !isOpen) return;
      
      setLoading(true);
      try {
        // Mặc định tìm tất cả (không truyền type hoặc type='')
        const data = await searchAPI.search(keyword, ''); 
        setResults(data);
      } catch (error) {
        console.error('Quick search error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [keyword, isOpen]);

  // Hàm convert dữ liệu search sang Post để hiển thị Card (giống SearchResultsPage)
  const convertToPost = (item: SearchResultItem): IPostResponseDto => ({
    id: Number(item.id),
    title: item.title || '',
    shortDescription: '',
    thumbnailUrl: item.thumbnailUrl,
    isPublic: true,
    author: {
      id: item.author?.id || 0,
      username: item.author?.username || item.username || 'User',
      avatarUrl: item.author?.avatarUrl || item.avatarUrl || '/default-avatar.png',
    },
    status: 'ACTIVE',
    type: 'PERSONAL',
    hashtags: item.hashtags || [],
    createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
    upVotes: item.upVotes || 0,
    downVotes: item.downVotes || 0,
    totalComments: item.totalComments || 0,
    totalReacts: item.totalReacts || 0,
  });

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
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Kết quả tìm kiếm</h2>
            <p className="text-sm text-gray-500">Từ khóa: "{keyword}"</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="h-[calc(100vh-73px)] overflow-y-auto p-4 bg-gray-100">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-blue-500" />
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-4">
              {results.map((item) => (
                <div key={item.id}>
                   {/* Logic render đơn giản: Nếu có title là bài viết, không thì hiển thị User dạng rút gọn */}
                   {item.title ? (
                     <Card post={convertToPost(item)} />
                   ) : (
                     <Link to={`/profile/${item.id}`} className="block p-3 bg-white rounded shadow hover:shadow-md">
                        <div className="flex items-center gap-3">
                          <img src={item.avatarUrl || '/default-avatar.png'} className="w-10 h-10 rounded-full"/>
                          <span className="font-semibold">@{item.username}</span>
                        </div>
                     </Link>
                   )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              Không tìm thấy kết quả nào.
            </div>
          )}
        </div>
      </div>
    </>
  );
};