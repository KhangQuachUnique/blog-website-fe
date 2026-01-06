import React, { useState } from "react";
import { Share2, Flag, Bookmark, Edit, Trash2 } from "lucide-react";
import { useCheckSaved, useToggleSavePost } from "../../hooks/useSavedPost";
import ReportButton from "../report/ReportButton";
import { EReportType } from "../../types/report";
import VoteButton from "../VoteButton";
import type { IVotesSummaryDto } from "../../types/user-vote";
import { useToast } from "../../contexts/toast";
import { useLoginRequired } from "../../hooks/useLoginRequired";
import { RepostButton } from "../repost";
import { MoreButton } from "../moreButton";
import type { MoreMenuItem } from "../moreButton";
import { EPostType, type IPostResponseDto } from "../../types/post";
import DeleteConfirmDialog from "../deleteConfirmButton";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useDeletePost } from "../../hooks/usePost";

// ============================================
// 🎨 BLOOKIE DESIGN SYSTEM - PASTEL PINK EDITION
// ============================================
const THEME = {
  // Core Colors
  primary: "#F295B6",
  secondary: "#FFB8D1",
  tertiary: "#FFE7F0",
  cream: "#FFF8FA",
  text: "#4A3C42",
  textMuted: "#8B7B82",
  white: "#FFFFFF",

  // Semantic
  upvote: "#F295B6",
  upvoteActive: "#E8779F",
  downvote: "#B8A5AB",
  downvoteActive: "#9B8A90",

  // Shadows
  shadowSoft: "0 2px 12px rgba(242, 149, 182, 0.15)",
  shadowMedium: "0 4px 20px rgba(242, 149, 182, 0.2)",
  shadowStrong: "0 8px 32px rgba(242, 149, 182, 0.25)",
};

// ============================================
// 🎪 MAIN COMPONENT
// ============================================
interface InteractBarProps {
  postId: number;
  userId: number;
  /** Vote data từ post response */
  votes?: IVotesSummaryDto;
  totalComments?: number;
  /** Post data để truyền vào RepostButton (chứa postType bên trong) */
  post?: IPostResponseDto;
}

const InteractBar: React.FC<InteractBarProps> = ({
  postId,
  userId,
  votes,
  // postType không cần dùng trực tiếp ở đây, RepostButton tự xử lý
  post,
}) => {
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);
  const { showToast } = useToast();
  const { requireLogin } = useLoginRequired();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const isLoggedIn = userId > 0;
  const isOwnPost = post && currentUser && post.author.id === currentUser.id;

  // Delete post hook
  const { mutate: deletePostMutation } = useDeletePost(
    post?.community
      ? typeof post.community === "string"
        ? 0
        : post.community.id
      : 0,
    currentUser?.id
  );

  // 🔖 Saved post hooks
  const { data: isSaved = false } = useCheckSaved(
    isLoggedIn ? userId : null,
    postId
  );
  const { mutate: toggleSave, isPending: isSaving } = useToggleSavePost();

  // Bookmark with login check
  const onBookmarkClick = () => {
    if (!requireLogin({ message: "Vui lòng đăng nhập để lưu bài viết" }))
      return;
    toggleSave(
      { userId, postId },
      {
        onSuccess: (result) => {
          showToast({
            type: "success",
            message: result.message,
            duration: 2000,
          });
        },
      }
    );
  };

  // Menu handlers
  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
    showToast({
      type: "success",
      message: "Link đã được sao chép vào clipboard",
      duration: 2000,
    });
  };

  const handleEdit = () => {
    navigate(`/post/edit/${postId}`);
  };

  const handleDelete = () => {
    deletePostMutation(postId, {
      onSuccess: () => {
        showToast({
          type: "success",
          message: "Xóa bài viết thành công",
          duration: 2000,
        });
        setShowDeleteDialog(false);
      },
      onError: () => {
        showToast({
          type: "error",
          message: "Không thể xóa bài viết",
          duration: 2000,
        });
      },
    });
  };

  // Tạo menu items cho MoreButton
  const moreMenuItems: MoreMenuItem[] = [
    {
      label: "Chia sẻ",
      icon: <Share2 size={16} strokeWidth={2.5} />,
      onClick: handleShare,
    },
    ...(isOwnPost
      ? [
          {
            label: "Chỉnh sửa",
            icon: <Edit size={16} strokeWidth={2.5} />,
            onClick: handleEdit,
          },
          {
            label: "Xóa",
            icon: <Trash2 size={16} strokeWidth={2.5} />,
            onClick: () => setShowDeleteDialog(true),
            danger: true,
          },
        ]
      : []),
  ];

  // When any floating UI is visible, increase bottom padding so the popup
  // doesn't overlap the next card. This lets the card expand in height
  // (the card CSS uses min-height) and prevents the interact popups
  // from covering the following card on small screens.
  // For portal popups we don't change the card height; keep a small static padding.
  const computedPaddingBottom = 8; // px

  return (
    <div
      ref={wrapperRef}
      style={{
        display: "flex",
        width: "100%",
        justifyContent: "space-between",
        gap: "24px",
        padding: "8px",
        paddingBottom: `${computedPaddingBottom}px`,
        borderRadius: "0 0 10px 10px",
        fontFamily: "'Quicksand', sans-serif",
        position: "relative",
      }}
    >
      {/* ===== LEFT: Vote Group ===== */}
      <VoteButton postId={postId} userId={userId} votes={votes} size="md" />
      <div className="flex items-center gap-4">
        {/* ===== MIDDLE: Bookmark Button ===== */}
        <button
          onClick={onBookmarkClick}
          disabled={isSaving}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            cursor: isSaving ? "not-allowed" : "pointer",
            opacity: isSaving ? 0.5 : 1,
            boxShadow: THEME.shadowSoft,
            transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          <div className="hover:-translate-y-0.5 transition-transform duration-100">
            <Bookmark
              size={18}
              strokeWidth={2.5}
              fill={isSaved ? "#F295B6" : "none"}
              color={isSaved ? "#F295B6" : "#999999"}
              style={{
                transition: "all 0.2s ease",
              }}
            />
          </div>
        </button>
        {/* Repost Button - Hiển thị riêng, không trong MoreMenu */}
        {post && post.type === EPostType.PERSONAL && (
          <RepostButton post={post} userId={userId} size="sm" />
        )}
        {/* More Menu Button - khác nhau cho owner và người khác */}
        {isOwnPost ? (
          <MoreButton
            menuItems={moreMenuItems}
            buttonSize="small"
            iconSize={14}
            tooltip="Thêm"
            buttonStyle={{
              width: "28px",
              height: "28px",
            }}
          />
        ) : (
          <ReportButton
            type={EReportType.POST}
            targetId={postId}
            renderButton={({ onClick }) => (
              <MoreButton
                menuItems={[
                  ...moreMenuItems,
                  {
                    label: "Báo cáo",
                    icon: <Flag size={16} strokeWidth={2.5} />,
                    onClick: onClick,
                    danger: true,
                  },
                ]}
                buttonSize="small"
                iconSize={14}
                tooltip="Thêm"
                buttonStyle={{
                  width: "28px",
                  height: "28px",
                }}
              />
            )}
          />
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        title="Xác nhận xóa bài viết?"
        description="Hành động này không thể hoàn tác. Bài viết sẽ bị xóa vĩnh viễn."
        onConfirm={() => {
          handleDelete();
          setShowDeleteDialog(false);
        }}
      />
    </div>
  );
};

export default InteractBar;
