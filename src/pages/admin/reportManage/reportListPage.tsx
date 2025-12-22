import { useEffect, useMemo, useState } from "react";
import { MdRefresh, MdAutorenew } from "react-icons/md";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";
import { useGetAllReports } from "../../../hooks/useReport"; // Import hook

// --- LOCAL TYPES (Giữ nguyên để đảm bảo UI render đúng) ---
type User = {
  id: number;
  username?: string;
  email?: string;
};

type BlogPost = {
  id: number;
  title: string;
  author?: User;
};

type Comment = {
  id: number;
  content: string;
  commenter?: User;
};

// Type này tương đương với IReportResponseDTO
type Report = {
  id: number;
  reason: string;
  type: "USER" | "COMMENT" | "POST";
  createdAt: string;
  reporter: User | null;
  reportedUser: User | null;
  reportedComment: Comment | null;
  reportedPost: BlogPost | null;
};

type ReportFilter = "ALL" | "USER" | "COMMENT" | "POST";

const ITEMS_PER_PAGE = 10;

const ReportListPage = () => {
  // --- STATE UI (Chỉ giữ lại state quản lý giao diện) ---
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState<ReportFilter>("ALL");

  // --- REACT QUERY HOOK ---
  const { 
    data: apiData = [], // Mặc định là mảng rỗng nếu chưa có data
    isLoading, 
    isError, 
    error, 
    refetch, 
    isFetching 
  } = useGetAllReports();

  // Ép kiểu data từ API về kiểu Report cục bộ (nếu cấu trúc giống nhau)
  const reports = apiData as unknown as Report[];

  // --- RESET PAGE KHI FILTER ---
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType]);

  // ================= FILTER LOGIC (Giữ nguyên) =================
  const filteredReports = useMemo(() => {
    if (filterType === "ALL") return reports;
    return reports.filter((r) => r.type === filterType);
  }, [reports, filterType]);

  // ================= COUNT LOGIC (Giữ nguyên) =================
  const totalByType = useMemo(() => {
    return {
      ALL: reports.length,
      USER: reports.filter((r) => r.type === "USER").length,
      COMMENT: reports.filter((r) => r.type === "COMMENT").length,
      POST: reports.filter((r) => r.type === "POST").length,
    };
  }, [reports]);

  const reportCountByTarget = useMemo(() => {
    return filteredReports.reduce<Record<number, number>>((acc, r) => {
      const targetId =
        r.type === "POST"
          ? r.reportedPost?.id
          : r.type === "COMMENT"
          ? r.reportedComment?.id
          : r.reportedUser?.id;

      if (targetId) {
        acc[targetId] = (acc[targetId] || 0) + 1;
      }
      return acc;
    }, {});
  }, [filteredReports]);

  // ================= PAGINATION LOGIC (Giữ nguyên) =================
  const totalPages = Math.ceil(filteredReports.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedReports = filteredReports.slice(startIndex, endIndex);

  // ================= RENDER: LOADING =================
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <MdAutorenew
          size={40}
          className="animate-spin text-pink-500"
        />
      </div>
    );
  }

  // ================= RENDER: ERROR =================
  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-white p-6 rounded-xl shadow border border-red-100 text-center">
          <p className="text-2xl mb-2">⚠️</p>
          <p className="text-red-600 mb-4 font-medium">
            {(error as any)?.response?.data?.message || (error as Error).message || "Lỗi khi tải dữ liệu"}
          </p>
          <button
            onClick={() => refetch()}
            className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // ================= RENDER: MAIN UI =================
  return (
    <div className="py-8 px-6 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-rose-900 flex items-center gap-2">
            🚨 Quản lý Report
          </h1>
          <p className="text-gray-500 mt-2">
            Quản lý các báo cáo vi phạm từ người dùng
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className={`flex items-center gap-2 px-5 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-full font-medium transition shadow-sm ${isFetching ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          <MdRefresh size={20} className={isFetching ? "animate-spin" : ""} /> 
          {isFetching ? "Đang tải..." : "Làm mới"}
        </button>
      </div>

      {/* FILTER TABS */}
      <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
        {(["ALL", "USER", "COMMENT", "POST"] as ReportFilter[]).map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-5 py-2 rounded-full font-semibold transition whitespace-nowrap ${
              filterType === type 
                ? "bg-pink-500 text-white shadow-md transform scale-105" 
                : "bg-white border text-gray-600 hover:bg-gray-50"
            }`}
          >
            {type === "ALL" ? "Tất cả" : type} 
            <span className={`ml-2 text-xs py-0.5 px-2 rounded-full ${filterType === type ? 'bg-white/20' : 'bg-gray-100'}`}>
              {totalByType[type]}
            </span>
          </button>
        ))}
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-pink-50/50 border-b border-pink-100">
              <tr>
                <th className="p-4 text-left text-sm font-semibold text-rose-900">Đối tượng bị report</th>
                <th className="p-4 text-center text-sm font-semibold text-rose-900 w-[100px]">Số lượt</th>
                <th className="p-4 text-left text-sm font-semibold text-rose-900">Người report</th>
                <th className="p-4 text-left text-sm font-semibold text-rose-900 w-[30%]">Lý do</th>
                <th className="p-4 text-center text-sm font-semibold text-rose-900">Thời gian</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {paginatedReports.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-4xl">📭</span>
                      <p>Không có báo cáo nào</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedReports.map((report) => {
                  let targetLabel = "—";
                  let targetId: number | undefined;

                  // Logic hiển thị label (như cũ)
                  if (report.type === "USER") {
                    targetId = report.reportedUser?.id;
                    targetLabel = report.reportedUser?.username || report.reportedUser?.email || "User ẩn danh";
                  } else if (report.type === "COMMENT") {
                    targetId = report.reportedComment?.id;
                    targetLabel = report.reportedComment?.content 
                      ? `"${report.reportedComment.content.substring(0, 30)}..."` 
                      : "(Không nội dung)";
                  } else if (report.type === "POST") {
                    targetId = report.reportedPost?.id;
                    targetLabel = report.reportedPost?.title || "Bài viết ẩn danh";
                  }

                  return (
                    <tr key={report.id} className="hover:bg-pink-50/30 transition-colors">
                      {/* Đối tượng */}
                      <td className="p-4">
                         <div className="font-medium text-gray-800">{targetLabel}</div>
                         <div className="text-xs text-gray-500 mt-0.5 font-mono bg-gray-100 inline-block px-1 rounded">
                            {report.type} #{targetId}
                         </div>
                      </td>

                      {/* Số lượt */}
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-pink-100 text-pink-700 font-bold text-sm">
                           {targetId ? reportCountByTarget[targetId] : 0}
                        </span>
                      </td>

                      {/* Người report */}
                      <td className="p-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                                {(report.reporter?.username || "?")[0].toUpperCase()}
                            </div>
                            {report.reporter?.username || "Ẩn danh"}
                        </div>
                      </td>

                      {/* Lý do */}
                      <td className="p-4 text-sm text-gray-600">
                        <p className="line-clamp-2" title={report.reason}>
                            {report.reason}
                        </p>
                      </td>

                      {/* Thời gian */}
                      <td className="p-4 text-center text-sm text-gray-500 whitespace-nowrap">
                        {new Date(report.createdAt).toLocaleDateString("vi-VN")}
                        <br/>
                        <span className="text-xs opacity-70">
                            {new Date(report.createdAt).toLocaleTimeString("vi-VN", {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION (Giữ nguyên logic nhưng style lại chút cho đẹp) */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="p-2 border border-pink-200 rounded-lg text-pink-600 hover:bg-pink-50 disabled:opacity-50 disabled:hover:bg-transparent"
          >
            <BiChevronLeft size={20}/>
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-9 h-9 rounded-lg font-medium transition ${
                currentPage === page 
                  ? "bg-pink-500 text-white shadow-md shadow-pink-200" 
                  : "bg-white border border-gray-200 text-gray-600 hover:border-pink-300"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="p-2 border border-pink-200 rounded-lg text-pink-600 hover:bg-pink-50 disabled:opacity-50 disabled:hover:bg-transparent"
          >
            <BiChevronRight size={20}/>
          </button>
        </div>
      )}
    </div>
  );
};

export default ReportListPage;