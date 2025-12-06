import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInteractBar } from '../../hooks/useInteractBar';
import {
  Box,
  IconButton,
  Typography,
  Tooltip,
  Menu,
  MenuItem,
  Popover,
  Chip,
  Snackbar,
  Alert,
  Stack,
  Paper,
  Divider,
} from '@mui/material';
import {
  BiUpvote,
  BiDownvote,
  BiCommentDetail,
  BiDotsHorizontalRounded,
  BiShareAlt,
  BiFlag,
} from 'react-icons/bi';
import { MdOutlineRepeat } from 'react-icons/md';

// ============================================
// 🎨 THEME CONFIGURATION
// ============================================
const THEME = {
  primary: '#F295B6',
  secondary: '#FFB8D1', 
  tertiary: '#FFE7F0',
  cream: '#FFF8FA',
  text: '#4A3C42',
  textMuted: '#8B7B82',
  white: '#FFFFFF',
  upvoteActive: '#E8779F',
  downvoteActive: '#9B8A90',
};


// Emoji reactions with pastel vibes
const EMOJI_LIST = [
  { id: 1, emoji: '💖', label: 'Love' },
  { id: 2, emoji: '😊', label: 'Happy' },
  { id: 3, emoji: '🥺', label: 'Cute' },
  { id: 4, emoji: '😂', label: 'Haha' },
  { id: 5, emoji: '😮', label: 'Wow' },
  { id: 6, emoji: '🎀', label: 'Pretty' },
];

// ============================================
// 🎪 MAIN COMPONENT - Material UI Version
// ============================================
interface InteractBarProps {
  postId: number;
  userId: number;
  initialUpVotes?: number;
  initialDownVotes?: number;
  totalComments?: number;
}

const InteractBar: React.FC<InteractBarProps> = ({
  postId,
  userId,
  initialUpVotes = 0,
  initialDownVotes = 0,
  totalComments = 0,
}) => {
  const navigate = useNavigate();
  const [emojiAnchorEl, setEmojiAnchorEl] = useState<HTMLElement | null>(null);
  const [moreAnchorEl, setMoreAnchorEl] = useState<HTMLElement | null>(null);
  const [showLoginToast, setShowLoginToast] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

  const {
    voteType,
    upVotes,
    downVotes,
    isVoting,
    handleVote,
    selectedEmojiId,
    isReacting,
    handleEmojiReact,
  } = useInteractBar({
    postId,
    userId,
    initialUpVotes,
    initialDownVotes,
  });

  const netVotes = upVotes - downVotes;
  const isLoggedIn = userId > 0;

  // Toast handler
  const showLoginRequired = () => {
    setShowLoginToast(true);
  };

  // Vote with login check
  const onVoteClick = (type: 'upvote' | 'downvote') => {
    if (!isLoggedIn) {
      showLoginRequired();
      return;
    }
    handleVote(type);
  };

  // Emoji handlers
  const handleEmojiClick = (event: React.MouseEvent<HTMLElement>) => {
    if (!isLoggedIn) {
      showLoginRequired();
      return;
    }
    setEmojiAnchorEl(event.currentTarget);
  };

  const handleEmojiClose = () => {
    setEmojiAnchorEl(null);
  };

  const onEmojiSelect = (emojiId: number) => {
    handleEmojiReact(emojiId);
    handleEmojiClose();
  };

  // More menu handlers
  const handleMoreClick = (event: React.MouseEvent<HTMLElement>) => {
    setMoreAnchorEl(event.currentTarget);
  };

  const handleMoreClose = () => {
    setMoreAnchorEl(null);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
    setShowShareToast(true);
    handleMoreClose();
  };

  const handleRepost = () => {
    if (!isLoggedIn) {
      showLoginRequired();
      handleMoreClose();
      return;
    }
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

  const getCurrentEmoji = () => {
    if (selectedEmojiId) {
      const found = EMOJI_LIST.find((e) => e.id === selectedEmojiId);
      if (found) return found.emoji;
    }
    return '💗';
  };

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          p: 1.5,
          background: THEME.cream,
          borderTop: `1px solid ${THEME.tertiary}`,
          borderRadius: '0 0 10px 10px',
          position: 'relative',
        }}
      >
        {/* Left: Vote Group */}
        <Stack
          direction="row"
          spacing={0.5}
          alignItems="center"
          sx={{
            px: 1,
            py: 0.5,
            background: THEME.white,
            borderRadius: '50px',
            border: `1.5px solid ${THEME.secondary}`,
            boxShadow: '0 2px 8px rgba(242, 149, 182, 0.15)',
          }}
        >
          <Tooltip title={isLoggedIn ? 'Upvote' : 'Đăng nhập để vote'} arrow>
            <span>
              <IconButton
                size="small"
                disabled={isVoting}
                onClick={() => onVoteClick('upvote')}
                sx={{
                  width: 28,
                  height: 28,
                  backgroundColor: voteType === 'upvote' ? THEME.tertiary : 'transparent',
                  '&:hover': {
                    backgroundColor: THEME.tertiary,
                    transform: 'scale(1.08)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <BiUpvote
                  style={{
                    fontSize: 16,
                    color: voteType === 'upvote' ? THEME.upvoteActive : THEME.secondary,
                  }}
                />
              </IconButton>
            </span>
          </Tooltip>

          <Typography
            variant="body2"
            sx={{
              minWidth: 28,
              textAlign: 'center',
              fontWeight: 700,
              fontSize: '13px',
              color:
                voteType === 'upvote'
                  ? THEME.upvoteActive
                  : voteType === 'downvote'
                  ? THEME.downvoteActive
                  : THEME.text,
              transition: 'color 0.2s ease',
              userSelect: 'none',
            }}
          >
            {netVotes}
          </Typography>

          <Tooltip title={isLoggedIn ? 'Downvote' : 'Đăng nhập để vote'} arrow>
            <span>
              <IconButton
                size="small"
                disabled={isVoting}
                onClick={() => onVoteClick('downvote')}
                sx={{
                  width: 28,
                  height: 28,
                  backgroundColor: voteType === 'downvote' ? '#F0E8EA' : 'transparent',
                  '&:hover': {
                    backgroundColor: THEME.tertiary,
                    transform: 'scale(1.08)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <BiDownvote
                  style={{
                    fontSize: 16,
                    color: voteType === 'downvote' ? THEME.downvoteActive : THEME.secondary,
                  }}
                />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>

        {/* Right: Emoji, Comment & More */}
        <Stack direction="row" spacing={0.75} alignItems="center">
          {/* Emoji React Button */}
          <Tooltip title={isLoggedIn ? 'React' : 'Đăng nhập để react'} arrow>
            <span>
              <IconButton
                size="small"
                disabled={isReacting}
                onClick={handleEmojiClick}
                sx={{
                  width: 32,
                  height: 32,
                  fontSize: '16px',
                  border: `1.5px solid ${selectedEmojiId ? THEME.primary : THEME.secondary}`,
                  backgroundColor: selectedEmojiId ? THEME.tertiary : THEME.white,
                  boxShadow: '0 2px 8px rgba(242, 149, 182, 0.15)',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    backgroundColor: THEME.tertiary,
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                {getCurrentEmoji()}
              </IconButton>
            </span>
          </Tooltip>

          {/* Comment Button */}
          <Tooltip title="Xem bình luận" arrow>
            <Chip
              icon={<BiCommentDetail style={{ fontSize: 16, color: THEME.primary }} />}
              label={totalComments}
              onClick={() => navigate(`/post/${postId}`)}
              size="small"
              sx={{
                height: 32,
                backgroundColor: THEME.white,
                border: `1.5px solid ${THEME.secondary}`,
                boxShadow: '0 2px 8px rgba(242, 149, 182, 0.15)',
                fontWeight: 600,
                fontSize: '12px',
                color: THEME.text,
                '&:hover': {
                  backgroundColor: THEME.tertiary,
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.2s ease',
                '& .MuiChip-label': {
                  px: 1,
                },
                '& .MuiChip-icon': {
                  marginLeft: '8px',
                  marginRight: '-2px',
                },
              }}
            />
          </Tooltip>

          {/* More Menu Button */}
          <Tooltip title="Tùy chọn khác" arrow>
            <IconButton
              size="small"
              onClick={handleMoreClick}
              sx={{
                width: 32,
                height: 32,
                border: `1.5px solid ${moreAnchorEl ? THEME.primary : THEME.secondary}`,
                backgroundColor: moreAnchorEl ? THEME.tertiary : THEME.white,
                boxShadow: '0 2px 8px rgba(242, 149, 182, 0.15)',
                '&:hover': {
                  backgroundColor: THEME.tertiary,
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <BiDotsHorizontalRounded style={{ fontSize: 18, color: THEME.primary }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Paper>

      {/* Emoji Picker Popover */}
      <Popover
        open={Boolean(emojiAnchorEl)}
        anchorEl={emojiAnchorEl}
        onClose={handleEmojiClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        sx={{
          mt: -1,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            display: 'flex',
            gap: 0.5,
            p: 1.5,
            borderRadius: '28px',
            border: `1.5px solid ${THEME.secondary}`,
            backgroundColor: THEME.white,
          }}
        >
          {EMOJI_LIST.map((item) => (
            <Tooltip key={item.id} title={item.label} arrow>
              <IconButton
                onClick={() => onEmojiSelect(item.id)}
                sx={{
                  width: 40,
                  height: 40,
                  fontSize: '22px',
                  backgroundColor: selectedEmojiId === item.id ? THEME.tertiary : 'transparent',
                  '&:hover': {
                    backgroundColor: THEME.tertiary,
                    transform: 'scale(1.15) rotate(-5deg)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                {item.emoji}
              </IconButton>
            </Tooltip>
          ))}
        </Paper>
      </Popover>

      {/* More Menu */}
      <Menu
        anchorEl={moreAnchorEl}
        open={Boolean(moreAnchorEl)}
        onClose={handleMoreClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{
          mt: 1,
          '& .MuiPaper-root': {
            borderRadius: '16px',
            border: `1.5px solid ${THEME.secondary}`,
            minWidth: 160,
          },
        }}
      >
        <MenuItem
          onClick={handleShare}
          sx={{
            py: 1.5,
            px: 2,
            gap: 1.5,
            '&:hover': {
              backgroundColor: THEME.tertiary,
            },
          }}
        >
          <BiShareAlt style={{ fontSize: 18, color: THEME.primary }} />
          <Typography variant="body2" fontWeight={600}>
            Chia sẻ
          </Typography>
        </MenuItem>
        <MenuItem
          onClick={handleRepost}
          sx={{
            py: 1.5,
            px: 2,
            gap: 1.5,
            '&:hover': {
              backgroundColor: THEME.tertiary,
            },
          }}
        >
          <MdOutlineRepeat style={{ fontSize: 18, color: THEME.primary }} />
          <Typography variant="body2" fontWeight={600}>
            Đăng lại
          </Typography>
        </MenuItem>
        <Divider sx={{ my: 0.5, mx: 1.5, backgroundColor: THEME.tertiary }} />
        <MenuItem
          onClick={handleReport}
          sx={{
            py: 1.5,
            px: 2,
            gap: 1.5,
            '&:hover': {
              backgroundColor: '#FFEBEE',
            },
          }}
        >
          <BiFlag style={{ fontSize: 18, color: '#E57373' }} />
          <Typography variant="body2" fontWeight={600} color="#E57373">
            Báo cáo
          </Typography>
        </MenuItem>
      </Menu>

      {/* Snackbars for Notifications */}
      <Snackbar
        open={showLoginToast}
        autoHideDuration={2500}
        onClose={() => setShowLoginToast(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowLoginToast(false)}
          severity="info"
          sx={{
            width: '100%',
            borderRadius: '24px',
            background: `linear-gradient(135deg, ${THEME.primary} 0%, ${THEME.secondary} 100%)`,
            color: THEME.white,
            fontWeight: 600,
            '& .MuiAlert-icon': {
              color: THEME.white,
            },
          }}
        >
          Đăng nhập để tương tác 💕
        </Alert>
      </Snackbar>

      <Snackbar
        open={showShareToast}
        autoHideDuration={2000}
        onClose={() => setShowShareToast(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowShareToast(false)}
          severity="success"
          sx={{
            width: '100%',
            borderRadius: '24px',
            background: `linear-gradient(135deg, ${THEME.primary} 0%, ${THEME.secondary} 100%)`,
            color: THEME.white,
            fontWeight: 600,
            '& .MuiAlert-icon': {
              color: THEME.white,
            },
          }}
        >
          Đã sao chép link! 📋
        </Alert>
      </Snackbar>
    </>
  );
};

export default InteractBar;
