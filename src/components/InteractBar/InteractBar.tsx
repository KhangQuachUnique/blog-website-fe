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
          gap: 2,
          px: 2.5,
          py: 1.5,
          background: THEME.white,
          borderTop: `1px solid ${THEME.tertiary}`,
          borderRadius: '0 0 12px 12px',
          position: 'relative',
        }}
      >
        {/* Left: Vote Group */}
        <Stack
          direction="row"
          spacing={0.5}
          alignItems="center"
          sx={{
            px: 1.5,
            py: 0.75,
            background: THEME.cream,
            borderRadius: '12px',
            border: `1px solid ${THEME.tertiary}`,
          }}
        >
          <Tooltip title={isLoggedIn ? 'Upvote' : 'Đăng nhập để vote'} arrow placement="top">
            <span>
              <IconButton
                size="small"
                disabled={isVoting}
                onClick={() => onVoteClick('upvote')}
                sx={{
                  width: 32,
                  height: 32,
                  backgroundColor: voteType === 'upvote' ? THEME.primary : 'transparent',
                  color: voteType === 'upvote' ? THEME.white : THEME.textMuted,
                  '&:hover': {
                    backgroundColor: voteType === 'upvote' ? THEME.upvoteActive : THEME.tertiary,
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <BiUpvote
                  style={{
                    fontSize: 18,
                    color: voteType === 'upvote' ? THEME.white : THEME.text,
                  }}
                />
              </IconButton>
            </span>
          </Tooltip>

          <Typography
            variant="body2"
            sx={{
              minWidth: 36,
              textAlign: 'center',
              fontWeight: 600,
              fontSize: '14px',
              color: THEME.text,
              userSelect: 'none',
            }}
          >
            {netVotes}
          </Typography>

          <Tooltip title={isLoggedIn ? 'Downvote' : 'Đăng nhập để vote'} arrow placement="top">
            <span>
              <IconButton
                size="small"
                disabled={isVoting}
                onClick={() => onVoteClick('downvote')}
                sx={{
                  width: 32,
                  height: 32,
                  backgroundColor: voteType === 'downvote' ? THEME.downvoteActive : 'transparent',
                  color: voteType === 'downvote' ? THEME.white : THEME.textMuted,
                  '&:hover': {
                    backgroundColor: voteType === 'downvote' ? '#8B7B82' : THEME.tertiary,
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <BiDownvote
                  style={{
                    fontSize: 18,
                    color: voteType === 'downvote' ? THEME.white : THEME.text,
                  }}
                />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>

        {/* Right: Emoji, Comment & More */}
        <Stack direction="row" spacing={1} alignItems="center">
          {/* Emoji React Button */}
          <Tooltip title={isLoggedIn ? 'React với emoji' : 'Đăng nhập để react'} arrow placement="top">
            <span>
              <IconButton
                size="small"
                disabled={isReacting}
                onClick={handleEmojiClick}
                sx={{
                  width: 36,
                  height: 36,
                  fontSize: '18px',
                  backgroundColor: selectedEmojiId ? THEME.tertiary : THEME.cream,
                  border: `1px solid ${selectedEmojiId ? THEME.primary : THEME.tertiary}`,
                  '&:hover': {
                    backgroundColor: THEME.tertiary,
                    borderColor: THEME.primary,
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                {getCurrentEmoji()}
              </IconButton>
            </span>
          </Tooltip>

          {/* Comment Button */}
          <Tooltip title="Xem bình luận" arrow placement="top">
            <Box
              onClick={() => navigate(`/post/${postId}`)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                px: 1.5,
                py: 0.75,
                backgroundColor: THEME.cream,
                border: `1px solid ${THEME.tertiary}`,
                borderRadius: '12px',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: THEME.tertiary,
                  borderColor: THEME.secondary,
                },
                transition: 'all 0.2s ease',
              }}
            >
              <BiCommentDetail style={{ fontSize: 18, color: THEME.primary }} />
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 600, 
                  fontSize: '13px', 
                  color: THEME.text 
                }}
              >
                {totalComments}
              </Typography>
            </Box>
          </Tooltip>

          {/* More Menu Button */}
          <Tooltip title="Tùy chọn khác" arrow placement="top">
            <IconButton
              size="small"
              onClick={handleMoreClick}
              sx={{
                width: 36,
                height: 36,
                backgroundColor: moreAnchorEl ? THEME.tertiary : THEME.cream,
                border: `1px solid ${moreAnchorEl ? THEME.primary : THEME.tertiary}`,
                '&:hover': {
                  backgroundColor: THEME.tertiary,
                  borderColor: THEME.primary,
                },
                transition: 'all 0.2s ease',
              }}
            >
              <BiDotsHorizontalRounded style={{ fontSize: 20, color: THEME.primary }} />
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
        sx={{ mt: -1 }}
        slotProps={{
          paper: {
            sx: {
              borderRadius: '16px',
              border: `1px solid ${THEME.tertiary}`,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            }
          }
        }}
      >
        <Box
          sx={{
            display: 'flex',
            gap: 0.5,
            p: 2,
            backgroundColor: THEME.white,
          }}
        >
          {EMOJI_LIST.map((item) => (
            <Tooltip key={item.id} title={item.label} arrow placement="top">
              <IconButton
                onClick={() => onEmojiSelect(item.id)}
                sx={{
                  width: 44,
                  height: 44,
                  fontSize: '24px',
                  backgroundColor: selectedEmojiId === item.id ? THEME.tertiary : 'transparent',
                  '&:hover': {
                    backgroundColor: THEME.tertiary,
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                {item.emoji}
              </IconButton>
            </Tooltip>
          ))}
        </Box>
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
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              borderRadius: '12px',
              border: `1px solid ${THEME.tertiary}`,
              minWidth: 180,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            }
          }
        }}
      >
        <MenuItem
          onClick={handleShare}
          sx={{
            py: 1.25,
            px: 2,
            gap: 1.5,
            mx: 1,
            my: 0.5,
            borderRadius: '8px',
            '&:hover': {
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
          onClick={handleRepost}
          sx={{
            py: 1.25,
            px: 2,
            gap: 1.5,
            mx: 1,
            my: 0.5,
            borderRadius: '8px',
            '&:hover': {
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
          onClick={handleReport}
          sx={{
            py: 1.25,
            px: 2,
            gap: 1.5,
            mx: 1,
            my: 0.5,
            borderRadius: '8px',
            '&:hover': {
              backgroundColor: '#FEE',
            },
          }}
        >
          <BiFlag style={{ fontSize: 20, color: '#E57373' }} />
          <Typography variant="body2" fontWeight={600} color="#E57373">
            Báo cáo
          </Typography>
        </MenuItem>
      </Menu>

      {/* Snackbars - Slide from Right */}
      <Snackbar
        open={showLoginToast}
        autoHideDuration={2500}
        onClose={() => setShowLoginToast(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        TransitionComponent={(props) => <Box {...props} sx={{ 
          transition: 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out',
          ...props.sx 
        }} />}
        sx={{
          '& .MuiSnackbar-root': {
            pointerEvents: 'auto',
          }
        }}
      >
        <Alert
          onClose={() => setShowLoginToast(false)}
          severity="info"
          variant="filled"
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.transition = 'all 0.2s ease';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
          }}
          sx={{
            minWidth: '300px',
            borderRadius: '12px',
            backgroundColor: THEME.primary,
            color: THEME.white,
            fontWeight: 600,
            fontSize: '14px',
            boxShadow: '0 4px 20px rgba(242, 149, 182, 0.3)',
            pointerEvents: 'auto',
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
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        TransitionComponent={(props) => <Box {...props} sx={{ 
          transition: 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out',
          ...props.sx 
        }} />}
        sx={{
          '& .MuiSnackbar-root': {
            pointerEvents: 'auto',
          }
        }}
      >
        <Alert
          onClose={() => setShowShareToast(false)}
          severity="success"
          variant="filled"
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.transition = 'all 0.2s ease';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
          }}
          sx={{
            minWidth: '280px',
            borderRadius: '12px',
            backgroundColor: '#4CAF50',
            color: THEME.white,
            fontWeight: 600,
            fontSize: '14px',
            boxShadow: '0 4px 20px rgba(76, 175, 80, 0.3)',
            pointerEvents: 'auto',
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
