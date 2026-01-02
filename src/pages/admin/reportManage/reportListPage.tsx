import { useEffect, useState } from "react";
import { MdRefresh, MdCheckCircle, MdPendingActions } from "react-icons/md";
import {
  BiChevronLeft,
  BiChevronRight,
  BiChevronsLeft,
  BiChevronsRight,
} from "react-icons/bi";
import { FaExclamationTriangle } from "react-icons/fa";

import {
  useGetGroupedReports,
  useResolveReport,
} from "../../../hooks/useReport";
import ReportTable from "../../../features/admin/reportManage/ReportTable";
import ReportDetailModal from "../../../features/admin/reportManage/ReportDetailModal";
import type { IGroupedReport, EReportType } from "../../../types/report";
import { ReportTableSkeleton } from "../../../components/skeleton/ReportTableSkeleton";

// Chỉ định nghĩa các loại cụ thể, bỏ "ALL"
type ReportTypeFilter = EReportType; 
type StatusFilter = "PENDING" | "RESOLVED";

const ITEMS_PER_PAGE = 10;

const ReportListPage = () => {
  // --- STATE UI ---
  const [currentPage, setCurrentPage] = useState(1);
  
  // Mặc định vào là POST (Bài viết) để tránh query rỗng nếu backend chưa hỗ trợ ALL
  const [typeFilter, setTypeFilter] = useState<ReportTypeFilter>("POST");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("PENDING");
  
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<IGroupedReport | null>(null);

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
    ITEMS_PER_PAGE
  );

  const { mutate: resolveReport } = useResolveReport();

  // Xử lý dữ liệu trả về (hỗ trợ cả trường hợp Interceptor trả về mảng hoặc object)
  const rawData = responseData as any;
  const groupedReports = (Array.isArray(rawData) ? rawData : rawData?.data || []) as IGroupedReport[];
  
  const meta = rawData?.meta || {
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    itemsPerPage: ITEMS_PER_PAGE,
  };

  // --- EFFECTS ---
  // Reset về trang 1 khi đổi bộ lọc
  useEffect(() => {
    setCurrentPage(1);
  }, [typeFilter, statusFilter]);

  // --- HANDLERS ---
  const getReportType = (reportId: number): EReportType => {
    const report = groupedReports.find((r) => r.id === reportId);
    return report?.type || "POST";
  };

  const handleApprove = (reportId: number) => {
    setActionLoading(reportId);
    resolveReport(
      { id: reportId, type: getReportType(reportId), action: "APPROVE" },
      {
        onSuccess: () => setActionLoading(null),
        onError: () => setActionLoading(null),
      }
    );
  };

  const handleReject = (reportId: number) => {
    setActionLoading(reportId);
    resolveReport(
      { id: reportId, type: getReportType(reportId), action: "REJECT" },
      {
        onSuccess: () => setActionLoading(null),
        onError: () => setActionLoading(null),
      }
    );
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

        {/* STATUS TABS */}
        <div className="flex p-1 bg-gray-100 rounded-xl w-fit mb-6 border border-gray-200">
          <button
            onClick={() => setStatusFilter("PENDING")}
            disabled={isLoading}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all ${
              statusFilter === "PENDING"
                ? "bg-white text-pink-600 shadow-md"
                : "text-gray-500 hover:text-gray-700"
            } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <MdPendingActions size={20} />
            Cần xử lý
          </button>
          <button
            onClick={() => setStatusFilter("RESOLVED")}
            disabled={isLoading}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all ${
              statusFilter === "RESOLVED"
                ? "bg-white text-green-600 shadow-md"
                : "text-gray-500 hover:text-gray-700"
            } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <MdCheckCircle size={20} />
            Đã giải quyết
          </button>
        </div>

        {/* STATS SUMMARY CARD */}
        <div className="grid grid-cols-1 mb-6">
            <div className={`border-2 rounded-xl p-4 text-center transition-all shadow-sm flex flex-col items-center justify-center
                ${typeFilter === 'POST' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : ''}
                ${typeFilter === 'COMMENT' ? 'bg-amber-50 border-amber-200 text-amber-700' : ''}
                ${typeFilter === 'USER' ? 'bg-red-50 border-red-200 text-red-700' : ''}
            `}>
              <p className="text-sm font-medium uppercase tracking-wide opacity-80">
                Tổng số {typeFilter === 'POST' ? 'Bài viết' : typeFilter === 'COMMENT' ? 'Bình luận' : 'Người dùng'} {statusFilter === 'PENDING' ? 'đang chờ xử lý' : 'đã xử lý'}
              </p>
              <p className="text-4xl font-bold mt-2">
                {isLoading ? "-" : meta.totalItems}
              </p>
            </div>
        </div>

        {/* TYPE FILTER TABS */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          {(["POST", "COMMENT", "USER"] as ReportTypeFilter[]).map((type) => {
            const isActive = typeFilter === type;
            let activeClass = "";
            if(type === 'POST') activeClass = "text-emerald-700 bg-emerald-100 border-emerald-500 shadow-sm";
            if(type === 'COMMENT') activeClass = "text-amber-700 bg-amber-100 border-amber-500 shadow-sm";
            if(type === 'USER') activeClass = "text-red-700 bg-red-100 border-red-500 shadow-sm";

            return (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                disabled={isLoading}
                className={`px-6 py-2.5 rounded-lg font-semibold transition whitespace-nowrap border-2 ${
                  isActive
                    ? activeClass
                    : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {type === "POST" ? "Bài viết" : type === "COMMENT" ? "Bình luận" : "Người dùng"}
              </button>
            );
          })}
        </div>
      </div>

      {/* TABLE CONTENT */}
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
            emptyMessage={
              `Không có báo cáo nào về "${typeFilter}" ở trạng thái ${statusFilter === 'PENDING' ? 'chờ xử lý' : 'đã giải quyết'}.`
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