import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  IconButton,
  Typography,
  Tooltip,
  Menu,
  MenuItem,
  Stack,
  Paper,
  Divider,
} from "@mui/material";
import {
  BiUpvote,
  BiDownvote,
  BiCommentDetail,
  BiDotsHorizontalRounded,
  BiShareAlt,
  BiFlag,
} from "react-icons/bi";
import { MdOutlineRepeat } from "react-icons/md";
import { useInteractBar } from "../../hooks/useInteractBar";
import { useToast } from "../../contexts/toast";

// ============================================
// 🎨 THEME CONFIGURATION
// ============================================
const THEME = {
  primary: "#F295B6",
  secondary: "#FFB8D1",
  tertiary: "#FFE7F0",
  cream: "#FFF8FA",
  text: "#4A3C42",
  textMuted: "#8B7B82",
  white: "#FFFFFF",
  upvoteActive: "#E8779F",
  downvoteActive: "#9B8A90",
} as const;

// ============================================
// 🎪 INTERFACES
// ============================================
interface InteractBarProps {
  postId: number;
  userId: number;
  initialUpVotes?: number;
  initialDownVotes?: number;
  initialVoteType?: 'upvote' | 'downvote' | null;
  totalComments?: number;
}

// ============================================
// 🎪 MAIN COMPONENT
// ============================================
const InteractBar: React.FC<InteractBarProps> = ({
  postId,
  userId,
  initialUpVotes = 0,
  initialDownVotes = 0,
  initialVoteType = null,
  totalComments = 0,
}) => {
  // ========== Hooks ==========
  const navigate = useNavigate();
  const { showToast } = useToast();

  // ========== State ==========
  const [moreAnchorEl, setMoreAnchorEl] = useState<HTMLElement | null>(null);

  // ========== Custom Hook ==========
  const { voteType, upVotes, downVotes, isVoting, handleVote } = useInteractBar(
    {
      postId,
      userId,
      initialUpVotes,
      initialDownVotes,
      initialVoteType,
    }
  );

  // ========== Computed Values ==========
  const netVotes = upVotes - downVotes;
  const isLoggedIn = userId > 0;

  // ========== Notification Helpers ==========
  const showLoginRequired = () => {
    showToast({
      type: "info",
      message: "Vui lòng đăng nhập để thực hiện thao tác này.",
      duration: 3000,
    });
  };

  const showSuccessMessage = (message: string) => {
    showToast({
      type: "success",
      message,
      duration: 3000,
    });
  };

  // ========== Vote Handlers ==========
  const onVoteClick = (type: "upvote" | "downvote") => {
    if (!isLoggedIn) {
      showLoginRequired();
      return;
    }
    handleVote(type);
  };

  // ========== More Menu Handlers ==========
  const handleMoreClick = (event: React.MouseEvent<HTMLElement>) => {
    setMoreAnchorEl(event.currentTarget);
  };

  const handleMoreClose = () => {
    setMoreAnchorEl(null);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
    showSuccessMessage("Đã sao chép link!");
    handleMoreClose();
  };

  const handleRepost = () => {
    if (!isLoggedIn) {
      showLoginRequired();
      handleMoreClose();
      return;
    }
    showSuccessMessage("Đã repost bài viết!");
    handleMoreClose();
  };

  const handleReport = () => {
    if (!isLoggedIn) {
      showLoginRequired();
      handleMoreClose();
      return;
    }
    handleMoreClose();
  };

  // ========== Render ==========
  return (
    <>
      {/* Main Interaction Bar */}
      <Paper
        elevation={0}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
          px: 2,
          py: 1,
          background: THEME.white,
          borderTop: `1px solid ${THEME.tertiary}`,
          borderRadius: "0 0 50px 50px",
          position: "relative",
        }}
      >
        {/* Left: Vote Group */}
        <VoteSection
          netVotes={netVotes}
          voteType={voteType}
          isVoting={isVoting}
          isLoggedIn={isLoggedIn}
          onVoteClick={onVoteClick}
        />

        {/* Right: Comment & More */}
        <Stack direction="row" spacing={1} alignItems="center">
          {/* Comment Button */}
          <CommentButton
            totalComments={totalComments}
            onClick={() => navigate(`/post/${postId}`)}
          />

          {/* More Menu Button */}
          <MoreButton
            isOpen={Boolean(moreAnchorEl)}
            onClick={handleMoreClick}
          />
        </Stack>
      </Paper>

      {/* More Menu */}
      <MoreMenu
        anchorEl={moreAnchorEl}
        onClose={handleMoreClose}
        onShare={handleShare}
        onRepost={handleRepost}
        onReport={handleReport}
      />
    </>
  );
};

// ============================================
// 🧩 SUB-COMPONENTS
// ============================================

// Vote Section Component
interface VoteSectionProps {
  netVotes: number;
  voteType: "upvote" | "downvote" | null;
  isVoting: boolean;
  isLoggedIn: boolean;
  onVoteClick: (type: "upvote" | "downvote") => void;
}

