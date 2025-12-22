import React from "react";
import { MdCheckCircle, MdClose, MdAutorenew } from "react-icons/md";
import { Box } from "@mui/material";
import GenericTable from "../../../components/table/GenericTable";
import type { TableColumn, TableAction } from "../../../types/table";
import { BLOOGIE_COLORS as colors } from "../../../types/table";
import type { IReportResponse, EReportType } from "../../../types/report";

interface ReportTableProps {
  reports: IReportResponse[];
  onApprove: (reportId: number) => void;
  onReject: (reportId: number) => void;
  loadingId: number | null;
  emptyMessage?: string;
}

/**
 * ReportTable - A wrapper around GenericTable customized for reports
 * Displays report information with action buttons (APPROVE/REJECT)
 */
const ReportTable: React.FC<ReportTableProps> = ({
  reports,
  onApprove,
  onReject,
  loadingId,
  emptyMessage = "Không có báo cáo nào",
}) => {
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
      USER: {
        bg: "#fef2f2",
        border: "#fecaca",
        text: "#dc2626",
      },
      POST: {
        bg: "#f0fdf4",
        border: "#bbf7d0",
        text: "#16a34a",
      },
      COMMENT: {
        bg: "#fffbeb",
        border: "#fde68a",
        text: "#b45309",
      },
    };
    return colorMap[type] || colorMap.POST;
  };

  const columns: TableColumn<IReportResponse>[] = [
    {
      id: "id",
      label: "ID",
      width: "70px",
      align: "left",
      render: (report) => (
        <Box
          sx={{
            fontWeight: "600",
            color: colors.text,
            fontFamily: '"Quicksand", "Open Sans", sans-serif',
          }}
        >
          #{report.id}
        </Box>
      ),
    },
    {
      id: "type",
      label: "Loại",
      width: "120px",
      align: "left",
      render: (report) => {
        const typeColor = getReportTypeColor(report.type);
        const typeLabel = getReportTypeLabel(report.type);
        return (
          <Box
            component="span"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              px: 2.5,
              py: 1,
              borderRadius: "9999px",
              fontSize: "12px",
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              backgroundColor: typeColor.bg,
              color: typeColor.text,
              border: `1.5px solid ${typeColor.border}`,
              fontFamily: '"Outfit", "Montserrat", sans-serif',
            }}
          >
            {typeLabel}
          </Box>
        );
      },
    },
    {
      id: "reason",
      label: "Lý do",
      align: "left",
      render: (report) => (
        <Box
          sx={{
            fontSize: "14px",
            color: colors.text,
            fontFamily: '"Quicksand", "Open Sans", sans-serif',
            maxWidth: "250px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={report.reason}
        >
          {report.reason}
        </Box>
      ),
    },
    {
      id: "reporter",
      label: "Người report",
      width: "150px",
      align: "left",
      render: (report) => (
        <Box
          sx={{
            fontSize: "14px",
            color: colors.text,
            fontFamily: '"Quicksand", "Open Sans", sans-serif',
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Box
            sx={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              backgroundColor: colors.backgroundHover,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: "600",
              color: colors.text,
            }}
          >
            {(report.reporter?.username || "?")[0].toUpperCase()}
          </Box>
          {report.reporter?.username || "Ẩn danh"}
        </Box>
      ),
    },
    {
      id: "createdAt",
      label: "Ngày report",
      width: "130px",
      align: "center",
      render: (report) => (
        <Box
          sx={{
            fontSize: "14px",
            color: colors.textSecondary,
            fontFamily: '"Quicksand", "Open Sans", sans-serif',
          }}
        >
          {new Date(report.createdAt).toLocaleDateString("vi-VN")}
        </Box>
      ),
    },
  ];

  const actions: TableAction<IReportResponse>[] = [
    {
      id: "approve",
      tooltip: "Phê duyệt báo cáo",
      disabled: (report) => loadingId === report.id,
      icon: (report) => {
        const isLoading = loadingId === report.id;
        return (
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "8px",
              color: "#059669",
              backgroundColor: "#ecfdf5",
              border: "2px solid #a7f3d0",
              borderRadius: "6px",
              cursor: isLoading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              "&:hover:not(:disabled)": {
                backgroundColor: "#d1fae5",
                borderColor: "#6ee7b7",
              },
            }}
          >
            {isLoading ? (
              <MdAutorenew className="animate-spin" size={18} />
            ) : (
              <MdCheckCircle size={18} />
            )}
          </Box>
        );
      },
      onClick: (report) => {
        onApprove(report.id);
      },
    },
    {
      id: "reject",
      tooltip: "Từ chối báo cáo",
      disabled: (report) => loadingId === report.id,
      icon: (report) => {
        const isLoading = loadingId === report.id;
        return (
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "8px",
              color: "#dc2626",
              backgroundColor: "#fef2f2",
              border: "2px solid #fecaca",
              borderRadius: "6px",
              cursor: isLoading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              "&:hover:not(:disabled)": {
                backgroundColor: "#fee2e2",
                borderColor: "#fca5a5",
              },
            }}
          >
            {isLoading ? (
              <MdAutorenew className="animate-spin" size={18} />
            ) : (
              <MdClose size={18} />
            )}
          </Box>
        );
      },
      onClick: (report) => {
        onReject(report.id);
      },
    },
  ];

  return (
    <GenericTable
      data={reports}
      columns={columns}
      actions={actions}
      emptyMessage={emptyMessage}
    />
  );
};

export default ReportTable;
