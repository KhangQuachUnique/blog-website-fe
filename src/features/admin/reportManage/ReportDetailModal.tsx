import React from "react";
import { MdClose, MdContentPasteSearch } from "react-icons/md";
import { Box, CircularProgress } from "@mui/material";
import type { IReportResponse } from "../../../types/report";
import { useReportDetail } from "../../../hooks/useReport";

interface ReportDetailModalProps {
  open: boolean;
  reportId: number;
  report: IReportResponse;
  onClose: () => void;
}

/**
 * ReportDetailModal - Chỉ hiển thị nội dung của đối tượng bị báo cáo
 */
const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  open,
  reportId,
  report,
  onClose,
}) => {
  // Không cần state selectedTab nữa vì chỉ có 1 view
  const { data: isLoading } = useReportDetail(reportId, open);

  if (!open) return null;

  // Render nội dung dựa theo loại báo cáo
  const renderContent = () => {
    switch (report.type) {
      case "USER":
        return report.reportedUser ? (
          <Box sx={{ p: 2, textAlign: "center" }}>
             <p className="text-sm font-semibold text-gray-500 uppercase mb-6">
                Hồ sơ người dùng
              </p>
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center border-4 border-white shadow-lg">
              {report.reportedUser.avatarUrl ? (
                 <img 
                    src={report.reportedUser.avatarUrl} 
                    alt={report.reportedUser.username}
                    className="w-full h-full rounded-full object-cover"
                 />
              ) : (
                <span className="text-4xl font-bold text-blue-600">
                    {report.reportedUser.username?.[0]?.toUpperCase() || "U"}
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-800">
              {report.reportedUser.username}
            </h3>
            <div className="mt-4 inline-block px-4 py-1 bg-gray-100 rounded-full text-sm text-gray-600 font-mono">
              User ID: {report.reportedUser.id}
            </div>
          </Box>
        ) : (
          <div className="p-8 text-center text-gray-500 italic">
            Người dùng này không tồn tại hoặc đã bị xóa.
          </div>
        );

      case "POST":
        return report.reportedPost ? (
          <Box sx={{ p: 1 }}>
             <p className="text-sm font-semibold text-gray-500 uppercase mb-4">
                Bài viết vi phạm
              </p>
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              {/* Ảnh thumbnail nếu có */}
              {report.reportedPost.thumbnailUrl ? (
                <div className="w-full h-56 bg-gray-100">
                  <img
                    src={report.reportedPost.thumbnailUrl}
                    alt="Post thumbnail"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-32 bg-gray-50 flex items-center justify-center text-gray-400">
                    <span className="text-sm">Bài viết không có ảnh bìa</span>
                </div>
              )}
              
              <div className="p-5">
                <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                  {report.reportedPost.title}
                </h3>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                   <span className="text-xs font-semibold text-gray-500 uppercase">
                      ID Bài viết: {report.reportedPost.id}
                   </span>
                </div>
              </div>
            </div>
          </Box>
        ) : (
           <div className="p-8 text-center text-gray-500 italic">
            Bài viết này không tồn tại hoặc đã bị xóa.
          </div>
        );

      case "COMMENT":
        return report.reportedComment ? (
          <Box sx={{ p: 1 }}>
            <p className="text-sm font-semibold text-gray-500 uppercase mb-4">
                Bình luận vi phạm
            </p>
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 relative">

               <div className="absolute top-4 left-4 text-gray-200 text-6xl font-serif pointer-events-none">“</div>
               
               <p className="text-gray-800 text-lg relative z-10 font-medium leading-relaxed pl-4">
                {report.reportedComment.contentPreview || report.reportedComment.contentPreview}
              </p>

              <div className="absolute bottom-14 right-4 text-gray-200 text-6xl font-serif pointer-events-none leading-none">”</div>
              
               <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
                  <span className="text-xs font-mono text-gray-400 bg-white px-2 py-1 rounded border border-gray-200">
                    Comment ID: {report.reportedComment.id}
                  </span>
               </div>
            </div>
          </Box>
        ) : (
           <div className="p-8 text-center text-gray-500 italic">
            Bình luận này không tồn tại hoặc đã bị xóa.
          </div>
        );

      default:
        return <p className="text-gray-500 p-4 text-center">Loại báo cáo không xác định</p>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()} // Ngăn click xuyên qua modal
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <MdContentPasteSearch size={24} />
            </div>
            <div>
                <h2 className="text-xl font-bold text-gray-800">
                Nội dung báo cáo
                </h2>
                <p className="text-xs text-gray-500">
                    Report ID: #{report.id}
                </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <CircularProgress size={30} sx={{ color: '#F295B6' }} />
              <span className="text-sm text-gray-500">Đang tải nội dung...</span>
            </div>
          ) : (
            renderContent()
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-2xl flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition shadow-sm"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportDetailModal;