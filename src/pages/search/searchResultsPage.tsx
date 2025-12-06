import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchAPI } from '../../services/search.service';
import type { SearchResultItem } from '../../services/search.service';
import { Loader2, ArrowUp, ArrowDown, MessageCircle, Heart } from 'lucide-react';
import Masonry from 'react-masonry-css';
import '../../styles/newsfeed/NewsfeedList.css';
import '../../styles/newsfeed/Card.css';

export const SearchResultPage = () => {
  const [searchParams] = useSearchParams();
  
  // Lấy params từ URL (ví dụ: /search?q=abc&type=post)
  const q = searchParams.get('q');
  const type = searchParams.get('type');

  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Gọi API mỗi khi 'q' hoặc 'type' thay đổi
  useEffect(() => {
    const fetchData = async () => {
      if (!q || !type) return;
      
      setLoading(true);
      try {
        const data = await searchAPI.search(q, type);
        setResults(data);
      } catch (error) {
        // Xử lý lỗi (ví dụ hiển thị toast)
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [q, type]);

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
    default: 3,
    1400: 4,
    992: 3,
    768: 2,
    0: 1,
  };

  // Render Post Card (giống Newsfeed)
  const renderPostCard = (item: SearchResultItem) => (
    <Link to={`/post/${item.id}`} className="block">
      <article className="newsfeed-card hover:shadow-lg transition-shadow cursor-pointer">
        {item.thumbnailUrl && (
          <div className="newsfeed-card__thumbnail">
            <img
              src={item.thumbnailUrl}
              alt={item.title}
              className="newsfeed-card__image"
              loading="lazy"
            />
          </div>
        )}
        <div className="newsfeed-card__content">
          <div className="newsfeed-card__header">
            <div className="newsfeed-card__author">
              <img
                src={item.author?.avatarUrl || item.avatarUrl || 'https://via.placeholder.com/40'}
                alt={item.author?.username || item.username || 'User'}
                className="newsfeed-card__avatar"
              />
              <div className="newsfeed-card__author-info">
                <span className="newsfeed-card__username">{item.author?.username || item.username || 'Ẩn danh'}</span>
              </div>
            </div>
            <time className="newsfeed-card__time">{formatDate(item.createdAt)}</time>
          </div>
          <h2 className="newsfeed-card__title">{item.title}</h2>
          {item.hashtags && item.hashtags.length > 0 && (
            <div className="newsfeed-card__hashtags">
              {item.hashtags.map((h) => (
                <span key={h.id || h.name} className="newsfeed-card__hashtag">#{h.name}</span>
              ))}
            </div>
          )}
          <div className="newsfeed-card__footer">
            <div className="newsfeed-card__stats">
              <div className="newsfeed-card__votes">
                <button className="newsfeed-card__vote-btn newsfeed-card__vote-btn--up">
                  <ArrowUp size={18} />
                  <span>{item.upVotes || 0}</span>
                </button>
                <button className="newsfeed-card__vote-btn newsfeed-card__vote-btn--down">
                  <ArrowDown size={18} />
                  <span>{item.downVotes || 0}</span>
                </button>
              </div>
              <div className="newsfeed-card__interactions">
                <div className="newsfeed-card__interaction">
                  <MessageCircle size={18} />
                  <span>{item.totalComments || 0}</span>
                </div>
                <div className="newsfeed-card__interaction">
                  <Heart size={18} />
                  <span>{item.totalReacts || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );

  // Render User Card
  const renderUserCard = (item: SearchResultItem) => (
    <Link to={`/profile/${item.id}`} className="block">
      <article className="newsfeed-card hover:shadow-lg transition-shadow cursor-pointer">
        <div className="newsfeed-card__content">
          <div className="flex items-center gap-4 p-2">
            <img
              src={item.avatarUrl || 'https://via.placeholder.com/60'}
              alt={item.username}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h2 className="newsfeed-card__title text-lg">{item.username}</h2>
              <span className="text-blue-500 text-sm hover:underline">Xem trang cá nhân</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );

  // Render Community Card
  const renderCommunityCard = (item: SearchResultItem) => (
    <Link to={`/community/${item.id}`} className="block">
      <article className="newsfeed-card hover:shadow-lg transition-shadow cursor-pointer">
        <div className="newsfeed-card__content">
          <div className="p-2">
            <h2 className="newsfeed-card__title">Cộng đồng: {item.name}</h2>
            <span className="text-blue-500 text-sm">Tham gia ngay</span>
          </div>
        </div>
      </article>
    </Link>
  );

  // Render Hashtag Card
  const renderHashtagCard = (item: SearchResultItem) => (
    <Link to={`/hashtag/${item.name}`} className="block">
      <article className="newsfeed-card hover:shadow-lg transition-shadow cursor-pointer">
        <div className="newsfeed-card__content">
          <div className="p-2">
            <h2 className="newsfeed-card__title flex items-center gap-2">
              <span className="text-2xl">#️⃣</span>
              <span className="text-blue-600">#{item.name}</span>
            </h2>
            <span className="text-blue-500 text-sm hover:underline">Xem các bài viết với hashtag này</span>
          </div>
        </div>
      </article>
    </Link>
  );

  // Chọn render function dựa trên type
  const renderItem = (item: SearchResultItem) => {
    switch (type) {
      case 'user':
        return renderUserCard(item);
      case 'community':
        return renderCommunityCard(item);
      case 'hashtag':
        return renderHashtagCard(item);
      case 'post':
      default:
        return renderPostCard(item);
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

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-12 w-12 animate-spin" />
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
              <div key={item.id} className="newsfeed-masonry-item">
                {renderItem(item)}
              </div>
            ))}
          </Masonry>
        </div>
      ) : (
        <div className="text-center py-20 text-gray-500">
          <p className="text-xl">Không tìm thấy kết quả nào.</p>
          <p className="mt-2">Thử tìm kiếm với từ khóa khác</p>
        </div>
      )}
    </div>
  );
};