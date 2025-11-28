import React, { useEffect, useState } from 'react';
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineLoading3Quarters } from 'react-icons/ai';
import { BiRefresh, BiChevronLeft, BiChevronRight } from 'react-icons/bi';
import Toast from '../../../components/Toast/Toast';
import type { components } from '../../../types/api';

// ✅ Enum lấy trực tiếp từ BE (Swagger)
type EBlogPostStatus = components['schemas']['EBlogPostStatus'];

// ✅ Kiểu dữ liệu bài viết đồng bộ BE
interface BlogPost {
  id: number;
  title: string;
  status: EBlogPostStatus;
  createdAt: string;
  thumbnailUrl?: string | null;
  upVotes?: number | null;
  downVotes?: number | null;
}

type StatusFilter = 'ALL' | EBlogPostStatus;

const ITEMS_PER_PAGE = 10;

const PostListPage = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('ALL');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // ✅ Load danh sách bài viết
  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://localhost:8080/blog-posts');
      if (!response.ok) throw new Error('Lỗi khi tải dữ liệu');

      const data = await response.json();
      const postsArray = Array.isArray(data) ? data : data.data || [];
      setPosts(postsArray);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Ẩn bài viết
  const handleHide = async (postId: number) => {
    try {
      setActionLoading(postId);

      const response = await fetch(`http://localhost:8080/blog-posts/${postId}/hide`, {
        method: 'PATCH',
      });

      if (!response.ok) throw new Error('Lỗi khi ẩn bài viết');

      setPosts(prev =>
        prev.map(post => (post.id === postId ? { ...post, status: 'HIDDEN' } : post)),
      );

      setMessage({ type: 'success', text: 'Ẩn bài viết thành công!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(null);
    }
  };

  // ✅ Phục hồi bài viết
  const handleRestore = async (postId: number) => {
    try {
      setActionLoading(postId);

      const response = await fetch(`http://localhost:8080/blog-posts/${postId}/restore`, {
        method: 'PATCH',
      });

      if (!response.ok) throw new Error('Lỗi khi phục hồi bài viết');

      setPosts(prev =>
        prev.map(post => (post.id === postId ? { ...post, status: 'ACTIVE' } : post)),
      );

      setMessage({ type: 'success', text: 'Phục hồi bài viết thành công!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    fetchPosts();
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus]);

  // ✅ Lọc bài viết
  const filteredPosts = posts.filter(post => {
    if (filterStatus === 'ALL') return true;
    return post.status === filterStatus;
  });

  // ✅ Phân trang
  const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

  // ✅ Màu trạng thái
  const getStatusColor = (status: EBlogPostStatus) => {
    switch (status) {
      case 'ACTIVE':
        return { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-700', badge: 'bg-emerald-100' };
      case 'HIDDEN':
        return { bg: 'bg-slate-50', border: 'border-slate-300', text: 'text-slate-700', badge: 'bg-slate-100' };
      case 'DRAFT':
        return { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700', badge: 'bg-amber-100' };
    }
  };

  const getStatusIcon = (status: EBlogPostStatus) => {
    switch (status) {
      case 'ACTIVE': return '✓';
      case 'HIDDEN': return '👁️';
      case 'DRAFT': return '✎';
    }
  };

  // ✅ Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-t from-pink-100 to-white">
        <div className="text-center">
          <AiOutlineLoading3Quarters size={50} className="animate-spin text-pink-500" />
          <p className="mt-4 text-gray-600 font-medium">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  // ✅ Error
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-t from-pink-100 to-white">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg border-2 border-pink-100">
          <p className="text-2xl mb-2">⚠️</p>
          <p className="text-red-600 font-semibold mb-4">{error}</p>
          <button
            onClick={fetchPosts}
            className="px-6 py-2 text-white rounded-lg transition hover:opacity-90 bg-pink-500"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-6 bg-gradient-to-t from-pink-50 via-white to-white min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-4xl font-bold text-rose-900">📚 Quản lý Bài Đăng</h1>
            <p className="text-gray-500 mt-2">Quản lý, lọc và kiểm soát các bài viết blog của bạn</p>
          </div>
          <button
            onClick={fetchPosts}
            className="flex items-center gap-2 px-6 py-3 text-white rounded-full font-semibold transition hover:shadow-lg hover:scale-105 bg-pink-500"
          >
            <BiRefresh size={20} /> Làm mới
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {['ALL', 'ACTIVE', 'HIDDEN'].map(status => {
            const count = status === 'ALL' 
              ? posts.length 
              : posts.filter(p => p.status === status).length;
            const colors = status === 'ALL' ? 
              { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' } :
              status === 'ACTIVE' ?
              { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' } :
              { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };
            
            return (
              <div
                key={status}
                className={`${colors.bg} border-2 ${colors.border} rounded-xl p-4 text-center`}
              >
                <p className={`${colors.text} text-sm font-medium uppercase tracking-wide`}>{status === 'ALL' ? 'Tất cả' : status}</p>
                <p className={`${colors.text} text-3xl font-bold mt-1`}>{count}</p>
              </div>
            );
          })}
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          {(['ALL', 'ACTIVE', 'HIDDEN', 'DRAFT'] as StatusFilter[]).map(status => {
            const isActive = filterStatus === status;
            return (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-5 py-2.5 rounded-full font-semibold transition whitespace-nowrap ${
                  isActive
                    ? 'text-white shadow-md bg-pink-500 border-2 border-pink-500'
                    : 'bg-white border-2 text-gray-700 hover:border-pink-300 border-gray-200'
                }`}
              >
                {status === 'ALL' ? 'Tất cả' : status === 'ACTIVE' ? 'Công khai' : status === 'HIDDEN' ? 'Ẩn' : 'Nháp'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      {paginatedPosts.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden border-2 border-pink-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-pink-100">
                <tr>
                  <th className="px-6 py-4 text-left font-bold text-rose-900">ID</th>
                  <th className="px-6 py-4 text-left font-bold text-rose-900">Tiêu đề</th>
                  <th className="px-6 py-4 text-left font-bold text-rose-900">Ngày tạo</th>
                  <th className="px-6 py-4 text-center font-bold text-rose-900">Trạng thái</th>
                  <th className="px-6 py-4 text-center font-bold text-rose-900">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedPosts.map((post) => {
                  const colors = getStatusColor(post.status);
                  return (
                    <tr key={post.id} className="hover:bg-pink-50 transition">
                      <td className="px-6 py-4 font-semibold text-gray-700">#{post.id}</td>
                      <td className="px-6 py-4">
                        <div className="line-clamp-2 font-medium text-gray-900">{post.title}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-xs uppercase tracking-wide ${colors?.badge}`} style={{ color: colors?.text }}>
                          {getStatusIcon(post.status)} {post.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {post.status === 'ACTIVE' ? (
                            <button
                              onClick={() => handleHide(post.id)}
                              disabled={actionLoading === post.id}
                              className="p-2.5 bg-amber-50 rounded-lg border-2 border-amber-200 text-amber-600 hover:bg-amber-100 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                              title="Ẩn bài viết"
                            >
                              {actionLoading === post.id ? (
                                <AiOutlineLoading3Quarters className="animate-spin" size={18} />
                              ) : (
                                <AiOutlineEyeInvisible size={18} />
                              )}
                            </button>
                          ) : post.status === 'HIDDEN' ? (
                            <button
                              onClick={() => handleRestore(post.id)}
                              disabled={actionLoading === post.id}
                              className="p-2.5 bg-emerald-50 rounded-lg border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-100 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                              title="Phục hồi bài viết"
                            >
                              {actionLoading === post.id ? (
                                <AiOutlineLoading3Quarters className="animate-spin" size={18} />
                              ) : (
                                <AiOutlineEye size={18} />
                              )}
                            </button>
                          ) : (
                            <span className="px-3 py-2 text-gray-400 text-sm">Không thể hành động</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border-2 border-pink-200">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-gray-600 font-semibold">Không có bài viết nào</p>
          <p className="text-gray-400 mt-2">
            {filterStatus !== 'ALL' ? `với trạng thái "${filterStatus}"` : 'Hãy tạo bài viết đầu tiên của bạn'}
          </p>
        </div>
      )}

      {/* Footer Info & Pagination */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            Hiển thị <span className="font-bold text-pink-500">
              {paginatedPosts.length > 0 ? startIndex + 1 : 0}-{Math.min(endIndex, filteredPosts.length)}
            </span> trên <span className="font-bold text-pink-500">{filteredPosts.length}</span> bài viết
          </p>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 flex-wrap">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2.5 rounded-lg border-2 border-pink-200 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <BiChevronLeft size={20} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
              const isVisible = page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
              if (!isVisible && page !== 2 && page !== totalPages - 1) return null;
              if (!isVisible && (page === 2 || page === totalPages - 1)) return <span key={`dots-${page}`} className="px-2">...</span>;

              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    currentPage === page
                      ? 'text-white shadow-md bg-pink-500 border-2 border-pink-500'
                      : 'bg-white border-2 text-gray-700 hover:bg-pink-50 border-pink-200'
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2.5 rounded-lg border-2 border-pink-200 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <BiChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Toast */}
      {message && <Toast type={message.type} message={message.text} onClose={() => setMessage(null)} />}
    </div>
  );
};

export default PostListPage;
