import { useEffect, useState } from "react";
import { MdRefresh, MdSearch, MdClose } from "react-icons/md";
import { BiChevronLeft, BiChevronRight, BiChevronsLeft, BiChevronsRight, BiChevronDown } from "react-icons/bi";
import { FaExclamationTriangle } from "react-icons/fa";
import {
  useGetGroupedReports,
  useResolveAllReportsByTarget,
} from "../../../hooks/useReport";

import ReportTable from "../../../features/admin/reportManage/ReportTable";
import ReportDetailModal from "../../../features/admin/reportManage/ReportDetailModal";
import { type IGroupedReport, EReportType } from "../../../types/report";
import { ReportTableSkeleton } from "../../../components/skeleton/ReportTableSkeleton";

type ReportTypeFilter = EReportType; 
type StatusFilter = "PENDING" | "RESOLVED";

const ITEMS_PER_PAGE = 10;

// Custom hook cho debounce
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

const ReportListPage = () => {
  // --- STATE UI ---
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [typeFilter, setTypeFilter] = useState<ReportTypeFilter>(EReportType.POST);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("PENDING");
  
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<IGroupedReport | null>(null);

  // Debounce search term (300ms)
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // --- REACT QUERY HOOKS (Server-side Pagination) ---
  const {
    data: responseData,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useGetGroupedReports(
    statusFilter,
    typeFilter,
    currentPage,
    ITEMS_PER_PAGE,
    debouncedSearchTerm
  );

  const { mutateAsync: resolveAllReportsAsync } = useResolveAllReportsByTarget();

  const rawData = responseData as any;
  const groupedReports = (Array.isArray(rawData) ? rawData : rawData?.items || []) as IGroupedReport[];
  
  const meta = rawData?.meta || {
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    itemsPerPage: ITEMS_PER_PAGE,
  };

  // --- EFFECTS ---
  useEffect(() => {
    setCurrentPage(1);
  }, [typeFilter, statusFilter, debouncedSearchTerm]);

  // --- HELPERS ---
  const getTargetInfo = (reportId: number) => {
    const report = groupedReports.find((r) => r.id === reportId);
    if (!report) return null;

    let targetId = 0;
    switch (report.type) {
        case EReportType.POST:
            targetId = report.reportedPost?.id || 0;
            break;
        case EReportType.COMMENT:
            targetId = report.reportedComment?.id || 0;
            break;
        case EReportType.USER:
            targetId = report.reportedUser?.id || 0;
            break;
    }

    if (!targetId) return null;

    return { targetId, type: report.type };
  };

  // --- HANDLERS (Async Batch Processing) ---

  // 1. Chấp thuận (Approve) -> Xử lý vi phạm + Resolve All
  const handleApprove = async (reportId: number) => {
    const targetInfo = getTargetInfo(reportId);
    if (!targetInfo) return;

    setActionLoading(reportId);
    try {
      await resolveAllReportsAsync({
        targetId: targetInfo.targetId,
        type: targetInfo.type,
        action: "APPROVE",
      });

      await refetch();
    } catch (error) {
      console.error("Error approving group:", error);
    } finally {
      setActionLoading(null);
    }
  };

  // 2. Từ chối (Reject) -> Bỏ qua + Resolve All
  const handleReject = async (reportId: number) => {
    const targetInfo = getTargetInfo(reportId);
    if (!targetInfo) return;

    setActionLoading(reportId);
    try {
      await resolveAllReportsAsync({
        targetId: targetInfo.targetId,
        type: targetInfo.type,
        action: "REJECT",
      });
      await refetch();
    } catch (error) {
      console.error("Error rejecting group:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewDetail = (reportId: number) => {
    const report = groupedReports.find((r) => r.id === reportId);
    if (report) {
      setSelectedReport(report);
      setDetailModalOpen(true);
    }
  };

  // --- RENDER ERROR ---
  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg border-2 border-pink-100">
          <p className="text-2xl mb-2">⚠️</p>
          <p className="text-red-600 font-semibold mb-4">
            Có lỗi xảy ra khi tải dữ liệu báo cáo
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

  

  // --- MAIN RENDER ---
  return (
    <div className="py-8 px-20 bg-white min-h-screen">
      {/* HEADER */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-4xl text-[#6E344D] font-extrabold mb-2 flex items-center">
              <FaExclamationTriangle className="inline-block mr-2 text-[#6E344D]" />
              Quản lý Báo cáo
            </h1>
            <p className="font-body text-gray-500 mt-2">
              Quản lý các nhóm báo cáo theo đối tượng, phê duyệt và xử lý vi phạm
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching || isLoading}
            className={`flex items-center gap-2 px-4 py-3 text-white rounded-lg font-semibold transition hover:scale-102 bg-[#F295B6] hover:bg-[#F295B6]/80`}
          >
            <MdRefresh
              size={20}
              className={(isFetching || isLoading) ? "animate-spin" : ""}
            />
            {(isFetching || isLoading) ? "Đang tải..." : "Làm mới"}
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {([
            { type: EReportType.POST, label: "Báo cáo Bài viết", colors: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" } },
            { type: EReportType.COMMENT, label: "Báo cáo Bình luận", colors: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" } },
            { type: EReportType.USER, label: "Báo cáo Người dùng", colors: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" } },
          ] as const).map((item) => {
            const count = groupedReports.filter((r) => r.type === item.type).length;
            return (
              <div
                key={item.type}
                className={`${item.colors.bg} border-2 ${item.colors.border} rounded-xl p-4 text-center`}
              >
                <p className={`${item.colors.text} text-sm font-medium uppercase tracking-wide`}>
                  {item.label}
                </p>
                <p className={`${item.colors.text} text-3xl font-bold mt-1`}>
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
                placeholder="Tìm theo ID báo cáo, người dùng, bài viết..."
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

            {/* TYPE FILTER DROPDOWN */}
            <div className="relative min-w-[200px]">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as ReportTypeFilter)}
                className="w-full appearance-none pl-4 pr-10 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#F295B6] transition-colors bg-white font-medium text-gray-700 cursor-pointer hover:border-gray-300"
              >
                <option value={EReportType.POST}>Báo cáo Bài viết</option>
                <option value={EReportType.COMMENT}>Báo cáo Bình luận</option>
                <option value={EReportType.USER}>Báo cáo Người dùng</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                <BiChevronDown size={20} />
              </div>
            </div>

            {/* STATUS FILTER DROPDOWN */}
            <div className="relative min-w-[200px]">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="w-full appearance-none pl-4 pr-10 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#F295B6] transition-colors bg-white font-medium text-gray-700 cursor-pointer hover:border-gray-300"
              >
                <option value="PENDING">Chờ xử lý</option>
                <option value="RESOLVED">Đã giải quyết</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                <BiChevronDown size={20} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE CONTENT */}
      <div className={`transition-opacity duration-300 ${isFetching ? "opacity-60 pointer-events-none" : "opacity-100"}`}>
        {isLoading ? (
            <ReportTableSkeleton />
        ) : (
            <>
            <ReportTable
                reports={groupedReports}
                onViewDetail={handleViewDetail}
                onApprove={statusFilter === "PENDING" ? handleApprove : undefined}
                onReject={statusFilter === "PENDING" ? handleReject : undefined}
                loadingId={actionLoading}
                isResolved={statusFilter === "RESOLVED"}
                emptyMessage={
                `Không có báo cáo nào về "${typeFilter === EReportType.POST ? 'Bài viết' : typeFilter}" ở trạng thái ${statusFilter === 'PENDING' ? 'chờ xử lý' : 'đã giải quyết'}.`
                }
            />

            {selectedReport && (
                <ReportDetailModal
                open={detailModalOpen}
                groupedReport={selectedReport}
                onClose={() => {
                    setDetailModalOpen(false);
                    setSelectedReport(null);
                }}
                />
            )}
            </>
        )}
      </div>

      {/* PAGINATION */}
      {!isLoading && meta.totalPages > 0 && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">
              Hiển thị{" "}
              <span className="font-bold text-[#F295B6]">
                {(meta.currentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
                {Math.min(meta.currentPage * ITEMS_PER_PAGE, meta.totalItems)}
              </span>{" "}
              trên{" "}
              <span className="font-bold text-[#F295B6]">
                {meta.totalItems}
              </span>{" "}
              đối tượng
            </p>
          </div>

          <div className="flex justify-center items-center gap-2 flex-wrap">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-2.5 rounded-lg border-2 border-[#F295B6] hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <BiChevronsLeft size={20} />
            </button>

            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2.5 rounded-lg border-2 border-[#F295B6] hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <BiChevronLeft size={20} />
            </button>

            {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map(
              (page) => {
                const isVisible =
                  page === 1 ||
                  page === meta.totalPages ||
                  Math.abs(page - currentPage) <= 1;

                if (!isVisible && page !== 2 && page !== meta.totalPages - 1)
                  return null;
                if (!isVisible && (page === 2 || page === meta.totalPages - 1))
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
              }
            )}

            <button
              onClick={() => setCurrentPage(Math.min(meta.totalPages, currentPage + 1))}
              disabled={currentPage === meta.totalPages}
              className="p-2.5 rounded-lg border-2 border-[#F295B6] hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <BiChevronRight size={20} />
            </button>

            <button
              onClick={() => setCurrentPage(meta.totalPages)}
              disabled={currentPage === meta.totalPages}
              className="p-2.5 rounded-lg border-2 border-[#F295B6] hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <BiChevronsRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportListPage;