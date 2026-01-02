import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal, Share2, Flag, Bookmark } from "lucide-react";
import { useCheckSaved, useToggleSavePost } from "../../hooks/useSavedPost";
import ReportButton from "../report/ReportButton";
import { EReportType } from "../../types/report";
import VoteButton from "../VoteButton";
import type { IVotesSummaryDto } from "../../types/user-vote";
import { useToast } from "../../contexts/toast";
import { useLoginRequired } from "../../hooks/useLoginRequired";
import { RepostButton } from "../repost";
import { EPostType, type IPostResponseDto } from "../../types/post";

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

// More Menu Dropdown (rendered in a portal so it overlays without affecting layout)
const MoreMenu: React.FC<{
  visible: boolean;
  onShare: () => void;
  onClose: () => void;
  postId: number;
  anchorRef?: React.RefObject<HTMLButtonElement | null>;
}> = ({ visible, onShare, onClose, postId, anchorRef }) => {
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visible && anchorRef?.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 8,
        left: rect.right,
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

    // Delay adding listener to prevent immediate close
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
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
            color: danger ? "#E57373" : THEME.primary,
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
    <>
      <style>{`
        @keyframes menuSlideIn {
          0% { opacity: 0; transform: translateY(-8px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
      <div
        ref={menuRef}
        style={{
          position: "fixed",
          top: `${menuPosition.top}px`,
          left: `${menuPosition.left}px`,
          transform: "translateX(-100%)",
          minWidth: "160px",
          background: THEME.white,
          borderRadius: "16px",
          border: `1.5px solid ${THEME.secondary}`,
          overflow: "hidden",
          boxShadow: THEME.shadowMedium,
          // animation: 'menuSlideIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
          zIndex: 1000,
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <MenuItem
          icon={<Share2 size={16} strokeWidth={2.5} />}
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
          onClose={onClose}
          onSuccess={onClose}
          renderButton={({ onClick }) => (
            <MenuItem
              icon={<Flag size={16} strokeWidth={2.5} />}
              label="Báo cáo"
              onClick={onClick}
              danger
            />
          )}
        />
      </div>
    </>
  );

  return createPortal(menu, document.body);
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
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [moreHovered, setMoreHovered] = useState(false);
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);
  const { showToast } = useToast();
  const { requireLogin } = useLoginRequired();

  const moreMenuRef = useRef<HTMLDivElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const isLoggedIn = userId > 0;

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

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        moreMenuRef.current &&
        !moreMenuRef.current.contains(event.target as Node)
      ) {
        setShowMoreMenu(false);
      }
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        // setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
          <div className="hover:translate-y-[-2px] transition-transform duration-100">
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
        {/* More Menu Button */}
        <div ref={moreMenuRef} style={{ position: "relative" }}>
          <button
            ref={moreButtonRef}
            onClick={(e) => {
              e.stopPropagation();
              setShowMoreMenu(!showMoreMenu);
            }}
            onMouseEnter={() => setMoreHovered(true)}
            onMouseLeave={() => setMoreHovered(false)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "28px",
              height: "28px",
              borderRadius: "50px",
              border: `1.5px solid ${
                showMoreMenu ? THEME.primary : THEME.secondary
              }`,
              background: showMoreMenu
                ? THEME.tertiary
                : moreHovered
                ? THEME.tertiary
                : THEME.white,
              cursor: "pointer",
              transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
              transform: moreHovered ? "scale(1.05)" : "scale(1)",
            }}
          >
            <MoreHorizontal
              size={14}
              strokeWidth={2.5}
              style={{ color: THEME.primary }}
            />
          </button>

          <MoreMenu
            visible={showMoreMenu}
            onShare={handleShare}
            onClose={handleCloseMoreMenu}
            postId={postId}
            anchorRef={moreButtonRef}
          />
        </div>{" "}
      </div>
    </div>
  );
};

export default InteractBar;
