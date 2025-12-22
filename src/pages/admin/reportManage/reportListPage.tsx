import { useEffect, useMemo, useState } from "react";
import { MdRefresh, MdAutorenew } from "react-icons/md";
import {
  BiChevronLeft,
  BiChevronRight,
  BiChevronsLeft,
  BiChevronsRight,
} from "react-icons/bi";
import { FaExclamationTriangle } from "react-icons/fa";
import { useGetAllReports, useResolveReport } from "../../../hooks/useReport";
import ReportTable from "../../../features/admin/reportManage/ReportTable";
import type { IReportResponse, EReportType } from "../../../types/report";

type ReportFilter = "ALL" | EReportType;

const ITEMS_PER_PAGE = 10;

const ReportListPage = () => {
  // --- STATE UI ---
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState<ReportFilter>("ALL");
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // --- REACT QUERY HOOKS ---
  const {
    data: apiReports = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useGetAllReports();

  const { mutate: resolveReport } = useResolveReport();

  // Ensure data is IReportResponse[]
  const reports = apiReports as IReportResponse[];

  // --- RESET PAGE KHI FILTER ---
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType]);

  // ================= FILTER LOGIC =================
  const filteredReports = useMemo(() => {
    if (filterType === "ALL") return reports;
    return reports.filter((r) => r.type === filterType);
  }, [reports, filterType]);

  // ================= STATS =================
  const stats = useMemo(() => {
    return {
      all: reports.length,
      USER: reports.filter((r) => r.type === "USER").length,
      POST: reports.filter((r) => r.type === "POST").length,
      COMMENT: reports.filter((r) => r.type === "COMMENT").length,
    };
  }, [reports]);

  // ================= PAGINATION =================
  const totalRecords = filteredReports.length;
  const totalPages = Math.ceil(totalRecords / ITEMS_PER_PAGE) || 1;

  const displayStart = totalRecords === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const displayEnd = Math.min(displayStart + ITEMS_PER_PAGE - 1, totalRecords);

  const currentViewReports = filteredReports.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // --- HANDLERS ---
  const handleApprove = (reportId: number) => {
    setActionLoading(reportId);
    resolveReport(
      { id: reportId, type: getReportType(reportId), action: "APPROVE" },
      {
        onSuccess: () => {
          setActionLoading(null);
          refetch();
        },
        onError: () => {
          setActionLoading(null);
        },
      }
    );
  };

  const handleReject = (reportId: number) => {
    setActionLoading(reportId);
    resolveReport(
      { id: reportId, type: getReportType(reportId), action: "REJECT" },
      {
        onSuccess: () => {
          setActionLoading(null);
          refetch();
        },
        onError: () => {
          setActionLoading(null);
        },
      }
    );
  };

  const getReportType = (reportId: number): EReportType => {
    const report = reports.find((r) => r.id === reportId);
    return report?.type || "POST";
  };

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [filteredReports.length, totalPages, currentPage]);

  // ================= RENDER: LOADING =================
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

  // ================= RENDER: ERROR =================
  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg border-2 border-pink-100">
          <p className="text-2xl mb-2">⚠️</p>
          <p className="text-red-600 font-semibold mb-4">
            {(error as any)?.response?.data?.message ||
              (error as Error).message ||
              "Có lỗi xảy ra khi tải dữ liệu"}
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

  // ================= RENDER: MAIN UI =================
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
              Quản lý, phê duyệt và xử lý các báo cáo vi phạm
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className={`flex items-center gap-2 px-4 py-3 text-white rounded-lg font-semibold transition hover:scale-102 bg-[#F295B6] hover:bg-[#F295B6]/80`}
          >
            <MdRefresh
              size={20}
              className={isFetching ? "animate-spin" : ""}
            />
            {isFetching ? "Đang tải..." : "Làm mới"}
          </button>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {(["ALL", "USER", "POST", "COMMENT"] as const).map((type) => {
            const count = type === "ALL" ? stats.all : stats[type];
            let colors = {
              bg: "bg-blue-50",
              text: "text-blue-700",
              border: "border-blue-200",
            };

            if (type === "USER") {
              colors = {
                bg: "bg-red-50",
                text: "text-red-700",
                border: "border-red-200",
              };
            } else if (type === "POST") {
              colors = {
                bg: "bg-emerald-50",
                text: "text-emerald-700",
                border: "border-emerald-200",
              };
            } else if (type === "COMMENT") {
              colors = {
                bg: "bg-amber-50",
                text: "text-amber-700",
                border: "border-amber-200",
              };
            }

            return (
              <div
                key={type}
                className={`${colors.bg} border-2 ${colors.border} rounded-xl p-4 text-center`}
              >
                <p
                  className={`${colors.text} text-sm font-medium uppercase tracking-wide`}
                >
                  {type === "ALL"
                    ? "Tất cả"
                    : type === "USER"
                    ? "Người dùng"
                    : type === "POST"
                    ? "Bài viết"
                    : "Bình luận"}
                </p>
                <p className={`${colors.text} text-3xl font-bold mt-1`}>
                  {count}
                </p>
              </div>
            );
          })}
        </div>

        {/* FILTER TABS */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          {(["ALL", "USER", "POST", "COMMENT"] as ReportFilter[]).map((type) => {
            const isActive = filterType === type;
            return (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-5 py-2.5 rounded-lg font-semibold transition whitespace-nowrap ${
                  isActive
                    ? "text-white bg-[#F295B6] border-2 border-[#F295B6]"
                    : "bg-white border-2 text-gray-700 hover:border-[#F295B6] border-gray-200"
                }`}
              >
                {type === "ALL"
                  ? "Tất cả"
                  : type === "USER"
                  ? "Người dùng"
                  : type === "POST"
                  ? "Bài viết"
                  : "Bình luận"}
              </button>
            );
          })}
        </div>
      </div>

      {/* TABLE */}
      <ReportTable
        reports={currentViewReports}
        onApprove={handleApprove}
        onReject={handleReject}
        loadingId={actionLoading}
        emptyMessage={
          filterType !== "ALL"
            ? `Không có báo cáo nào với loại "${filterType}"`
            : "Không có báo cáo nào"
        }
      />

      {/* PAGINATION */}
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
            báo cáo
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
    </div>
  );
};

export default ReportListPage;