import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchAPI } from '../../services/search.service';
import type { SearchResultItem } from '../../services/search.service';
import { Loader2 } from 'lucide-react';
import Masonry from 'react-masonry-css';
import Card from '../../components/card/Card';
import type { IPostResponseDto } from '../../types/post';
import '../../styles/newsfeed/NewsfeedList.css';
import '../../styles/newsfeed/Card.css';

export const SearchResultPage = () => {
  const [searchParams] = useSearchParams();
  
  // Lấy params từ URL
  const q = searchParams.get('q');
  const type = searchParams.get('type');

  // --- STATE QUẢN LÝ DỮ LIỆU VÀ PHÂN TRANG ---
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Ref cho Sentinel (Mắt thần cuộn trang)
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // --- HÀM GỌI API ---
  const fetchPage = useCallback(async (pageNum: number, isNewSearch = false) => {
    if (!q) return;
    
    setLoading(true);
    try {
      // Gọi API với page và limit=10
      const { items, hasMore: serverHasMore } = await searchAPI.search(q, type || '', pageNum, 10);

      // searchAPI already returns the right subset depending on `type` param
      const newItems = items || [];

      setHasMore(!!serverHasMore);
      
      if (isNewSearch) {
        setResults(newItems);
      } else {
        // Nối thêm dữ liệu vào danh sách cũ
        setResults((prev) => [...prev, ...newItems]);
      }
    } catch (error) {
      console.error('Search page error:', error);
    } finally {
      setLoading(false);
    }
  }, [q, type]);

  // --- EFFECT 1: KHI TỪ KHÓA HOẶC LOẠI THAY ĐỔI (RESET) ---
  useEffect(() => {
    if (!q) return;
    setPage(1);
    setResults([]);
    setHasMore(true);
    // Gọi ngay trang 1
    fetchPage(1, true);
  }, [q, type, fetchPage]);

  // --- EFFECT 2: KHI PAGE TĂNG LÊN (LOAD MORE) ---
  useEffect(() => {
    if (page > 1) {
      fetchPage(page, false);
    }
  }, [page, fetchPage]);

  // --- EFFECT 3: INFINITE SCROLL (INTERSECTION OBSERVER) ---
  useEffect(() => {
    const currentSentinel = sentinelRef.current;
    if (!currentSentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Nếu thấy sentinel VÀ không đang load VÀ còn dữ liệu
        if (entries[0].isIntersecting && !loading && hasMore) {
          setPage((prev) => prev + 1);
        }
      },
      { rootMargin: '100px' } // Load trước khi cuộn tới đáy 100px
    );

    observer.observe(currentSentinel);

    return () => {
      if (currentSentinel) observer.unobserve(currentSentinel);
    };
  }, [loading, hasMore]);

  // --- HELPER FUNCTIONS (FORMAT DATE, CONVERT DTO) ---
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

  const breakpointCols = {
    default: 1,
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
    status: 'ACTIVE' as const,
    type: 'PERSONAL' as const,
    hashtags: item.hashtags || [],
    createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
    upVotes: item.upVotes || 0,
    downVotes: item.downVotes || 0,
    totalComments: item.totalComments || 0,
    totalReacts: item.totalReacts || 0,
  });

  // --- RENDER CARD COMPONENTS ---
  const renderUserCard = (item: SearchResultItem) => (
    <Link to={`/profile/${item.id}`} className="block">
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
    <Link to={`/community/${item.id}`} className="block">
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

  // Router chọn loại Card
  const renderItem = (item: SearchResultItem) => {
    switch (type) {
      case 'user':
        return renderUserCard(item);
      case 'community':
        return renderCommunityCard(item);
      case 'hashtag':
      case 'post':
      default:
        return <Card post={convertToPost(item)} />;
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'post': return 'Bài viết';
      case 'user': return 'Người dùng';
      case 'community': return 'Cộng đồng';
      case 'hashtag': return 'Hashtag';
      default: return type;
    }
  };

  // Loading lần đầu tiên (khi chưa có dữ liệu nào)
  if (loading && page === 1 && results.length === 0) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto px-[90px] py-8">
      <h1 className="text-3xl text-[#F295B6] font-bold mb-8">
        Kết quả tìm kiếm cho "{q}"
        <span className="text-lg font-normal text-gray-500 ml-3">
          ({getTypeLabel()})
        </span>
      </h1>

      {results.length > 0 ? (
        <div className="newsfeed-list-wrapper">
          <Masonry
            breakpointCols={breakpointCols}
            className="newsfeed-masonry-grid"
            columnClassName="newsfeed-masonry-grid_column"
          >
            {results.map((item) => (
              // Kết hợp type + id làm key để tránh trùng lặp
              <div key={`${type}-${item.id}`} className="newsfeed-masonry-item">
                {renderItem(item)}
              </div>
            ))}
          </Masonry>

          {/* --- SENTINEL (MẮT THẦN) --- */}
          {/* Đặt ở cuối danh sách để kích hoạt load more */}
          <div ref={sentinelRef} className="h-4 w-full" />

          {/* Loader khi đang tải trang tiếp theo */}
          {loading && page > 1 && (
            <div className="flex justify-center py-6">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          )}

          {/* Thông báo hết dữ liệu */}
          {!hasMore && (
            <div className="text-center py-10 text-gray-400 italic">
              Đã hiển thị hết kết quả.
            </div>
          )}
        </div>
      ) : (
        // Không tìm thấy kết quả nào
        !loading && (
          <div className="text-center py-20 text-gray-500">
            <p className="text-xl">Không tìm thấy kết quả nào.</p>
            <p className="mt-2">Thử tìm kiếm với từ khóa khác</p>
          </div>
        )
      )}
    </div>
  );
};