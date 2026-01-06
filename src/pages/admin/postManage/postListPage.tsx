import { useEffect, useState, useMemo } from "react";
import { MdRefresh, MdSearch, MdClose } from "react-icons/md";
import { BiChevronLeft, BiChevronRight, BiChevronsLeft, BiChevronsRight, BiChevronDown } from "react-icons/bi";
import { FaBookmark } from "react-icons/fa";
import { useGetAllPosts, useHidePost, useRestorePost } from "../../../hooks/usePost"; 
import { useResolveAllReportsByTarget } from "../../../hooks/useReport"; 
import PostsTable from "../../../features/admin/postManage/PostsTable";
import { PostTableSkeleton } from "../../../components/skeleton/PostTableSkeleton"; 
import { type IPostResponseDto, EBlogPostStatus } from "../../../types/post";
import { EReportType } from "../../../types/report";

type StatusFilter = "ALL" | EBlogPostStatus;

const ITEMS_PER_PAGE = 10;

const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const PostListPage = () => {
  // --- STATE ---
  const [filterStatus, setFilterStatus] = useState<StatusFilter>("ALL");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // --- DATA FETCHING ---
  const {
    data: allPosts = [] as IPostResponseDto[],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetAllPosts();

  // --- MUTATIONS ---
  const { mutate: hidePost } = useHidePost();
  const { mutate: restorePost } = useRestorePost();
  const { mutateAsync: resolveAllReportsAsync } = useResolveAllReportsByTarget();

  // --- DERIVED STATE ---
  const stats = useMemo(() => {
    return {
      all: allPosts.length,
      active: allPosts.filter((p) => p.status === EBlogPostStatus.ACTIVE).length,
      hidden: allPosts.filter((p) => p.status === EBlogPostStatus.HIDDEN).length,
    };
  }, [allPosts]);

  const filteredPosts = useMemo(() => {
    let result = allPosts;

    // Lọc theo trạng thái
    if (filterStatus !== "ALL") {
      result = result.filter((p) => p.status === filterStatus);
    }

    // Lọc theo Search Term
    if (debouncedSearchTerm.trim()) {
        const lowerTerm = debouncedSearchTerm.toLowerCase();
        result = result.filter((p) => 
            p.title.toLowerCase().includes(lowerTerm) || 
            p.author?.username?.toLowerCase().includes(lowerTerm) 
        );
    }

    return result;
  }, [allPosts, filterStatus, debouncedSearchTerm]);

  const totalRecords = filteredPosts.length;
  const totalPages = Math.ceil(totalRecords / ITEMS_PER_PAGE) || 1;
  
  const displayStart = totalRecords === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const displayEnd = Math.min(displayStart + ITEMS_PER_PAGE - 1, totalRecords);

  const currentViewPosts = filteredPosts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const normalizedPosts: IPostResponseDto[] = currentViewPosts.map((p) => ({
    ...p,
    createdAt: typeof p.createdAt === "string" 
      ? p.createdAt 
      : new Date(p.createdAt).toISOString(),
  }));

  // --- HANDLERS ---
  const handleHide = (postId: number) => {
    setActionLoading(postId);
    hidePost(postId, { onSettled: () => setActionLoading(null) });
  };

  const handleRestore = (postId: number) => {
    setActionLoading(postId);
    restorePost(postId, { onSettled: () => setActionLoading(null) });
  };

  const handleApproveReport = async (postId: number) => {
    setActionLoading(postId); 
    try {
      await resolveAllReportsAsync({ 
        targetId: postId, 
        type: EReportType.POST, 
        action: "APPROVE" 
      });
      await refetch();
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectReport = async (postId: number) => {
    setActionLoading(postId);
    try {
      await resolveAllReportsAsync({ 
        targetId: postId, 
        type: EReportType.POST, 
        action: "REJECT" 
      });
      await refetch();
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoading(null);
    }
  };

  // --- EFFECTS ---
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
    }
  }, [filteredPosts.length, totalPages, currentPage]);

  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg border-2 border-pink-100">
          <p className="text-2xl mb-2">⚠️</p>
          <p className="text-red-600 font-semibold mb-4">Có lỗi xảy ra khi tải dữ liệu</p>
          <button onClick={() => refetch()} className="px-6 py-2 text-white rounded-lg transition hover:opacity-90 bg-pink-500">Thử lại</button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 bg-white min-h-screen px-20">
      <div className="mb-8">
        
        {/* Header Section */}
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
        <div className="grid grid-cols-3 gap-4 mb-8">
           {["ALL", EBlogPostStatus.ACTIVE, EBlogPostStatus.HIDDEN].map((status) => {
            let count = 0;
            let label = "";

            if (status === "ALL") {
                count = stats.all;
                label = "Tổng bài viết";
            } else if (status === EBlogPostStatus.ACTIVE) {
                count = stats.active;
                label = "Đang công khai";
            } else if (status === EBlogPostStatus.HIDDEN) {
                count = stats.hidden;
                label = "Đã bị ẩn";
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
                className={`${colors.bg} border-2 ${colors.border} rounded-xl p-4 text-center`}
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

        {/* CONTROL BAR */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
            <div className="flex gap-3 w-full">
                {/* SEARCH INPUT */}
                <div className="relative flex-1">
                    <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Tìm theo tiêu đề, tác giả..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-10 py-3 w-full border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#F295B6] transition-colors"
                    />
                    {searchTerm && (
                        <button 
                            onClick={() => setSearchTerm("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <MdClose size={18} />
                        </button>
                    )}
                </div>

                {/* FILTER DROPDOWN */}
                <div className="relative min-w-[200px]">
                    <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as StatusFilter)}
                    className="w-full appearance-none pl-4 pr-10 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#F295B6] transition-colors bg-white font-medium text-gray-700 cursor-pointer hover:border-gray-300"
                    >
                    <option value="ALL">Tất cả trạng thái</option>
                    <option value={EBlogPostStatus.ACTIVE}>Công khai (Active)</option>
                    <option value={EBlogPostStatus.HIDDEN}>Đã ẩn (Hidden)</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                    <BiChevronDown size={20} />
                    </div>
                </div>
            </div>
        </div>

      </div>

      {/* RENDER TABLE */}
      <div className={`transition-opacity duration-300 ${isFetching ? "opacity-60 pointer-events-none" : "opacity-100"}`}>
        {isLoading ? (
          <PostTableSkeleton /> 
        ) : (
          <PostsTable
            posts={normalizedPosts}
            loadingId={actionLoading}
            onHide={handleHide}
            onRestore={handleRestore}
            onApproveReport={(id) => handleApproveReport(id)} 
            onRejectReport={(id) => handleRejectReport(id)}
            emptyMessage={
                debouncedSearchTerm 
                ? `Không tìm thấy kết quả cho từ khóa "${debouncedSearchTerm}"`
                : (filterStatus !== "ALL"
                    ? `Không có bài viết nào với trạng thái "${filterStatus}"`
                    : "Không có bài viết nào")
            }
          />
        )}
      </div>

      {/* Pagination Footer */}
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