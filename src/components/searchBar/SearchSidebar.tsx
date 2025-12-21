import React, { useEffect, useState, useRef } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { searchAPI } from '../../services/search.service';
import type { SearchResultItem } from '../../services/search.service';
import Card from '../../components/card/Card';
import type { IPostResponseDto } from '../../types/post';
import '../../styles/newsfeed/NewsfeedList.css';
import '../../styles/newsfeed/Card.css';

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
  // --- STATE ---
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const timeoutRef = useRef<number | null>(null);

  // --- HELPER FUNCTIONS ---
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return 'vừa xong';
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const convertToPost = (item: SearchResultItem): IPostResponseDto => ({
    id: Number(item.id),
    title: item.title || '',
    shortDescription: '',
    thumbnailUrl: item.thumbnailUrl,
    isPublic: true,
    author: {
      id: item.author?.id || 0,
      username: item.author?.username || item.username || 'Ẩn danh',
      avatarUrl: item.author?.avatarUrl || item.avatarUrl || 'https://via.placeholder.com/40',
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

  // --- LOGIC GỌI API ---
  const fetchData = async (pageNum: number, isNewSearch = false) => {
    if (!keyword) return;
    
    setLoading(true);
    try {
      const { items, hasMore: serverHasMore } = await searchAPI.search(keyword, '', pageNum, 10);

      const users = items.filter(i => i.type === 'USER');
      const communities = items.filter(i => i.type === 'COMMUNITY');
      const posts = items.filter(i => i.type === 'POST');

      if (isNewSearch || pageNum === 1) {
        setResults([...users, ...communities, ...posts]);
      } else {
        setResults((prev) => [...prev, ...posts]);
      }

      setHasMore(!!serverHasMore);

    } catch (error) {
      console.error('Sidebar search error:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- EFFECT 1: RESET & TÌM KIẾM MỚI (DEBOUNCE) ---
  useEffect(() => {
    if (!isOpen) return;

    setResults([]);
    setPage(1);
    setHasMore(true);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (keyword) {
      timeoutRef.current = setTimeout(() => {
        fetchData(1, true);
      }, 300);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [keyword, isOpen]);

  // --- EFFECT 2: TẢI THÊM KHI PAGE TĂNG ---
  useEffect(() => {
    if (page > 1) {
      fetchData(page, false);
    }
  }, [page]);

  // --- SỰ KIỆN CUỘN (INFINITE SCROLL) ---
  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    
    if (loading || !hasMore) return;

    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 50) {
      setPage((prev) => prev + 1);
    }
  };

  // --- RENDER CARD COMPONENTS ---
  const renderUserCard = (item: SearchResultItem) => (
    <Link to={`/profile/${item.id}`} className="block" onClick={onClose}>
      <article className="newsfeed-card hover:shadow-lg transition-shadow cursor-pointer">
        {item.avatarUrl && (
          <div className="newsfeed-card__thumbnail">
            <img
              src={item.avatarUrl}
              alt={item.username}
              className="newsfeed-card__image"
              loading="lazy"
            />
          </div>
        )}
        <div className="newsfeed-card__right">
          <div className="newsfeed-card__content">
            <h2 className="newsfeed-card__title">{item.username}</h2>
            <div className="newsfeed-card__header">
              <div className="newsfeed-card__author">
                <img
                  src={item.avatarUrl || 'https://via.placeholder.com/40'}
                  alt={item.username}
                  className="newsfeed-card__avatar"
                />
                <div className="newsfeed-card__author-info">
                  <span className="newsfeed-card__username">@{item.username}</span>
                </div>
              </div>
            </div>
            <span className="text-blue-500 text-sm hover:underline mt-2">Xem trang cá nhân</span>
          </div>
        </div>
      </article>
    </Link>
  );

  const renderCommunityCard = (item: SearchResultItem) => (
    <Link to={`/community/${item.id}`} className="block" onClick={onClose}>
      <article className="newsfeed-card hover:shadow-lg transition-shadow cursor-pointer">
        {item.thumbnailUrl && (
          <div className="newsfeed-card__thumbnail">
            <img
              src={item.thumbnailUrl}
              alt={item.name}
              className="newsfeed-card__image"
              loading="lazy"
            />
          </div>
        )}
        <div className="newsfeed-card__right">
          <div className="newsfeed-card__content">
            <h2 className="newsfeed-card__title">{item.name}</h2>
            <div className="newsfeed-card__header">
              <div className="newsfeed-card__author">
                <img
                  src={item.thumbnailUrl || 'https://via.placeholder.com/40'}
                  alt={item.name}
                  className="newsfeed-card__avatar"
                />
                <div className="newsfeed-card__author-info">
                  <span className="newsfeed-card__username">Cộng đồng</span>
                  {item.createdAt && (
                    <time className="newsfeed-card__time">{formatDate(item.createdAt)}</time>
                  )}
                </div>
              </div>
            </div>
            {item.description && (
              <p className="text-gray-600 text-sm mt-2 line-clamp-2">{item.description}</p>
            )}
            <span className="text-blue-500 text-sm hover:underline mt-2">Tham gia ngay</span>
          </div>
        </div>
      </article>
    </Link>
  );

  const renderItem = (item: SearchResultItem) => {
    if (item.type === 'USER') {
      return renderUserCard(item);
    } else if (item.type === 'COMMUNITY') {
      return renderCommunityCard(item);
    } else {
      return <Card post={convertToPost(item)} />;
    }
  };

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

        {/* Content List */}
        <div 
          className="h-[calc(100vh-73px)] overflow-y-auto p-4 bg-gray-100"
          onScroll={onScroll}
        >
          {/* Loading lần đầu */}
          {loading && page === 1 && results.length === 0 ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-blue-500" />
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-4">
              {results.map((item, index) => {
                const uniqueKey = `${item.type}-${item.id}-${index}`;
                return (
                  <div key={uniqueKey}>
                    {renderItem(item)}
                  </div>
                );
              })}

              {/* Loader khi cuộn xuống dưới (Load More) */}
              {loading && page > 1 && (
                <div className="flex justify-center py-4">
                  <Loader2 className="animate-spin text-blue-500 w-6 h-6" />
                </div>
              )}

              {/* Thông báo hết dữ liệu */}
              {!hasMore && results.length > 0 && (
                <div className="text-center text-xs text-gray-400 py-4 italic">
                  Đã hiển thị hết kết quả
                </div>
              )}
            </div>
          ) : (
            // Không tìm thấy kết quả
            !loading && (
              <div className="text-center py-10 text-gray-500">
                <p>Không tìm thấy kết quả nào cho "{keyword}".</p>
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
};