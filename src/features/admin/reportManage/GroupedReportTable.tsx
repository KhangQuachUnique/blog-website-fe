import React from "react";
import { MdCheckCircle, MdClose, MdAutorenew, MdRemoveRedEye, MdExpandMore } from "react-icons/md";
import { Box, Collapse } from "@mui/material";
import type { IGroupedReport, EReportType } from "../../../types/report";
import { BLOOGIE_COLORS as colors } from "../../../types/table";

interface GroupedReportTableProps {
  reports: IGroupedReport[];
  onViewDetail?: (reportId: number) => void;
  onApprove?: (reportId: number) => void;
  onReject?: (reportId: number) => void;
  loadingId: number | null;
  emptyMessage?: string;
}

const GroupedReportTable: React.FC<GroupedReportTableProps> = ({
  reports,
  onViewDetail,
  onApprove,
  onReject,
  loadingId,
  emptyMessage = "Không có báo cáo nào",
}) => {
  const [expandedRows, setExpandedRows] = React.useState<Set<number>>(new Set());

  const toggleExpanded = (reportId: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(reportId)) {
      newExpanded.delete(reportId);
    } else {
      newExpanded.add(reportId);
    }
    setExpandedRows(newExpanded);
  };

  const getReportTypeLabel = (type: EReportType): string => {
    const typeMap: Record<EReportType, string> = {
      USER: "Người dùng",
      POST: "Bài viết",
      COMMENT: "Bình luận",
    };
    return typeMap[type] || type;
  };

  const getReportTypeColor = (type: EReportType) => {
    const colorMap: Record<EReportType, { bg: string; border: string; text: string }> = {
      USER: { bg: "#fef2f2", border: "#fecaca", text: "#dc2626" },
      POST: { bg: "#f0fdf4", border: "#bbf7d0", text: "#16a34a" },
      COMMENT: { bg: "#fffbeb", border: "#fde68a", text: "#b45309" },
    };
    return colorMap[type] || colorMap.POST;
  };

  if (!reports || reports.length === 0) {
    return (
      <Box sx={{ p: 6, textAlign: "center", bgcolor: "#f9fafb", borderRadius: "12px", border: "1px solid #e5e7eb" }}>
        <p style={{ color: colors.textSecondary, fontSize: "16px", fontStyle: 'italic' }}>{emptyMessage}</p>
      </Box>
    );
  }

  return (
    <Box sx={{ border: "1px solid #e5e7eb", borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)" }}>
      {/* Header */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "60px 100px 1fr 100px 150px 120px 120px",
          gap: 2,
          p: 2,
          bgcolor: "#f9fafb",
          borderBottom: "1px solid #e5e7eb",
          fontWeight: 700,
          fontSize: "13px",
          color: "#4b5563",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        <Box>ID</Box>
        <Box>Loại</Box>
        <Box>Đối tượng vi phạm</Box>
        <Box textAlign="center">Số lượng</Box>
        <Box textAlign="center">Lý do gần nhất</Box>
        <Box textAlign="center">Ngày cập nhật</Box>
        <Box textAlign="center">Thao tác</Box>
      </Box>

      {/* Rows */}
      {reports.map((groupedReport) => {
        const isExpanded = expandedRows.has(groupedReport.id);
        const typeColor = getReportTypeColor(groupedReport.type);

        return (
          <Box key={groupedReport.id}>
            {/* Main Row */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "60px 100px 1fr 100px 150px 120px 120px",
                gap: 2,
                p: 2,
                borderBottom: "1px solid #e5e7eb",
                alignItems: "center",
                bgcolor: "white",
                transition: "background-color 0.2s",
                "&:hover": { bgcolor: "#f9fafb" },
              }}
            >
              {/* ID */}
              <Box sx={{ fontWeight: 600, color: colors.text }}>#{groupedReport.id}</Box>

              {/* Type Badge */}
              <Box>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "4px 10px",
                    borderRadius: "9999px",
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    backgroundColor: typeColor.bg,
                    color: typeColor.text,
                    border: `1px solid ${typeColor.border}`,
                  }}
                >
                  {getReportTypeLabel(groupedReport.type)}
                </span>
              </Box>

              {/* Object Name/Title */}
              <Box
                sx={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#111827",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={
                  groupedReport.type === "USER" ? groupedReport.reportedUser?.username 
                  : groupedReport.type === "POST" ? groupedReport.reportedPost?.title 
                  : groupedReport.reportedComment?.contentPreview
                }
              >
                {groupedReport.type === "USER"
                  ? groupedReport.reportedUser?.username || "Không xác định"
                  : groupedReport.type === "POST"
                  ? groupedReport.reportedPost?.title || "Không xác định"
                  : groupedReport.reportedComment?.contentPreview || "Không xác định"}
              </Box>

              {/* Total Reports Count */}
              <Box sx={{ textAlign: "center", fontSize: "14px", fontWeight: 700, color: "#f59e0b" }}>
                {groupedReport.totalReports}
              </Box>

              {/* Latest Reason */}
              <Box
                sx={{
                  fontSize: "13px",
                  color: "#6b7280",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  textAlign: "center",
                }}
                title={groupedReport.latestReason}
              >
                {groupedReport.latestReason}
              </Box>

              {/* Created Date */}
              <Box sx={{ fontSize: "13px", color: "#6b7280", textAlign: "center" }}>
                {new Date(groupedReport.createdAt).toLocaleDateString("vi-VN")}
              </Box>

              {/* Actions */}
              <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                {onViewDetail && (
                  <button
                    onClick={() => onViewDetail(groupedReport.id)}
                    className="p-2 text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
                    title="Xem chi tiết"
                  >
                    <MdRemoveRedEye size={18} />
                  </button>
                )}

                {onApprove && (
                  <button
                    onClick={() => onApprove(groupedReport.id)}
                    disabled={loadingId === groupedReport.id}
                    className={`p-2 rounded-lg border transition ${
                      loadingId === groupedReport.id 
                        ? "opacity-50 cursor-not-allowed" 
                        : "text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
                    }`}
                    title="Phê duyệt (Xử lý vi phạm)"
                  >
                    {loadingId === groupedReport.id ? <MdAutorenew className="animate-spin" size={18} /> : <MdCheckCircle size={18} />}
                  </button>
                )}

                {onReject && (
                  <button
                    onClick={() => onReject(groupedReport.id)}
                    disabled={loadingId === groupedReport.id}
                    className={`p-2 rounded-lg border transition ${
                      loadingId === groupedReport.id 
                        ? "opacity-50 cursor-not-allowed" 
                        : "text-red-600 bg-red-50 border-red-200 hover:bg-red-100"
                    }`}
                    title="Từ chối (Bỏ qua)"
                  >
                    {loadingId === groupedReport.id ? <MdAutorenew className="animate-spin" size={18} /> : <MdClose size={18} />}
                  </button>
                )}

                <button
                  onClick={() => toggleExpanded(groupedReport.id)}
                  className={`p-2 text-gray-500 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition ${isExpanded ? 'rotate-180' : ''}`}
                  title="Mở rộng danh sách báo cáo"
                >
                  <MdExpandMore size={18} />
                </button>
              </Box>
            </Box>

            {/* Expanded Details */}
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <Box sx={{ bgcolor: "#f9fafb", p: 2, pl: 8, borderBottom: "1px solid #e5e7eb" }}>
                <p style={{ fontSize: "12px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", marginBottom: "12px" }}>
                  Danh sách {groupedReport.totalReports} báo cáo chi tiết
                </p>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {groupedReport.reportsList?.map((report, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        bgcolor: "white",
                        p: 1.5,
                        borderRadius: "8px",
                        border: "1px solid #e5e7eb",
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <Box
                        sx={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          bgcolor: "#e5e7eb",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "10px",
                          fontWeight: 700,
                          color: "#374151",
                        }}
                      >
                        {(report.reporter?.username || "?")[0].toUpperCase()}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <span style={{ fontSize: "13px", fontWeight: 600, color: "#111827", marginRight: "8px" }}>
                          {report.reporter?.username || "Ẩn danh"}
                        </span>
                        <span style={{ fontSize: "12px", color: "#6b7280" }}>
                          đã báo cáo vào {new Date(report.createdAt).toLocaleString("vi-VN")}
                        </span>
                      </Box>
                      <Box
                        sx={{
                          fontSize: "13px",
                          color: "#374151",
                          px: 1.5,
                          py: 0.5,
                          bgcolor: "#f3f4f6",
                          borderRadius: "4px",
                          borderLeft: "3px solid #f59e0b",
                        }}
                      >
                        "{report.reason}"
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Collapse>
          </Box>
        );
      })}
    </Box>
  );
};

export default GroupedReportTable;