import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  MessageCircle,
  MoreHorizontal,
  Share2,
  Flag,
  Bookmark,
  Repeat2,
} from "lucide-react";
import { useCheckSaved, useToggleSavePost } from "../../hooks/useSavedPost";
import ReportButton from "../report/ReportButton";
import { EReportType } from "../../types/report";
import { useToast } from "../../contexts/toast";
import { useLoginRequired } from "../../hooks/useLoginRequired";
import type { IVotesSummaryDto } from "../../types/user-vote";
import type { IPostResponseDto } from "../../types/post";
import { EPostType } from "../../types/post";
import VoteButton from "../VoteButton";
import { RepostButton } from "../repost";

// ============================================
// 🎨 BLOOKIE DESIGN SYSTEM - PASTEL PINK EDITION
// ============================================
const THEME = {
  primary: "#F295B6",
  secondary: "#FFB8D1",
  tertiary: "#FFE7F0",
  cream: "#FFF8FA",
  text: "#4A3C42",
  textMuted: "#8B7B82",
  white: "#FFFFFF",
  icon: "#999999",
  upvote: "#F295B6",
  upvoteActive: "#E8779F",
  downvote: "#B8A5AB",
  downvoteActive: "#9B8A90",
  shadowSoft: "0 2px 12px rgba(242, 149, 182, 0.15)",
  shadowMedium: "0 4px 20px rgba(242, 149, 182, 0.2)",
  shadowStrong: "0 8px 32px rgba(242, 149, 182, 0.25)",
};

// ============================================
// More Menu Dropdown
// ============================================
const MoreMenu: React.FC<{
  visible: boolean;
  onShare: () => void;
  onClose: () => void;
  postId: number;
  currentUserId: number;
  onLoginRequired: () => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
}> = ({
  visible,
  onShare,
  onClose,
  postId,
  currentUserId,
  onLoginRequired,
  anchorRef,
}) => {
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visible && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.top,
        left: rect.right + 8,
      });
    }
  }, [visible, anchorRef]);

  // Close menu when clicking outside
  useEffect(() => {
    if (!visible) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        anchorRef?.current &&
        !anchorRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    // Use click instead of mousedown to allow menu item onClick to fire first
    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [visible, onClose, anchorRef]);

  if (!visible) return null;

  const MenuItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    danger?: boolean;
  }> = ({ icon, label, onClick, danger }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          width: "100%",
          padding: "12px 16px",
          border: "none",
          background: isHovered ? THEME.tertiary : "transparent",
          cursor: "pointer",
          fontFamily: "'Quicksand', sans-serif",
          fontSize: "14px",
          fontWeight: 600,
          color: danger ? "#E57373" : THEME.text,
          transition: "all 0.15s ease",
          textAlign: "left",
        }}
      >
        <span
          style={{
            display: "flex",
            color: danger ? "#E57373" : THEME.icon,
            opacity: 0.9,
          }}
        >
          {icon}
        </span>
        {label}
      </button>
    );
  };

  const menu = (
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        top: `${menuPosition.top}px`,
        left: `${menuPosition.left}px`,
        minWidth: "160px",
        background: THEME.white,
        borderRadius: "16px",
        border: `1.5px solid ${THEME.secondary}`,
        overflow: "hidden",
        boxShadow: THEME.shadowMedium,
        zIndex: 10001,
        animation: "menuSlideIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      <style>{`
        @keyframes menuSlideIn {
          0% { opacity: 0; transform: translateX(-8px) scale(0.95); }
          100% { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>
      <MenuItem
        icon={
          <Share2 size={16} strokeWidth={2.5} style={{ color: THEME.icon }} />
        }
        label="Chia sẻ"
        onClick={onShare}
      />
      <div
        style={{
          height: "1px",
          background: THEME.tertiary,
          margin: "4px 12px",
        }}
      />
      <ReportButton
        type={EReportType.POST}
        targetId={postId}
        currentUserId={currentUserId}
        onClose={onClose}
        onSuccess={onClose}
        onLoginRequired={onLoginRequired}
        renderButton={({ onClick }) => (
          <MenuItem
            icon={
              <Flag size={16} strokeWidth={2.5} style={{ color: THEME.text }} />
            }
            label="Báo cáo"
            onClick={onClick}
            danger
          />
        )}
      />
    </div>
  );

  return createPortal(menu, document.body);
};

// ============================================
// Action Button Component (moved outside to prevent re-creation)
// ============================================
interface ActionButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  tooltip?: string;
}

const ActionButton = React.forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ onClick, children, disabled, tooltip }, ref) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <div style={{ position: "relative" }}>
        <button
          ref={ref}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!disabled) {
              onClick();
            }
          }}
          disabled={disabled}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "40px",
            height: "40px",
            color: THEME.text,
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.5 : 1,
            transition: "transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)",
            transform:
              isHovered && !disabled ? "translateY(-2px)" : "translateY(0)",
            // removed border and border-radius to match new design
          }}
        >
          {children}
        </button>
        {tooltip && isHovered && (
          <div
            style={{
              position: "absolute",
              left: "60px",
              top: "50%",
              transform: "translateY(-50%)",
              padding: "6px 12px",
              background: THEME.text,
              color: THEME.white,
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 600,
              whiteSpace: "nowrap",
              zIndex: 10002,
              pointerEvents: "none",
            }}
          >
            {tooltip}
          </div>
        )}
      </div>
    );
  }
);