const VoteSection: React.FC<VoteSectionProps> = ({
  netVotes,
  voteType,
  isVoting,
  isLoggedIn,
  onVoteClick,
}) => (
  <Stack
    direction="row"
    spacing={0.5}
    alignItems="center"
    sx={{
      px: 1.25,
      py: 0.5,
      background: THEME.cream,
      borderRadius: "50px",
      border: `1px solid ${THEME.tertiary}`,
    }}
  >
    <Tooltip
      title={isLoggedIn ? "Upvote" : "Đăng nhập để vote"}
      arrow
      placement="top"
    >
      <span>
        <IconButton
          size="small"
          disabled={isVoting}
          onClick={() => onVoteClick("upvote")}
          sx={{
            width: 28,
            height: 28,
            backgroundColor:
              voteType === "upvote" ? THEME.primary : "transparent",
            "&:hover": {
              backgroundColor:
                voteType === "upvote" ? THEME.upvoteActive : THEME.tertiary,
            },
            transition: "all 0.2s ease",
          }}
        >
          <BiUpvote
            style={{
              fontSize: 16,
              color: voteType === "upvote" ? THEME.white : THEME.text,
            }}
          />
        </IconButton>
      </span>
    </Tooltip>

    <Typography
      variant="body2"
      sx={{
        minWidth: 32,
        textAlign: "center",
        fontWeight: 600,
        fontSize: "13px",
        color: THEME.text,
        userSelect: "none",
      }}
    >
      {netVotes}
    </Typography>

    <Tooltip
      title={isLoggedIn ? "Downvote" : "Đăng nhập để vote"}
      arrow
      placement="top"
    >
      <span>
        <IconButton
          size="small"
          disabled={isVoting}
          onClick={() => onVoteClick("downvote")}
          sx={{
            width: 28,
            height: 28,
            backgroundColor:
              voteType === "downvote" ? THEME.downvoteActive : "transparent",
            "&:hover": {
              backgroundColor:
                voteType === "downvote" ? "#8B7B82" : THEME.tertiary,
            },
            transition: "all 0.2s ease",
          }}
        >
          <BiDownvote
            style={{
              fontSize: 16,
              color: voteType === "downvote" ? THEME.white : THEME.text,
            }}
          />
        </IconButton>
      </span>
    </Tooltip>
  </Stack>
);

// Comment Button Component
interface CommentButtonProps {
  totalComments: number;
  onClick: () => void;
}

const CommentButton: React.FC<CommentButtonProps> = ({
  totalComments,
  onClick,
}) => (
  <Tooltip title="Xem bình luận" arrow placement="top">
    <Box
      onClick={onClick}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        px: 1.25,
        py: 0.5,
        backgroundColor: THEME.cream,
        border: `1px solid ${THEME.tertiary}`,
        borderRadius: "50px",
        cursor: "pointer",
        "&:hover": {
          backgroundColor: THEME.tertiary,
          borderColor: THEME.secondary,
        },
        transition: "all 0.2s ease",
      }}
    >
      <BiCommentDetail style={{ fontSize: 16, color: THEME.primary }} />
      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          fontSize: "12px",
          color: THEME.text,
        }}
      >
        {totalComments}
      </Typography>
    </Box>
  </Tooltip>
);

// More Button Component
interface MoreButtonProps {
  isOpen: boolean;
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
}

const MoreButton: React.FC<MoreButtonProps> = ({ isOpen, onClick }) => (
  <Tooltip title="Tùy chọn khác" arrow placement="top">
    <IconButton
      size="small"
      onClick={onClick}
      sx={{
        width: 32,
        height: 32,
        backgroundColor: isOpen ? THEME.tertiary : THEME.cream,
        border: `1px solid ${isOpen ? THEME.primary : THEME.tertiary}`,
        borderRadius: "50px",
        "&:hover": {
          backgroundColor: THEME.tertiary,
          borderColor: THEME.primary,
        },
        transition: "all 0.2s ease",
      }}
    >
      <BiDotsHorizontalRounded style={{ fontSize: 18, color: THEME.primary }} />
    </IconButton>
  </Tooltip>
);

// More Menu Component
interface MoreMenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onShare: () => void;
  onRepost: () => void;
  onReport: () => void;
}

const MoreMenu: React.FC<MoreMenuProps> = ({
  anchorEl,
  onClose,
  onShare,
  onRepost,
  onReport,
}) => (
  <Menu
    anchorEl={anchorEl}
    open={Boolean(anchorEl)}
    onClose={onClose}
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "right",
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "right",
    }}
    slotProps={{
      paper: {
        sx: {
          mt: 1,
          borderRadius: "12px",
          border: `1px solid ${THEME.tertiary}`,
          minWidth: 180,
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        },
      },
    }}
  >
    <MenuItem
      onClick={onShare}
      sx={{
        py: 1.25,
        px: 2,
        gap: 1.5,
        mx: 1,
        my: 0.5,
        borderRadius: "8px",
        "&:hover": {
          backgroundColor: THEME.cream,
        },
      }}
    >
      <BiShareAlt style={{ fontSize: 20, color: THEME.primary }} />
      <Typography variant="body2" fontWeight={600} color={THEME.text}>
        Chia sẻ
      </Typography>
    </MenuItem>
    <MenuItem
      onClick={onRepost}
      sx={{
        py: 1.25,
        px: 2,
        gap: 1.5,
        mx: 1,
        my: 0.5,
        borderRadius: "8px",
        "&:hover": {
          backgroundColor: THEME.cream,
        },
      }}
    >
      <MdOutlineRepeat style={{ fontSize: 20, color: THEME.primary }} />
      <Typography variant="body2" fontWeight={600} color={THEME.text}>
        Đăng lại
      </Typography>
    </MenuItem>
    <Divider sx={{ my: 0.5 }} />
    <MenuItem
      onClick={onReport}
      sx={{
        py: 1.25,
        px: 2,
        gap: 1.5,
        mx: 1,
        my: 0.5,
        borderRadius: "8px",
        "&:hover": {
          backgroundColor: "#FEE",
        },
      }}
    >
      <BiFlag style={{ fontSize: 20, color: "#E57373" }} />
      <Typography variant="body2" fontWeight={600} color="#E57373">
        Báo cáo
      </Typography>
    </MenuItem>
  </Menu>
);

export default InteractBar;
