import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchAPI } from '../../services/search.service';
import type { SearchResultItem } from '../../services/search.service';

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

  // Hàm render giao diện từng item tùy theo loại
  const renderItem = (item: SearchResultItem) => {
    // Giao diện cho User
    if (type === 'user') {
      return (
        <div className="flex items-center gap-4 p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition">
          <img src={item.avatarUrl || 'https://via.placeholder.com/50'} alt={item.username} className="w-12 h-12 rounded-full object-cover" />
          <div>
            <h3 className="font-bold text-lg">{item.username}</h3>
            {/* Link đến trang cá nhân */}
            <Link to={`/profile/${item.id}`} className="text-blue-500 text-sm hover:underline">Xem trang cá nhân</Link>
          </div>
        </div>
      );
    }

    // Giao diện cho Post (hoặc tìm theo hashtag cũng trả về post)
    if (type === 'post' || type === 'hashtag') {
      return (
        <div className="flex gap-4 p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition">
          {item.thumbnailUrl && (
            <img src={item.thumbnailUrl} alt={item.title} className="w-32 h-24 object-cover rounded-md" />
          )}
          <div className="flex-1">
             {/* Link đến chi tiết bài viết */}
            <Link to={`/post/${item.id}`}>
              <h3 className="font-bold text-xl mb-2 hover:text-blue-600">{item.title}</h3>
            </Link>
            <div className="flex items-center text-sm text-gray-500 gap-2">
               <span>Tác giả: {item.username || 'Ẩn danh'}</span>
               <span>•</span>
               <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      );
    }

    // Giao diện cho Community
    if (type === 'community') {
      return (
        <div className="p-4 bg-white border rounded-lg shadow-sm">
           <h3 className="font-bold text-lg">Cộng đồng: {item.name}</h3>
           <Link to={`/community/${item.id}`} className="text-blue-500 text-sm">Tham gia ngay</Link>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Kết quả tìm kiếm cho: <span className="text-blue-600">"{q}"</span>
          <span className="text-sm font-normal text-gray-500 ml-2">
            (Loại: {type === 'post' ? 'Bài viết' : type === 'user' ? 'Người dùng' : type === 'community' ? 'Cộng đồng' : 'Hashtag'})
          </span>
        </h1>

        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : (
          <div className="space-y-4">
            {results.length > 0 ? (
              results.map((item) => (
                <div key={item.id}>{renderItem(item)}</div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-500 bg-white rounded-lg">
                Không tìm thấy kết quả nào.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};