ActionButton.displayName = "ActionButton";

// ============================================
// 🎪 FLOATING INTERACT BAR COMPONENT
// ============================================
interface FloatingInteractBarProps {
  postId: number;
  votes?: IVotesSummaryDto;
  totalComments?: number;
  /** Post data để truyền vào RepostButton */
  post?: IPostResponseDto;
}

const FloatingInteractBar: React.FC<FloatingInteractBarProps> = ({
  postId,
  votes,
  totalComments = 0,
  post,
}) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const { showToast } = useToast();
  const { isLoggedIn, requireLogin, userId } = useLoginRequired();
  const moreButtonRef = useRef<HTMLButtonElement>(null);

  // 🔖 Saved post hooks
  const { data: isSaved = false } = useCheckSaved(
    isLoggedIn ? userId : null,
    postId
  );
  const { mutate: toggleSave, isPending: isSaving } = useToggleSavePost();

  // Scroll to comments section
  const scrollToComments = () => {
    const commentsSection = document.querySelector("[data-comments-section]");
    if (commentsSection) {
      // Try to account for a fixed header so the comments aren't hidden behind it.
      const header = document.querySelector("header");
      const headerHeight = header ? header.getBoundingClientRect().height : 80; // fallback header height
      const extraMargin = 12; // small spacing from header

      const targetTop =
        commentsSection.getBoundingClientRect().top +
        window.scrollY -
        headerHeight -
        extraMargin;

      window.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
    }
  };

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
    setShowMoreMenu(false);
    showToast({
      type: "success",
      message: "Link đã được sao chép vào clipboard",
      duration: 2000,
    });
  };

  const handleCloseMoreMenu = () => {
    setShowMoreMenu(false);
  };

  return (
    <div
      style={{
        position: "fixed",
        // Position in the empty space between sidebar (240px) and content (800px centered)
        // Calculate: sidebar + (available space - content width) / 4
        left: "calc(180px + (100vw - 240px - 800px) / 4)",
        top: "50%",
        transform: "translateY(-50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px",
        padding: "8px",
        background: THEME.white,
        borderRadius: "18px",
        zIndex: 10000,
      }}
    >
      {/* Vote Button - Sử dụng component VoteButton có sẵn */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "4px",
          pointerEvents: "auto",
          zIndex: 10001,
        }}
      >
        <VoteButton postId={postId} userId={userId} votes={votes} size="lg" />
      </div>

      {/* Divider removed - compact layout */}

      {/* Comment Button */}
      <ActionButton
        onClick={scrollToComments}
        tooltip={`${totalComments} bình luận`}
      >
        <div style={{ position: "relative" }}>
          <MessageCircle size={20} style={{ color: THEME.icon }} />
          {totalComments > 0 && (
            <div
              style={{
                position: "absolute",
                top: "-8px",
                right: "-8px",
                minWidth: "18px",
                height: "18px",
                borderRadius: "9px",
                background: THEME.primary,
                color: THEME.white,
                fontSize: "10px",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 4px",
              }}
            >
              {totalComments > 99 ? "99+" : totalComments}
            </div>
          )}
        </div>
      </ActionButton>

      {/* Bookmark Button */}
      <ActionButton
        onClick={onBookmarkClick}
        active={isSaved}
        disabled={isSaving}
        tooltip={isSaved ? "Đã lưu" : "Lưu bài viết"}
      >
        <Bookmark
          size={22}
          strokeWidth={2}
          fill={isSaved ? "#F295B6" : "none"}
          style={isSaved ? { color: "#F295B6" } : { color: THEME.icon }}
        />
      </ActionButton>

      {/* Repost Button - use standard ActionButton via renderButton */}
      {post && post.type === EPostType.PERSONAL && (
        <RepostButton
          post={post}
          userId={userId}
          size="lg"
          renderButton={({ onClick, disabled }) => (
            <ActionButton
              onClick={onClick}
              disabled={disabled}
              tooltip="Đăng lại"
            >
              <Repeat2 size={22} style={{ color: THEME.icon }} />
            </ActionButton>
          )}
        />
      )}

      {/* More Menu Button (use ActionButton, forwarded ref for anchor) */}
      <ActionButton
        ref={moreButtonRef}
        onClick={() => setShowMoreMenu(!showMoreMenu)}
        active={showMoreMenu}
        tooltip="Thêm"
      >
        <MoreHorizontal
          size={22}
          strokeWidth={2.5}
          style={
            showMoreMenu ? { color: THEME.primary } : { color: THEME.icon }
          }
        />
      </ActionButton>

      {/* More Menu Dropdown */}
      <MoreMenu
        visible={showMoreMenu}
        onShare={handleShare}
        onClose={handleCloseMoreMenu}
        postId={postId}
        currentUserId={userId}
        onLoginRequired={() => {
          showToast({
            type: "info",
            message: "Vui lòng đăng nhập để tiếp tục",
            duration: 3000,
          });
          setShowMoreMenu(false);
        }}
        anchorRef={moreButtonRef}
      />
    </div>
  );
};

export default FloatingInteractBar;
