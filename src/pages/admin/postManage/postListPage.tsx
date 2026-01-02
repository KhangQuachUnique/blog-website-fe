import { useEffect, useState, useMemo } from "react";
import { MdRefresh } from "react-icons/md";
import { BiChevronLeft, BiChevronRight, BiChevronsLeft, BiChevronsRight } from "react-icons/bi";
import { FaBookmark } from "react-icons/fa";
import { useGetAllPosts, useHidePost, useRestorePost } from "../../../hooks/usePost"; 
import { useResolveReport } from "../../../hooks/useReport";
import { useToast } from "../../../contexts/toast";
import PostsTable from "../../../features/admin/postManage/PostsTable";
import { type IPostResponseDto, EBlogPostStatus } from "../../../types/post";
import type { EReportType } from "../../../types/report";
import { PostTableSkeleton } from "../../../components/skeleton/PostTableSkeleton"; 

type StatusFilter = "ALL" | EBlogPostStatus;

const ITEMS_PER_PAGE = 10;

const PostListPage = () => {
  const [filterStatus, setFilterStatus] = useState<StatusFilter>("ALL");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Data fetching hook
  const {
    data: allPosts = [] as IPostResponseDto[],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetAllPosts();

  // Mutation hooks
  const { mutate: hidePost } = useHidePost();
  const { mutate: restorePost } = useRestorePost();
  const { mutate: resolveReport } = useResolveReport();

  // --- CLIENT-SIDE LOGIC ---

  const stats = useMemo(() => {
    return {
      all: allPosts.length,
      active: allPosts.filter((p) => p.status === EBlogPostStatus.ACTIVE).length,
      hidden: allPosts.filter((p) => p.status === EBlogPostStatus.HIDDEN).length,
    };
  }, [allPosts]);

  const filteredPosts = useMemo(() => {
    if (filterStatus === "ALL") return allPosts;
    return allPosts.filter((p) => p.status === filterStatus);
  }, [allPosts, filterStatus]);

  const totalRecords = filteredPosts.length;
  const totalPages = Math.ceil(totalRecords / ITEMS_PER_PAGE) || 1;
  
  const displayStart = totalRecords === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const displayEnd = Math.min(displayStart + ITEMS_PER_PAGE - 1, totalRecords);

  const currentViewPosts = filteredPosts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // --- HANDLERS ---
  const handleHide = (postId: number) => {
    setActionLoading(postId);
    hidePost(postId, {
      onSettled: () => setActionLoading(null)
    });
  };

  const handleRestore = (postId: number) => {
    setActionLoading(postId);
    restorePost(postId, {
      onSettled: () => setActionLoading(null)
    });
  };

  const handleApproveReport = (reportId: number) => {
    resolveReport({ id: reportId, type: "POST" as EReportType, action: "APPROVE" }, {
       onSuccess: () => {
         refetch();
       },
    });
  };

  const handleRejectReport = (reportId: number) => {
    resolveReport({ id: reportId, type: "POST" as EReportType, action: "REJECT" }, {
        onSuccess: () => {
            refetch();
        },
     });
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
    }
  }, [filteredPosts.length, totalPages, currentPage]);


  const normalizedPosts: IPostResponseDto[] = currentViewPosts.map((p) => ({
    ...p,
    createdAt: typeof p.createdAt === "string" 
      ? p.createdAt 
      : new Date(p.createdAt).toISOString(),
  }));
  
  // --- RENDER ---
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
    <div className="py-8 bg-white min-h-screen px-20">
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
            disabled={isFetching || isLoading}
            className={`flex items-center gap-2 px-4 py-3 text-white rounded-lg font-semibold transition hover:scale-102 bg-[#F295B6] hover:bg-[#F295B6]/80`}
          >
            <MdRefresh size={20} className={(isFetching || isLoading) ? "animate-spin" : ""} />
            {(isFetching || isLoading) ? "Đang tải..." : "Làm mới"}
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {["ALL", EBlogPostStatus.ACTIVE, EBlogPostStatus.HIDDEN].map((status) => {
            let count = 0;
            let label = "";

            if (status === "ALL") {
                count = stats.all;
                label = "Tất cả";
            } else if (status === EBlogPostStatus.ACTIVE) {
                count = stats.active;
                label = "Công khai";
            } else if (status === EBlogPostStatus.HIDDEN) {
                count = stats.hidden;
                label = "Đã ẩn";
            }
                
            const colors =
              status === "ALL"
                ? { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" }
                : status === EBlogPostStatus.ACTIVE
                ? { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" }
                : { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200" };

            return (
              <div
                key={status}
                className={`${colors.bg} border-2 ${colors.border} rounded-xl p-4 text-center transition-all hover:shadow-md`}
              >
                <p className={`${colors.text} text-sm font-medium uppercase tracking-wide`}>
                  {label}
                </p>
                <p className={`${colors.text} text-3xl font-bold mt-1`}>
                   {isLoading ? "-" : count}
                </p>
              </div>
            );
          })}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          {(["ALL", EBlogPostStatus.ACTIVE, EBlogPostStatus.HIDDEN] as StatusFilter[]).map((status) => {
            const isActive = filterStatus === status;
            return (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                disabled={isLoading}
                className={`px-5 py-2.5 rounded-lg font-semibold transition whitespace-nowrap ${
                  isActive
                    ? "text-white bg-[#F295B6] border-2 border-[#F295B6]"
                    : "bg-white border-2 text-gray-700 hover:border-[#F295B6] border-gray-200"
                } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {status === "ALL" ? "Tất cả" : status === EBlogPostStatus.ACTIVE ? "Công khai" : "Ẩn"}
              </button>
            );
          })}
        </div>
      </div>

      {/* RENDER TABLE */}
      {isLoading ? (
        <PostTableSkeleton /> 
      ) : (
        <PostsTable
          posts={normalizedPosts}
          onHide={handleHide}
          onRestore={handleRestore}
          onApproveReport={handleApproveReport}
          onRejectReport={handleRejectReport}
          loadingId={actionLoading}
          emptyMessage={
            filterStatus !== "ALL"
              ? `Không có bài viết nào với trạng thái "${filterStatus}"`
              : "Không có bài viết nào"
          }
        />
      )}

      {!isLoading && (
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
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-2.5 rounded-lg border-2 border-[#F295B6] hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                title="Về trang đầu"
                >
                <BiChevronsLeft size={20} />
                </button>

                <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2.5 rounded-lg border-2 border-[#F295B6] hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                title="Trang trước"
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
                className="p-2.5 rounded-lg border-2 border-[#F295B6] hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                title="Trang sau"
                >
                <BiChevronRight size={20} />
                </button>

                <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2.5 rounded-lg border-2 border-[#F295B6] hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                title="Đến trang cuối"
                >
                <BiChevronsRight size={20} />
                </button>

            </div>
            )}
        </div>
      )}
    </div>
  );
};

export default PostListPage;