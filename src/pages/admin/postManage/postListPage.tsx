import { useEffect, useState } from "react";
import { MdRefresh, MdAutorenew } from "react-icons/md";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";
import { FaBookmark } from "react-icons/fa";
import { useGetPostVisibleWithPagination } from "../../../hooks/usePost"; 
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "../../../contexts/toast";
import PostsTable from "../../../features/admin/postManage/PostsTable";
import type { BlogPost, EBlogPostStatus } from "../../../types/post";

type StatusFilter = "ALL" | EBlogPostStatus;

const ITEMS_PER_PAGE = 10;

const PostListPage = () => {
  const [filterStatus, setFilterStatus] = useState<StatusFilter>("ALL");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const {
    data: responseData, 
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetPostVisibleWithPagination(currentPage, ITEMS_PER_PAGE);

  const posts = responseData?.items || [];
  const meta = responseData?.meta || {
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    total: 0,
    totalPages: 1,  
  };

  const stats = responseData?.statistics || {
    all: 0,
    active: 0,
    hidden: 0
  };

  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const updateLocalCache = (postId: number, newStatus: string) => {
    queryClient.setQueryData(["posts", currentPage, ITEMS_PER_PAGE], (old: any) => {
       if (!old || !old.items) return old;

       const targetPost = old.items.find((p: any) => p.id === postId);

       if (!targetPost || targetPost.status === newStatus) return old;

       const newStats = { ...(old.statistics || { all: 0, active: 0, hidden: 0 }) };

       if (newStatus === "HIDDEN" && targetPost.status === "ACTIVE") {
          newStats.active = Math.max(0, newStats.active - 1);
          newStats.hidden += 1;
       } else if (newStatus === "ACTIVE" && targetPost.status === "HIDDEN") {
          newStats.active += 1;
          newStats.hidden = Math.max(0, newStats.hidden - 1);
       }

       return {
         ...old,
         statistics: newStats,
         items: old.items.map((p: any) => 
           p.id === postId ? { ...p, status: newStatus } : p
         )
       };
    });
  };

  const handleHide = async (postId: number) => {
    try {
      setActionLoading(postId);
      const response = await fetch(
        `http://localhost:8080/blog-posts/${postId}/hide`,
        { method: "PATCH" }
      );
      if (!response.ok) throw new Error("Lỗi khi ẩn bài viết");

      updateLocalCache(postId, "HIDDEN");

      showToast({ type: "success", message: "Ẩn bài viết thành công!" });
    } catch (err: any) {
      showToast({ type: "error", message: err.message });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestore = async (postId: number) => {
    try {
      setActionLoading(postId);
      const response = await fetch(
        `http://localhost:8080/blog-posts/${postId}/restore`,
        { method: "PATCH" }
      );
      if (!response.ok) throw new Error("Lỗi khi phục hồi bài viết");

      updateLocalCache(postId, "ACTIVE");

      showToast({ type: "success", message: "Phục hồi bài viết thành công!" });
    } catch (err: any) {
      showToast({ type: "error", message: err.message });
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus]);

  const currentViewPosts = posts.filter((post: any) => {
    if (filterStatus === "ALL") return true;
    return post.status === filterStatus;
  });

  const totalPages = meta?.totalPages || 1; 

  const normalizedPosts: BlogPost[] = currentViewPosts.map((p: any) => ({
    id: p.id,
    title: p.title,
    status: p.status,
    createdAt:
      typeof p.createdAt === "string"
        ? p.createdAt
        : new Date(p.createdAt).toISOString(),
    thumbnailUrl: p.thumbnailUrl ?? null,
    upVotes: p.upVotes ?? null,
    downVotes: p.downVotes ?? null,
  }));

  const totalRecords = meta?.total || 0;
  const displayStart = totalRecords === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const displayEnd = Math.min(displayStart + ITEMS_PER_PAGE - 1, totalRecords);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center flex flex-col items-center gap-4">
          <MdAutorenew size={50} className="animate-spin text-pink-500" />
          <p className="text-gray-600 font-medium">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg border-2 border-pink-100">
          <p className="text-2xl mb-2">⚠️</p>
          <p className="text-red-600 font-semibold mb-4">
            Có lỗi xảy ra khi tải dữ liệu
          </p>
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
    <div className="py-8 px-6 bg-white min-h-screen px-[80px]">
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-4xl text-[#6E344D] font-extrabold mb-2 flex items-center">
              <FaBookmark className="inline-block mr-2 text-[#6E344D]" />
              Quản lý Bài Đăng
            </h1>
            <p className="font-body text-gray-500 mt-2">
              Quản lý, lọc và kiểm soát các bài viết blog của bạn
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className={`flex items-center gap-2 px-4 py-3 text-white rounded-lg font-semibold transition hover:scale-102 bg-[#F295B6] hover:bg-[#F295B6]/80`}
          >
            <MdRefresh size={20} className={isFetching ? "animate-spin" : ""} />
            {isFetching ? "Đang tải..." : "Làm mới"}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {["ALL", "ACTIVE", "HIDDEN"].map((status) => {
            let count = 0;
            let label = "";

            if (status === "ALL") {
                count = stats.all;
                label = "Tất cả";
            } else if (status === "ACTIVE") {
                count = stats.active;
                label = "Công khai";
            } else if (status === "HIDDEN") {
                count = stats.hidden;
                label = "Đã ẩn";
            }
                
            const colors =
              status === "ALL"
                ? { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" }
                : status === "ACTIVE"
                ? { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" }
                : { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200" };

            return (
              <div
                key={status}
                className={`${colors.bg} border-2 ${colors.border} rounded-xl p-4 text-center`}
              >
                <p className={`${colors.text} text-sm font-medium uppercase tracking-wide`}>
                  {label} {}
                </p>
                <p className={`${colors.text} text-3xl font-bold mt-1`}>
                  {count} {}
                </p>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2">
          {(["ALL", "ACTIVE", "HIDDEN"] as StatusFilter[]).map((status) => {
            const isActive = filterStatus === status;
            return (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-5 py-2.5 rounded-lg font-semibold transition whitespace-nowrap ${
                  isActive
                    ? "text-white bg-[#F295B6] border-2 border-[#F295B6]"
                    : "bg-white border-2 text-gray-700 hover:border-[#F295B6] border-gray-200"
                }`}
              >
                {status === "ALL" ? "Tất cả" : status === "ACTIVE" ? "Công khai" : "Ẩn"}
              </button>
            );
          })}
        </div>
      </div>

      <PostsTable
        posts={normalizedPosts}
        onHide={handleHide}
        onRestore={handleRestore}
        loadingId={actionLoading}
        emptyMessage={
          filterStatus !== "ALL"
            ? `Không có bài viết nào với trạng thái "${filterStatus}" trong trang này`
            : "Không có bài viết nào"
        }
      />

      <div className="mt-8">
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            Hiển thị{" "}
            <span className="font-bold text-[#F295B6]">
              {displayStart}-{displayEnd}
            </span>{" "}
            trên{" "}
            <span className="font-bold text-[#F295B6]">
              {totalRecords}
            </span>{" "}
            bài viết
          </p>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 flex-wrap">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2.5 rounded-lg border-2 border-[#F295B6] hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <BiChevronLeft size={20} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              const isVisible =
                page === 1 ||
                page === totalPages ||
                Math.abs(page - currentPage) <= 1;
              
              if (!isVisible && page !== 2 && page !== totalPages - 1) return null;
              if (!isVisible && (page === 2 || page === totalPages - 1))
                return <span key={`dots-${page}`} className="px-2">...</span>;

              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    currentPage === page
                      ? "text-white bg-[#F295B6] border-2 border-[#F295B6]"
                      : "bg-white border-2 text-gray-700 hover:bg-[#F295B6]/10 border-[#F295B6]"
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2.5 rounded-lg border-2 border-[#83797d] hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
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