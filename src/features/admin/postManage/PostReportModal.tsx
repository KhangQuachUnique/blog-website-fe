import React, { useState } from "react";
import { Dialog, Box, Button, CircularProgress } from "@mui/material";
import { MdCheckCircle, MdClose, MdAutorenew } from "react-icons/md";
import GenericTable from "../../../components/table/GenericTable";
import type { TableColumn } from "../../../types/table";
import { BLOOGIE_COLORS as colors } from "../../../types/table";
import type { IReportResponse, EReportType } from "../../../types/report";
import { useGetReportsByPost } from "../../../hooks/useReport";

interface PostReportModalProps {
  isOpen: boolean;
  postId: number;
  onClose: () => void;
  onApproveReport?: (reportId: number) => void;
  onRejectReport?: (reportId: number) => void;
}

/**
 * PostReportModal - Display all reports for a post in a modal
 * Shows reports in a table without action columns
 * Action buttons (Approve/Reject) are displayed in header
 */
const PostReportModal: React.FC<PostReportModalProps> = ({
  isOpen,
  postId,
  onClose,
  onApproveReport,
  onRejectReport,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { data: reports = [], isLoading: reportsLoading } = useGetReportsByPost(postId);

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
      width: "140px",
      align: "left",
      render: (report) => {
        const typeColor = getReportTypeColor(report.type);
        const typeLabel = getReportTypeLabel(report.type);
        return (
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              px: 2,
              py: 0.75,
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
            fontSize: "13px",
            color: colors.text,
            fontFamily: '"Quicksand", "Open Sans", sans-serif',
            maxWidth: "300px",
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
      width: "140px",
      align: "left",
      render: (report) => (
        <Box
          sx={{
            fontSize: "13px",
            color: colors.text,
            fontFamily: '"Quicksand", "Open Sans", sans-serif',
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Box
            sx={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              backgroundColor: colors.backgroundHover,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "11px",
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
            fontSize: "13px",
            color: colors.textSecondary,
            fontFamily: '"Quicksand", "Open Sans", sans-serif',
          }}
        >
          {new Date(report.createdAt).toLocaleDateString("vi-VN")}
        </Box>
      ),
    },
  ];

  const handleApprove = async () => {
    if (reports.length === 0 || !onApproveReport) return;
    
    setIsProcessing(true);
    try {
      // Process all reports sequentially
      for (const report of reports) {
        onApproveReport(report.id);
      }
      // Close modal after all reports are processed
      setTimeout(() => {
        onClose();
      }, 1000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (reports.length === 0 || !onRejectReport) return;
    
    setIsProcessing(true);
    try {
      // Process all reports sequentially
      for (const report of reports) {
        onRejectReport(report.id);
      }
      // Close modal after all reports are processed
      setTimeout(() => {
        onClose();
      }, 1000);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "12px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
          backgroundColor: "#ffffff",
        },
      }}
    >
      <Box
        sx={{
          p: 3,
          borderBottom: "2px solid #f3f4f6",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "20px",
              fontWeight: "600",
              color: "#1f2937",
              fontFamily: '"Quicksand", "Open Sans", sans-serif',
            }}
          >
            Báo cáo về bài viết
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </Box>

        {/* Action Buttons */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            mt: 2,
          }}
        >
          <Button
            onClick={handleApprove}
            disabled={reports.length === 0 || isProcessing}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              px: 2.5,
              py: 1,
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: "600",
              textTransform: "none",
              backgroundColor: "#ecfdf5",
              color: "#059669",
              border: "2px solid #a7f3d0",
              cursor: reports.length === 0 || isProcessing ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              "&:hover:not(:disabled)": {
                backgroundColor: "#d1fae5",
                borderColor: "#6ee7b7",
              },
              "&:disabled": {
                opacity: 0.5,
              },
            }}
          >
            {isProcessing ? (
              <MdAutorenew className="animate-spin" size={18} />
            ) : (
              <MdCheckCircle size={18} />
            )}
            Chấp thuận tất cả báo cáo
          </Button>

          <Button
            onClick={handleReject}
            disabled={reports.length === 0 || isProcessing}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              px: 2.5,
              py: 1,
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: "600",
              textTransform: "none",
              backgroundColor: "#fef2f2",
              color: "#dc2626",
              border: "2px solid #fecaca",
              cursor: reports.length === 0 || isProcessing ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              "&:hover:not(:disabled)": {
                backgroundColor: "#fee2e2",
                borderColor: "#fca5a5",
              },
              "&:disabled": {
                opacity: 0.5,
              },
            }}
          >
            {isProcessing ? (
              <MdAutorenew className="animate-spin" size={18} />
            ) : (
              <MdClose size={18} />
            )}
            Từ chối tất cả báo cáo
          </Button>
        </Box>

        {reports.length > 0 && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              backgroundColor: "#e0f2fe",
              border: "2px solid #a5f3fc",
              borderRadius: "6px",
              fontSize: "13px",
              color: "#0c4a6e",
              fontFamily: '"Quicksand", "Open Sans", sans-serif',
            }}
          >
            Có {reports.length} báo cáo cần xử lý
          </Box>
        )}
      </Box>

      {/* Table Content */}
      <Box sx={{ p: 3, maxHeight: "500px", overflowY: "auto" }}>
        {reportsLoading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "300px",
            }}
          >
            <CircularProgress />
          </Box>
        ) : reports.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 6,
              color: colors.textSecondary,
              fontFamily: '"Quicksand", "Open Sans", sans-serif',
            }}
          >
            <p style={{ fontSize: "16px", margin: 0 }}>Không có báo cáo nào</p>
          </Box>
        ) : (
          <GenericTable
            data={reports}
            columns={columns}
            emptyMessage="Không có báo cáo nào"
          />
        )}
      </Box>
    </Dialog>
  );
};

export default PostReportModal;
