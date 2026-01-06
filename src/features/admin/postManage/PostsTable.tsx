import React, { useState } from "react";
import { MdVisibilityOff, MdVisibility, MdAutorenew, MdInfoOutline } from "react-icons/md";
import { Box } from "@mui/material";
import GenericTable from "../../../components/table/GenericTable";
import type { TableColumn, ActionColumn } from "../../../types/table";
import { BLOOGIE_COLORS as colors } from "../../../types/table";
import { type IPostResponseDto, EBlogPostStatus } from "../../../types/post";
import PostReportModal from "./PostReportModal";

interface PostsTableProps {
  posts: IPostResponseDto[];
  onHide?: (postId: number) => void;
  onRestore?: (postId: number) => void;
  onApproveReport?: (reportId: number) => void;
  onRejectReport?: (reportId: number) => void;
  loadingId: number | null;
  emptyMessage?: string;
}

const PostsTable: React.FC<PostsTableProps> = ({
  posts,
  onHide,
  onRestore,
  onApproveReport,
  onRejectReport,
  loadingId,
  emptyMessage = "Không có bài viết nào",
}) => {

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

  const getStatusConfig = (status: EBlogPostStatus) => {
    switch (status) {
      case EBlogPostStatus.ACTIVE:
        return { color: colors.statusActive, icon: "✓" };
      case EBlogPostStatus.HIDDEN:
        return { color: colors.statusHidden, icon: "👁️" };
      default:
        return { color: colors.statusHidden, icon: "" };
    }
  };

  const handleOpenReportModal = (postId: number) => {
    setSelectedPostId(postId);
    setReportModalOpen(true);
  };

  const handleCloseReportModal = () => {
    setReportModalOpen(false);
    setSelectedPostId(null);
  };

  const columns: TableColumn<IPostResponseDto>[] = [
    {
      id: "id",
      label: "ID",
      width: "80px",
      align: "left",
      render: (post) => (
        <Box sx={{ fontWeight: "600", color: colors.text, fontFamily: '"Quicksand", "Open Sans", sans-serif' }}>
          #{post.id}
        </Box>
      ),
    },
    {
      id: "author",
      label: "Người đăng",
      width: "160px",
      align: "left",
      render: (post) => {
        const author = post.author || { username: "Ẩn danh", avatarUrl: null }; 
        
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            {author.avatarUrl ? (
              <Box
                component="img"
                src={author.avatarUrl}
                alt={author.username}
                sx={{
                  width: "28px", height: "28px", borderRadius: "50%",
                  objectFit: "cover", border: "1px solid #e5e7eb"
                }}
              />
            ) : (
              <Box
                sx={{
                  width: "28px", height: "28px", borderRadius: "50%",
                  backgroundColor: "#f3f4f6", color: "#6b7280",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "11px", fontWeight: "700", border: "1px solid #e5e7eb"
                }}
              >
                {(author.username?.[0] || "?").toUpperCase()}
              </Box>
            )}
            
            <Box 
              sx={{ 
                fontSize: "13px", fontWeight: "500", color: colors.text,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "110px",
                fontFamily: '"Quicksand", sans-serif'
              }}
              title={author.username}
            >
              {author.username}
            </Box>
          </Box>
        );
      },
    },
    {
      id: "title",
      label: "Tiêu đề",
      align: "left",
      render: (post) => (
        <Box
          sx={{
            fontSize: "14px",
            fontWeight: "500",
            color: colors.text,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            wordBreak: "break-word",
            fontFamily: '"Quicksand", "Open Sans", sans-serif',
          }}
          title={post.title}
        >
          {post.title}
        </Box>
      ),
    },
    {
      id: "createdAt",
      label: "Ngày đăng",
      align: "left",
      render: (post) => (
        <Box sx={{ fontSize: "14px", color: colors.textSecondary, fontFamily: '"Quicksand", "Open Sans", sans-serif' }}>
          {new Date(post.createdAt).toLocaleDateString("vi-VN")}
        </Box>
      ),
    },
    {
      id: "status",
      label: "Trạng thái",
      align: "center",
      render: (post) => {
        const { color, icon } = getStatusConfig(post.status);
        return (
          <Box
            component="span"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              px: 3,
              py: 1,
              borderRadius: "9999px",
              fontSize: "11px",
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              backgroundColor: color.badge,
              color: color.text,
              border: `1px solid ${color.border}`,
              fontFamily: '"Outfit", "Montserrat", sans-serif',
            }}
          >
            <span>{icon}</span>
            {post.status}
          </Box>
        );
      },
    },
    {
      id: "reports",
      label: "Báo cáo",
      width: "100px",
      align: "center",
      render: (post) => (
        <Box
          onClick={(e) => {
            e.stopPropagation();
            handleOpenReportModal(post.id);
          }}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "8px",
            color: "#0891b2",
            backgroundColor: "#ecf7ff",
            border: "2px solid #a5f3fc",
            borderRadius: "6px",
            cursor: "pointer",
            transition: "all 0.2s",
            "&:hover": {
              backgroundColor: "#cffafe",
              borderColor: "#67e8f9",
            },
          }}
          title="Xem chi tiết báo cáo"
        >
          <MdInfoOutline size={18} />
        </Box>
      ),
    },
  ];

  const actionColumns: ActionColumn<IPostResponseDto>[] = [];

  if (onHide && onRestore) {
    actionColumns.push({
      id: "management-column",
      label: "Thao tác",
      width: "120px",
      align: "center",
      actions: [
        {
          id: "hide-restore",
          visible: (post) => post.status === EBlogPostStatus.ACTIVE || post.status === EBlogPostStatus.HIDDEN,
          disabled: (post) => loadingId === post.id,
          icon: (post) => {
            const isLoading = loadingId === post.id;
            const isActive = post.status === EBlogPostStatus.ACTIVE;
            
            const styleConfig = isActive
              ? { color: "#b45309", bg: "#fffbeb", border: "#fde68a", hoverBg: "#fef3c7", hoverBorder: "#fcd34d" }
              : { color: "#059669", bg: "#ecfdf5", border: "#a7f3d0", hoverBg: "#d1fae5", hoverBorder: "#6ee7b7" };

            return (
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "8px",
                  color: styleConfig.color,
                  backgroundColor: styleConfig.bg,
                  border: `2px solid ${styleConfig.border}`,
                  borderRadius: "6px",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                  "&:hover:not(:disabled)": {
                    backgroundColor: styleConfig.hoverBg,
                    borderColor: styleConfig.hoverBorder,
                  },
                }}
              >
                {isLoading ? (
                  <MdAutorenew className="animate-spin" size={18} />
                ) : isActive ? (
                  <MdVisibilityOff size={18} />
                ) : (
                  <MdVisibility size={18} />
                )}
              </Box>
            );
          },
          onClick: (post) => {
            if (post.status === EBlogPostStatus.ACTIVE) {
              onHide(post.id);
            } else if (post.status === EBlogPostStatus.HIDDEN) {
              onRestore(post.id);
            }
          },
        },
      ],
    });
  }

  return (
    <>
      <GenericTable
        data={posts}
        columns={columns}
        actionColumns={actionColumns}
        emptyMessage={emptyMessage}
      />
      
      {selectedPostId && (
        <PostReportModal
          isOpen={reportModalOpen}
          postId={selectedPostId}
          onClose={handleCloseReportModal}
          onApproveReport={onApproveReport}
          onRejectReport={onRejectReport}
        />
      )}
    </>
  );
};

export default PostsTable;