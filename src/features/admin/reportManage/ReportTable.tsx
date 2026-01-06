import React from "react";
import { MdCheckCircle, MdClose, MdAutorenew, MdRemoveRedEye } from "react-icons/md";
import { Box } from "@mui/material";
import GenericTable from "../../../components/table/GenericTable";
import type { TableColumn, ActionColumn } from "../../../types/table";
import { BLOOGIE_COLORS as colors } from "../../../types/table";
import type { IGroupedReport, EReportType } from "../../../types/report";

interface ReportTableProps {
  reports: IGroupedReport[];
  onViewDetail?: (reportId: number) => void;
  onApprove?: (reportId: number) => void;
  onReject?: (reportId: number) => void;
  loadingId: number | null;
  emptyMessage?: string;
  isResolved?: boolean;
}

const ReportTable: React.FC<ReportTableProps> = ({
  reports,
  onViewDetail,
  onApprove,
  onReject,
  loadingId,
  emptyMessage = "Không có báo cáo nào",
  isResolved = false,
}) => {
  // --- HELPER FUNCTIONS ---
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

  // --- COLUMNS CONFIGURATION ---
  const columns: TableColumn<IGroupedReport>[] = [
    {
      id: "id",
      label: "ID",
      width: "60px",
      align: "left",
      render: (report) => (
        <Box
          sx={{
            fontWeight: "600",
            color: colors.text,
            fontFamily: '"Quicksand", sans-serif',
          }}
        >
          #{report.id}
        </Box>
      ),
    },
    {
      id: "type",
      label: "Loại",
      width: "110px",
      align: "left",
      render: (report) => {
        const typeColor = getReportTypeColor(report.type);
        return (
          <Box
            component="span"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              px: 1.5,
              py: 0.5,
              borderRadius: "6px",
              fontSize: "11px",
              fontWeight: "700",
              textTransform: "uppercase",
              backgroundColor: typeColor.bg,
              color: typeColor.text,
              border: `1px solid ${typeColor.border}`,
              fontFamily: '"Outfit", sans-serif',
            }}
          >
            {getReportTypeLabel(report.type)}
          </Box>
        );
      },
    },
    {
      id: "target" as keyof IGroupedReport,
      label: "Đối tượng vi phạm",
      align: "left",
      render: (report) => {
        let content: string | React.ReactNode = "Không xác định";
        if (report.type === "USER") {
          content = report.reportedUser?.username || "N/A";
        } else if (report.type === "POST") {
          content = report.reportedPost?.title || "N/A";
        } else if (report.type === "COMMENT") {
          const contentText = report.reportedComment?.contentPreview || "N/A";
          content = (
            <span className="flex items-center gap-2">
              {contentText}
              {report.reportedComment?.isDeleted && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 whitespace-nowrap">
                  Đã xóa
                </span>
              )}
            </span>
          );
        }

        return (
          <Box
            sx={{
              fontSize: "14px",
              fontWeight: "500",
              color: "#111827",
              fontFamily: '"Quicksand", sans-serif',
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "220px", 
            }}
            title={typeof content === 'string' ? content : ''}
          >
            {content}
          </Box>
        );
      },
    },
    {
      id: "totalReports",
      label: "Số lượng",
      width: "90px",
      align: "center",
      render: (report) => (
        <Box
          sx={{
            fontWeight: "700",
            color: "#f59e0b",
            fontSize: "14px",
            fontFamily: '"Quicksand", sans-serif',
          }}
        >
          {report.totalReports}
        </Box>
      ),
    },
    {
      id: "latestReason",
      label: "Lý do gần nhất",
      align: "left",
      render: (report) => (
        <Box
          sx={{
            fontSize: "13px",
            color: "#6b7280",
            fontStyle: "italic",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: "180px",
            fontFamily: '"Quicksand", sans-serif',
          }}
          title={report.latestReason}
        >
          "{report.latestReason}"
        </Box>
      ),
    },
    {
      id: "createdAt",
      label: "Ngày báo cáo",
      width: "110px",
      align: "center",
      render: (report) => (
        <Box
          sx={{
            fontSize: "13px",
            color: colors.textSecondary,
            fontFamily: '"Quicksand", sans-serif',
          }}
        >
          {new Date(report.createdAt).toLocaleDateString("vi-VN")}
        </Box>
      ),
    },
  ];

  if (isResolved) {
    columns.push({
      id: "resolvedAt",
      label: "Ngày xử lý",
      width: "110px",
      align: "center",
      render: (report) => (
        <Box sx={{ fontSize: "13px", color: colors.textSecondary, fontWeight: "600", fontFamily: '"Quicksand", sans-serif' }}>
          {report.resolvedAt 
            ? new Date(report.resolvedAt).toLocaleDateString("vi-VN") 
            : "-"}
        </Box>
      ),
    });
  }

  // --- ACTIONS CONFIGURATION ---
  const actionColumns: ActionColumn<IGroupedReport>[] = [];

  // 1. Cột Xem Chi Tiết
  if (onViewDetail) {
    actionColumns.push({
      id: "view-detail-column",
      label: "Chi tiết",
      width: "80px",
      align: "center",
      actions: [
        {
          id: "view-detail",
          tooltip: "Xem chi tiết vi phạm",
          icon: () => (
            <Box
              sx={{
                display: "inline-flex",
                p: "8px",
                color: "#2563eb",
                bgcolor: "#eff6ff",
                border: "1px solid #93c5fd",
                borderRadius: "6px",
                transition: "all 0.2s",
                "&:hover": { bgcolor: "#dbeafe", borderColor: "#60a5fa" },
              }}
            >
              <MdRemoveRedEye size={18} />
            </Box>
          ),
          onClick: (report) => onViewDetail(report.id),
        },
      ],
    });
  }

  // 2. Cột Duyệt (Chấp nhận báo cáo -> Xử lý vi phạm)
  if (onApprove) {
    actionColumns.push({
      id: "approve-column",
      label: "Duyệt",
      width: "80px",
      align: "center",
      actions: [
        {
          id: "approve",
          tooltip: "Chấp nhận báo cáo (Xử lý vi phạm)",
          disabled: (report) => loadingId === report.id,
          icon: (report) => {
            const isLoading = loadingId === report.id;
            return (
              <Box
                sx={{
                  display: "inline-flex",
                  p: "8px",
                  color: "#059669",
                  bgcolor: "#ecfdf5",
                  border: "1px solid #a7f3d0",
                  borderRadius: "6px",
                  opacity: isLoading ? 0.6 : 1,
                  cursor: isLoading ? "not-allowed" : "pointer",
                  "&:hover:not(:disabled)": { bgcolor: "#d1fae5", borderColor: "#6ee7b7" },
                }}
              >
                {isLoading ? <MdAutorenew className="animate-spin" size={18} /> : <MdCheckCircle size={18} />}
              </Box>
            );
          },
          onClick: (report) => onApprove(report.id),
        },
      ],
    });
  }

  // 3. Cột Từ chối (Bỏ qua báo cáo -> Giữ nội dung)
  if (onReject) {
    actionColumns.push({
      id: "reject-column",
      label: "Từ chối",
      width: "80px",
      align: "center",
      actions: [
        {
          id: "reject",
          tooltip: "Từ chối báo cáo (Bỏ qua)",
          disabled: (report) => loadingId === report.id,
          icon: (report) => {
            const isLoading = loadingId === report.id;
            return (
              <Box
                sx={{
                  display: "inline-flex",
                  p: "8px",
                  color: "#dc2626",
                  bgcolor: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: "6px",
                  opacity: isLoading ? 0.6 : 1,
                  cursor: isLoading ? "not-allowed" : "pointer",
                  "&:hover:not(:disabled)": { bgcolor: "#fee2e2", borderColor: "#fca5a5" },
                }}
              >
                {isLoading ? <MdAutorenew className="animate-spin" size={18} /> : <MdClose size={18} />}
              </Box>
            );
          },
          onClick: (report) => onReject(report.id),
        },
      ],
    });
  }

  return (
    <GenericTable
      data={reports}
      columns={columns}
      actionColumns={actionColumns}
      emptyMessage={emptyMessage}
    />
  );
};

export default ReportTable;