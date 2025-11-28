import React, { useEffect, useState } from 'react';
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineLoading3Quarters } from 'react-icons/ai';
import { BiRefresh } from 'react-icons/bi';
import Toast from '../../../components/Toast/Toast';

// 1. Định nghĩa kiểu dữ liệu cho bài viết (khớp với Entity bên BE)
interface BlogPost {
  id: number;
  title: string;
  status: 'ACTIVE' | 'HIDDEN' | 'DRAFT';
  createdAt: string;
  thumbnailUrl?: string;
  upVotes?: number;
  downVotes?: number;
}

type StatusFilter = 'ALL' | 'ACTIVE' | 'HIDDEN' | 'DRAFT';

const ITEMS_PER_PAGE = 10;

const PostListPage = () => {
  // State lưu danh sách bài viết
  const [posts, setPosts] = useState<BlogPost[]>([]);
  // State lưu trạng thái loading
  const [loading, setLoading] = useState<boolean>(true);
  // State lưu lỗi (nếu có)
  const [error, setError] = useState<string | null>(null);
  // State để lọc theo trạng thái
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('ALL');
  // State lưu loading khi thực hiện action
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  // State lưu message thành công/lỗi
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  // State để lưu trang hiện tại
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Hàm đóng toast
  const closeToast = () => setMessage(null);

  // 2. Hàm gọi API tải danh sách bài viết
  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:8080/blog-posts');
      
      if (!response.ok) {
        throw new Error('Lỗi khi tải dữ liệu');
      }

      const data = await response.json();
      // Handle both array and object response
      const postsArray = Array.isArray(data) ? data : data.data || [];
      setPosts(postsArray);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. Hàm Hide bài viết
  const handleHide = async (postId: number) => {
    try {
      setActionLoading(postId);
      const response = await fetch(`http://localhost:8080/blog-posts/${postId}/hide`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Lỗi khi ẩn bài viết');
      }

      // Cập nhật state local thay vì reload
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId ? { ...post, status: 'HIDDEN' as const } : post
        )
      );

      setMessage({ type: 'success', text: 'Ẩn bài viết thành công!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(null);
    }
  };

  // 4. Hàm Restore (phục hồi) bài viết
  const handleRestore = async (postId: number) => {
    try {
      setActionLoading(postId);
      const response = await fetch(`http://localhost:8080/blog-posts/${postId}/restore`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Lỗi khi phục hồi bài viết');
      }

      // Cập nhật state local thay vì reload
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId ? { ...post, status: 'ACTIVE' as const } : post
        )
      );

      setMessage({ type: 'success', text: 'Phục hồi bài viết thành công!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(null);
    }
  };

  // Chạy hàm fetchPosts 1 lần duy nhất khi component được mount
  useEffect(() => {
    fetchPosts();
    setCurrentPage(1); // Reset về trang 1 khi fetch lại
  }, []);

  // Reset trang khi thay đổi filter
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus]);

  // 5. Hàm lọc danh sách bài viết theo trạng thái
  const filteredPosts = posts.filter(post => {
    if (filterStatus === 'ALL') return true;
    return post.status === filterStatus;
  });

  // 5a. Tính toán phân trang
  const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

  // 6. Hàm tô màu cho Status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border border-green-300';
      case 'HIDDEN':
        return 'bg-gray-100 text-gray-800 border border-gray-300';
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      default:
        return 'bg-blue-100 text-blue-800 border border-blue-300';
    }
  };

  // --- PHẦN GIAO DIỆN (RENDER) ---
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <AiOutlineLoading3Quarters size={40} className="text-blue-600 mx-auto" />
          </div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 inline-block">
          <p className="text-red-700 font-semibold">⚠️ Lỗi: {error}</p>
          <button
            onClick={fetchPosts}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý Bài Đăng</h1>
            <p className="text-gray-500 mt-1">Quản lý và kiểm soát các bài viết blog</p>
          </div>
          <button
            onClick={fetchPosts}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md hover:shadow-lg"
          >
            <BiRefresh size={18} />
            Làm mới
          </button>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-3">
          {(['ALL', 'ACTIVE', 'HIDDEN', 'DRAFT'] as StatusFilter[]).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === status
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-400 hover:bg-blue-50'
              }`}
            >
              {status === 'ALL' ? 'Tất cả' : status}
              <span className="ml-2 text-sm">
                ({posts.filter(p => status === 'ALL' || p.status === status).length})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
        {filteredPosts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Tiêu đề</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Ngày tạo</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Tương tác</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-blue-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-600">#{post.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                        {post.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(post.createdAt).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(post.status)}`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex gap-4">
                        <span className="text-green-600 font-medium">👍 {post.upVotes || 0}</span>
                        <span className="text-red-600 font-medium">👎 {post.downVotes || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-3">
                        {post.status === 'ACTIVE' ? (
                          <button
                            onClick={() => handleHide(post.id)}
                            disabled={actionLoading === post.id}
                            className="flex items-center gap-1 px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoading === post.id ? (
                              <AiOutlineLoading3Quarters className="animate-spin" />
                            ) : (
                              <AiOutlineEyeInvisible size={16} />
                            )}
                            Ẩn
                          </button>
                        ) : post.status === 'HIDDEN' ? (
                          <button
                            onClick={() => handleRestore(post.id)}
                            disabled={actionLoading === post.id}
                            className="flex items-center gap-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoading === post.id ? (
                              <AiOutlineLoading3Quarters className="animate-spin" />
                            ) : (
                              <AiOutlineEye size={16} />
                            )}
                            Phục hồi
                          </button>
                        ) : (
                          <span className="text-gray-500 text-sm">-</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-16 text-center">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-500 text-lg font-medium">
              Không có bài viết nào {filterStatus !== 'ALL' ? `với trạng thái "${filterStatus}"` : ''}
            </p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-6 flex justify-between items-center text-sm text-gray-600">
        <p>Tổng cộng: <span className="font-semibold text-gray-900">{filteredPosts.length}</span> bài viết</p>
        <p className="text-gray-400">Cập nhật lần cuối: {new Date().toLocaleTimeString('vi-VN')}</p>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Hiển thị <span className="font-semibold">{startIndex + 1}</span> đến <span className="font-semibold">{Math.min(endIndex, filteredPosts.length)}</span> trên <span className="font-semibold">{filteredPosts.length}</span> kết quả
          </div>
          <div className="flex gap-2">
            {/* Nút Previous */}
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium text-sm"
            >
              ← Trước
            </button>

            {/* Các nút trang */}
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Hiển thị tối đa 7 nút trang
                const isVisible = 
                  page === 1 || 
                  page === totalPages || 
                  (page >= currentPage - 2 && page <= currentPage + 2);

                if (!isVisible && (page === 2 || page === totalPages - 1)) {
                  return <span key={`dots-${page}`} className="px-2 py-2">...</span>;
                }

                if (!isVisible) return null;

                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 rounded-lg font-medium text-sm transition ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-blue-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            {/* Nút Next */}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium text-sm"
            >
              Tiếp →
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {message && (
        <Toast
          type={message.type}
          message={message.text}
          onClose={() => setMessage(null)}
        />
      )}
    </div>
  );
};

export default PostListPage;