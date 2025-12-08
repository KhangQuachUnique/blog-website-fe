import { useEffect, useState } from "react";
import { BiRefresh, BiChevronLeft, BiChevronRight } from "react-icons/bi";

import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useGetAllPosts } from "../../../hooks/usePost";
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from "../../../contexts/toast";
import PostsTable from "../../../components/PostsTable/PostsTable";
import type { BlogPost, EBlogPostStatus } from "../../../types/post";

type StatusFilter = "ALL" | EBlogPostStatus;

const ITEMS_PER_PAGE = 10;

const PostListPage = () => {
  const { 
    data: posts = [], 
    isLoading, 
    isFetching, 
    isError, 
    refetch 
  } = useGetAllPosts();
  
  const queryClient = useQueryClient();

  const { showToast } = useToast();
  const [filterStatus, setFilterStatus] = useState<StatusFilter>("ALL");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const handleHide = async (postId: number) => {
    try {
      setActionLoading(postId);

      const response = await fetch(`http://localhost:8080/blog-posts/${postId}/hide`, {
        method: 'PATCH',
      });

      if (!response.ok) throw new Error('Lỗi khi ẩn bài viết');

      // Update react-query cache locally to avoid a full refetch/refresh UI
      queryClient.setQueryData(['posts'], (old: any) => {
        if (!Array.isArray(old)) return old;
        return old.map((p: any) => (p.id === postId ? { ...p, status: 'HIDDEN' } : p));
      });

      showToast({ type: 'success', message: 'Ẩn bài viết thành công!' });
    } catch (err: any) {
      showToast({ type: "error", message: err.message });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestore = async (postId: number) => {
    try {
      setActionLoading(postId);

      const response = await fetch(`http://localhost:8080/blog-posts/${postId}/restore`, {
        method: 'PATCH',
      });

      if (!response.ok) throw new Error('Lỗi khi phục hồi bài viết');

      // Update react-query cache locally to avoid a full refetch/refresh UI
      queryClient.setQueryData(['posts'], (old: any) => {
        if (!Array.isArray(old)) return old;
        return old.map((p: any) => (p.id === postId ? { ...p, status: 'ACTIVE' } : p));
      });

      showToast({ type: 'success', message: 'Phục hồi bài viết thành công!' });
    } catch (err: any) {
      showToast({ type: "error", message: err.message });
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus]);

  // Lọc bài viết
  const filteredPosts = Array.isArray(posts)
    ? posts.filter((post) => {
        if (filterStatus === "ALL") return true;
        return post.status === filterStatus;
      })
    : [];

  // Phân trang
  const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

  // Chuẩn hoá dữ liệu trả về cho PostsTable (convert createdAt -> string)
  const normalizedPosts: BlogPost[] = paginatedPosts.map((p: any) => ({
    id: p.id,
    title: p.title,
    status: p.status,
    createdAt: typeof p.createdAt === 'string' ? p.createdAt : new Date(p.createdAt).toISOString(),
    thumbnailUrl: p.thumbnailUrl ?? null,
    upVotes: p.upVotes ?? null,
    downVotes: p.downVotes ?? null,
  }));

  // Loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-linear-to-t from-pink-100 to-white">
        <div className="text-center flex flex-col items-center gap-4">
          <AiOutlineLoading3Quarters
            size={50}
            className="animate-spin text-pink-500"
          />
          <p className="text-gray-600 font-medium">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  // Error
  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen bg-linear-to-t from-pink-100 to-white">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg border-2 border-pink-100">
          <p className="text-2xl mb-2">⚠️</p>
          <p className="text-red-600 font-semibold mb-4"> Có lỗi xảy ra khi tải dữ liệu </p>
          <button
            onClick={() => refetch()}
            className="px-6 py-2 text-white rounded-lg transition hover:opacity-90 bg-pink-500"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-6 bg-linear-to-t from-pink-50 via-white to-white min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-4xl font-bold text-rose-900">
              📚 Quản lý Bài Đăng
            </h1>
            <p className="text-gray-500 mt-2">
              Quản lý, lọc và kiểm soát các bài viết blog của bạn
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className={`flex items-center gap-2 px-6 py-3 text-white rounded-full font-semibold transition
                        hover:shadow-lg hover:scale-105
                      bg-[#e96996] hover:bg-[#F295B6]
            `}
          >
            <BiRefresh
              size={20}
              className={isFetching ? "animate-spin" : ""}
            />
            {isFetching ? "Đang tải..." : "Làm mới"}
          </button>

        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {["ALL", "ACTIVE", "HIDDEN"].map((status) => {
            const count =
              status === "ALL"
                ? posts.length
                : posts.filter((p) => p.status === status).length;
            const colors =
              status === "ALL"
                ? {
                    bg: "bg-blue-50",
                    text: "text-blue-700",
                    border: "border-blue-200",
                  }
                : status === "ACTIVE"
                ? {
                    bg: "bg-emerald-50",
                    text: "text-emerald-700",
                    border: "border-emerald-200",
                  }
                : {
                    bg: "bg-slate-50",
                    text: "text-slate-700",
                    border: "border-slate-200",
                  };

            return (
              <div
                key={status}
                className={`${colors.bg} border-2 ${colors.border} rounded-xl p-4 text-center`}
              >
                <p
                  className={`${colors.text} text-sm font-medium uppercase tracking-wide`}
                >
                  {status === "ALL" ? "Tất cả" : status}
                </p>
                <p className={`${colors.text} text-3xl font-bold mt-1`}>
                  {count}
                </p>
              </div>
            );
          })}
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          {(["ALL", "ACTIVE", "HIDDEN"] as StatusFilter[]).map((status) => {
            const isActive = filterStatus === status;
            return (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-5 py-2.5 rounded-full font-semibold transition whitespace-nowrap ${
                  isActive
                    ? "text-white shadow-md bg-[#e96996] border-2 border-pink-500"
                    : "bg-white border-2 text-gray-700 hover:border-pink-300 border-gray-200"
                }`}
              >
                {status === "ALL"
                  ? "Tất cả"
                  : status === "ACTIVE"
                  ? "Công khai"
                  : status === "HIDDEN"
                  ? "Ẩn"
                  : ""}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table Component */}
      <PostsTable
        posts={normalizedPosts}
        onHide={handleHide}
        onRestore={handleRestore}
        loadingId={actionLoading}
        emptyMessage={
          filterStatus !== "ALL"
            ? `Không có bài viết nào với trạng thái "${filterStatus}"`
            : "Không có bài viết nào - Hãy tạo bài viết đầu tiên của bạn"
        }
      />

      {/* Footer Info & Pagination */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            Hiển thị{" "}
            <span className="font-bold text-pink-500">
              {paginatedPosts.length > 0 ? startIndex + 1 : 0}-
              {Math.min(endIndex, filteredPosts.length)}
            </span>{" "}
            trên{" "}
            <span className="font-bold text-pink-500">
              {filteredPosts.length}
            </span>{" "}
            bài viết
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

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              const isVisible =
                page === 1 ||
                page === totalPages ||
                Math.abs(page - currentPage) <= 1;
              if (!isVisible && page !== 2 && page !== totalPages - 1)
                return null;
              if (!isVisible && (page === 2 || page === totalPages - 1))
                return (
                  <span key={`dots-${page}`} className="px-2">
                    ...
                  </span>
                );

              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    currentPage === page
                      ? "text-white shadow-md bg-pink-500 border-2 border-pink-500"
                      : "bg-white border-2 text-gray-700 hover:bg-pink-50 border-pink-200"
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="p-2.5 rounded-lg border-2 border-pink-200 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <BiChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostListPage;
