import React, { useState } from "react";
import { 
  MdClose, 
  MdContentPasteSearch, 
  MdHistory, 
  MdPerson, 
  MdArticle, 
  MdComment 
} from "react-icons/md";
import { Box } from "@mui/material";
import type { IGroupedReport } from "../../../types/report";

interface ReportDetailModalProps {
  open: boolean;
  groupedReport: IGroupedReport; 
  onClose: () => void;
}

const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  open,
  groupedReport,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'CONTENT' | 'HISTORY'>('CONTENT');

  if (!open) return null;

  // --- 1. RENDER NỘI DUNG VI PHẠM ---
  const renderContent = () => {
    switch (groupedReport.type) {
      case "USER":
        return groupedReport.reportedUser ? (
          <Box sx={{ p: 2, textAlign: "center" }}>
             <p className="text-sm font-semibold text-gray-500 uppercase mb-6 flex items-center justify-center gap-2">
                <MdPerson /> Hồ sơ người dùng
              </p>
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
              {groupedReport.reportedUser.avatarUrl ? (
                 <img 
                    src={groupedReport.reportedUser.avatarUrl} 
                    alt={groupedReport.reportedUser.username}
                    className="w-full h-full object-cover"
                 />
              ) : (
                <span className="text-4xl font-bold text-blue-600">
                    {groupedReport.reportedUser.username?.[0]?.toUpperCase() || "U"}
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-800">
              {groupedReport.reportedUser.username}
            </h3>
            <div className="mt-4 inline-block px-4 py-1 bg-gray-100 rounded-full text-sm text-gray-600 font-mono">
              User ID: {groupedReport.reportedUser.id}
            </div>
          </Box>
        ) : (
          <div className="p-8 text-center text-gray-500 italic">
            Người dùng này không tồn tại hoặc đã bị xóa.
          </div>
        );

      case "POST":
        return groupedReport.reportedPost ? (
          <Box sx={{ p: 1 }}>
             <p className="text-sm font-semibold text-gray-500 uppercase mb-4 flex items-center gap-2">
                <MdArticle /> Bài viết vi phạm
              </p>
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              {groupedReport.reportedPost.thumbnailUrl ? (
                <div className="w-full h-56 bg-gray-100">
                  <img
                    src={groupedReport.reportedPost.thumbnailUrl}
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
                  {groupedReport.reportedPost.title}
                </h3>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                   <span className="text-xs font-semibold text-gray-500 uppercase">
                      ID Bài viết: {groupedReport.reportedPost.id}
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
        return groupedReport.reportedComment ? (
          <Box sx={{ p: 1 }}>
            <p className="text-sm font-semibold text-gray-500 uppercase mb-4 flex items-center gap-2">
                <MdComment /> Bình luận vi phạm
            </p>
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 relative">
               <div className="absolute top-4 left-4 text-gray-200 text-6xl font-serif pointer-events-none">“</div>
               
               <p className="text-gray-800 text-lg relative z-10 font-medium leading-relaxed px-4 wrap-break-word">
                {groupedReport.reportedComment.contentPreview || "Nội dung bình luận"}
              </p>
              
               <div className="absolute bottom-14 right-4 text-gray-200 text-6xl font-serif pointer-events-none leading-none">”</div>

               <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end relative z-10">
                  <span className="text-xs font-mono text-gray-400 bg-white px-2 py-1 rounded border border-gray-200">
                    Comment ID: {groupedReport.reportedComment.id}
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

  // --- 2. RENDER LỊCH SỬ BÁO CÁO ---
  const renderHistory = () => {
    return (
        <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase px-2 mb-2 flex items-center gap-2">
                <MdHistory /> Danh sách người báo cáo ({groupedReport.totalReports})
            </h3>
            
            {(!groupedReport.reportsList || groupedReport.reportsList.length === 0) && (
                <p className="text-center text-gray-400 italic py-4">Không có dữ liệu chi tiết.</p>
            )}

            {groupedReport.reportsList?.map((report) => (
                <div key={report.id} className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold text-xs border border-pink-200">
                                {report.reporter?.username?.[0]?.toUpperCase() || "?"}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-800">
                                    {report.reporter?.username || "Ẩn danh"}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {new Date(report.createdAt).toLocaleString('vi-VN')}
                                </p>
                            </div>
                        </div>
                        <span className="text-[10px] font-mono bg-gray-50 border px-2 py-1 rounded text-gray-500">
                            #{report.id}
                        </span>
                    </div>
                    {/* Lý do báo cáo */}
                    <div className="pl-11">
                        <div className="bg-gray-50 p-2 rounded border border-gray-100 text-sm text-gray-700 italic relative">
                           "{report.reason}"
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
  }

  return (
    <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
                groupedReport.type === 'USER' ? 'bg-red-50 text-red-600' :
                groupedReport.type === 'COMMENT' ? 'bg-amber-50 text-amber-600' :
                'bg-blue-50 text-blue-600'
            }`}>
                {groupedReport.type === 'USER' ? <MdPerson size={24} /> :
                 groupedReport.type === 'COMMENT' ? <MdComment size={24} /> :
                 <MdArticle size={24} />}
            </div>
            <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Chi tiết vi phạm
                </h2>
                <p className="text-xs text-gray-500">
                    ID Nhóm: #{groupedReport.id} • {groupedReport.totalReports} báo cáo
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

        {/* Tabs Navigation */}
        <div className="flex border-b border-gray-100 px-6 bg-white sticky top-20 z-10">
            <button 
                onClick={() => setActiveTab('CONTENT')}
                className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2
                    ${activeTab === 'CONTENT' 
                        ? 'border-blue-500 text-blue-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
                <MdContentPasteSearch size={18}/>
                Nội dung
            </button>
            <button 
                onClick={() => setActiveTab('HISTORY')}
                className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2
                    ${activeTab === 'HISTORY' 
                        ? 'border-blue-500 text-blue-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
                <MdHistory size={18}/>
                Lịch sử
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === 'HISTORY' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                    {groupedReport.totalReports}
                </span>
            </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-white">
           {activeTab === 'CONTENT' ? renderContent() : renderHistory()}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end sticky bottom-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 hover:text-gray-900 transition shadow-sm"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportDetailModal;