import React, { useState } from "react";
import { Dialog, Box, Button, CircularProgress } from "@mui/material";
import { MdCheckCircle, MdClose, MdAutorenew } from "react-icons/md";
import GenericTable from "../../../components/table/GenericTable";
import type { TableColumn } from "../../../types/table";
import { BLOOGIE_COLORS as colors } from "../../../types/table";
import { type IReportResponse, EReportType, EReportStatus } from "../../../types/report";
import { useGetReportsByPost } from "../../../hooks/useReport";

interface PostReportModalProps {
  isOpen: boolean;
  postId: number;
  onClose: () => void;

  onApproveReport?: (id: number) => void;
  onRejectReport?: (id: number) => void;
}

const PostReportModal: React.FC<PostReportModalProps> = ({
  isOpen,
  postId,
  onClose,
  onApproveReport,
  onRejectReport,
}) => {
  // State filter
  const [filterStatus, setFilterStatus] = useState<EReportStatus | undefined>(EReportStatus.PENDING);
  const [isProcessing, setIsProcessing] = useState(false);
  const { data: reports = [], isLoading: reportsLoading } = useGetReportsByPost(postId, filterStatus);

  // --- HELPER FUNCTIONS ---
  const getReportTypeLabel = (type: EReportType): string => {
    const typeMap: Record<string, string> = {
      USER: "Người dùng",
      POST: "Bài viết",
      COMMENT: "Bình luận",
    };
    return typeMap[type] || type;
  };

  const getReportTypeColor = (type: EReportType) => {
    const colorMap: Record<string, { bg: string; border: string; text: string }> = {
      USER: { bg: "#fef2f2", border: "#fecaca", text: "#dc2626" },
      POST: { bg: "#f0fdf4", border: "#bbf7d0", text: "#16a34a" },
      COMMENT: { bg: "#fffbeb", border: "#fde68a", text: "#b45309" },
    };
    return colorMap[type] || colorMap.POST;
  };

  // --- HANDLERS (Đã sửa logic Batch Processing) ---

  const handleApprove = async () => {
    if (!onApproveReport) return;
    setIsProcessing(true);
    try {
      await onApproveReport(postId);

      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!onRejectReport) return;
    setIsProcessing(true);
    try {
      await onRejectReport(postId);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  // --- TABLE COLUMNS ---
  const columns: TableColumn<IReportResponse>[] = [
    {
      id: "id",
      label: "ID",
      width: "70px",
      align: "left",
      render: (report) => (
        <Box sx={{ fontWeight: "600", color: colors.text, fontFamily: '"Quicksand", "Open Sans", sans-serif' }}>
          #{report.id}
        </Box>
      ),
    },
    {
      id: "type",
      label: "Loại",
      width: "100px",
      align: "left",
      render: (report) => {
        const typeColor = getReportTypeColor(report.type);
        return (
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              px: 1.5,
              py: 0.5,
              borderRadius: "9999px",
              fontSize: "11px",
              fontWeight: "600",
              textTransform: "uppercase",
              backgroundColor: typeColor.bg,
              color: typeColor.text,
              border: `1px solid ${typeColor.border}`,
              fontFamily: '"Outfit", "Montserrat", sans-serif',
            }}
          >
            {getReportTypeLabel(report.type)}
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
      label: "Người báo cáo",
      width: "140px",
      align: "left",
      render: (report) => (
        <Box sx={{ fontSize: "13px", display: "flex", alignItems: "center", gap: 1 }}>
           <Box
            sx={{
              width: "24px", height: "24px", borderRadius: "50%",
              backgroundColor: colors.backgroundHover,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "11px", fontWeight: "600", color: colors.text,
            }}
          >
            {(report.reporter?.username || "?")[0].toUpperCase()}
          </Box>
          {report.reporter?.username || "Ẩn danh"}
        </Box>
      ),
    },
    {
      id: "status",
      label: "Trạng thái",
      width: "120px",
      align: "center",
      render: (report) => {
        const normalizedStatus = String(report.status).toUpperCase();
        
        let statusConfig = { label: "Không xác định", bg: "#f3f4f6", color: "#4b5563", border: "#e5e7eb" };

        if (normalizedStatus === "PENDING") {
           statusConfig = { label: "Chờ xử lý", bg: "#fff7ed", color: "#c2410c", border: "#ffedd5" };
        } else if (normalizedStatus === "RESOLVED") {
           statusConfig = { label: "Đã giải quyết", bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" };
        }

        return (
          <Box
            sx={{
              display: "inline-block",
              px: 1.5, py: 0.5, borderRadius: "6px", fontSize: "11px", fontWeight: "600",
              backgroundColor: statusConfig.bg,
              color: statusConfig.color,
              border: `1px solid ${statusConfig.border}`,
              whiteSpace: "nowrap"
            }}
          >
            {statusConfig.label}
          </Box>
        );
      },
    },
    {
      id: "createdAt",
      label: "Ngày tạo",
      width: "100px",
      align: "center",
      render: (report) => (
        <Box sx={{ fontSize: "12px", color: colors.textSecondary }}>
          {new Date(report.createdAt).toLocaleDateString("vi-VN")}
        </Box>
      ),
    },
  ];

  // Helper render nút Filter
  const FilterButton = ({ label, value, color }: { label: string, value: EReportStatus | undefined, color: string }) => {
    const isActive = filterStatus === value;
    return (
      <Button
        onClick={() => setFilterStatus(value)}
        sx={{
          textTransform: "none",
          fontWeight: isActive ? "700" : "500",
          fontSize: "13px",
          color: isActive ? "#fff" : "#4b5563",
          backgroundColor: isActive ? color : "transparent",
          border: isActive ? `1px solid ${color}` : "1px solid #e5e7eb",
          borderRadius: "8px",
          px: 2,
          "&:hover": {
            backgroundColor: isActive ? color : "#f3f4f6",
          }
        }}
      >
        {label}
      </Button>
    );
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: "16px", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" },
      }}
    >
      <Box sx={{ p: 3, borderBottom: "1px solid #f3f4f6" }}>
        {/* Header Title */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "700", color: "#111827", fontFamily: '"Outfit", sans-serif' }}>
            Chi tiết báo cáo
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "#6b7280" }}>✕</button>
        </Box>

        {/* Filter Tabs */}
        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
          <FilterButton label="Chờ xử lý" value={EReportStatus.PENDING} color="#f59e0b" />
          <FilterButton label="Đã giải quyết" value={EReportStatus.RESOLVED} color="#10b981" />
          <FilterButton label="Tất cả" value={undefined} color="#6366f1" />
        </Box>

        {/* Action Buttons */}
        {filterStatus === EReportStatus.PENDING && reports.length > 0 && (
          <Box sx={{ display: "flex", gap: 2, p: 2, backgroundColor: "#fff7ed", borderRadius: "8px", border: "1px solid #ffedd5" }}>
            <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: 1, color: "#9a3412", fontSize: "13px", fontWeight: "600" }}>
              <MdAutorenew /> Có {reports.length} báo cáo cần xử lý
            </Box>
            
            <Button
              onClick={handleApprove}
              disabled={isProcessing}
              sx={{
                textTransform: "none", fontWeight: "600", fontSize: "13px",
                bgcolor: "#10b981", color: "white", px: 2, borderRadius: "6px",
                "&:hover": { bgcolor: "#059669" },
                "&:disabled": { opacity: 0.7 }
              }}
            >
              {isProcessing ? <CircularProgress size={16} color="inherit" /> : <MdCheckCircle size={16} style={{ marginRight: 4 }} />}
              Chấp thuận tất cả
            </Button>

            <Button
              onClick={handleReject}
              disabled={isProcessing}
              sx={{
                textTransform: "none", fontWeight: "600", fontSize: "13px",
                bgcolor: "white", color: "#ef4444", border: "1px solid #ef4444", px: 2, borderRadius: "6px",
                "&:hover": { bgcolor: "#fef2f2" },
                "&:disabled": { opacity: 0.7 }
              }}
            >
              {isProcessing ? <CircularProgress size={16} color="inherit" /> : <MdClose size={16} style={{ marginRight: 4 }} />}
              Từ chối tất cả
            </Button>
          </Box>
        )}
      </Box>

      {/* Table Content */}
      <Box sx={{ p: 3, minHeight: "300px", maxHeight: "500px", overflowY: "auto" }}>
        {reportsLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px" }}>
            <CircularProgress size={30} />
          </Box>
        ) : (
          <GenericTable
            data={reports}
            columns={columns}
            emptyMessage={
                filterStatus === EReportStatus.PENDING ? "Không có báo cáo nào đang chờ xử lý" :
                filterStatus === EReportStatus.RESOLVED ? "Chưa có báo cáo nào được giải quyết" :
                "Không có dữ liệu báo cáo"
            }
          />
        )}
      </Box>
    </Dialog>
  );
};

export default PostReportModal;