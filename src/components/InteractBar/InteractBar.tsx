import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, MoreHorizontal, Share2, Repeat2, Flag } from 'lucide-react';
import { useInteractBar } from '../../hooks/useInteractBar';
import UpvoteIcon from './UpvoteIcon';
import DownvoteIcon from './DownvoteIcon';

// ============================================
// BLOOKIE DESIGN TOKENS
// ============================================
const COLORS = {
  primaryPink: '#F295B6',
  lightPink: '#FFB8D1',
  lighterPink: '#FFE7F0',
  pinkBg: '#FFDBE7',
  primaryText: '#4A3C42',
  secondaryText: '#8C1D35',
  white: '#FFFFFF',
};

// Emoji list with labels
const EMOJI_LIST = [
  { id: 1, emoji: '❤️', label: 'Love' },
  { id: 2, emoji: '😂', label: 'Haha' },
  { id: 3, emoji: '😮', label: 'Wow' },
  { id: 4, emoji: '😢', label: 'Sad' },
  { id: 5, emoji: '😡', label: 'Angry' },
  { id: 6, emoji: '🎉', label: 'Celebrate' },
];

// ============================================
// TYPES
// ============================================
interface InteractBarProps {
  postId: number;
  userId: number;
  initialUpVotes?: number;
  initialDownVotes?: number;
  totalComments?: number;
}

// ============================================
// COMPONENT
// ============================================
const InteractBar: React.FC<InteractBarProps> = ({
  postId,
  userId,
  initialUpVotes = 0,
  initialDownVotes = 0,
  totalComments = 0,
}) => {
  const navigate = useNavigate();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showLoginToast, setShowLoginToast] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

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

  // Show login required toast
  const showLoginRequired = () => {
    setShowLoginToast(true);
    setTimeout(() => setShowLoginToast(false), 2500);
  };

  // Handle vote with login check
  const onVoteClick = (type: 'upvote' | 'downvote') => {
    if (!isLoggedIn) {
      showLoginRequired();
      return;
    }
    handleVote(type);
  };

  // Handle emoji with login check
  const onEmojiClick = (emojiId: number) => {
    if (!isLoggedIn) {
      showLoginRequired();
      setShowEmojiPicker(false);
      return;
    }
    handleEmojiReact(emojiId);
    setShowEmojiPicker(false);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get displayed emoji by mapping selectedEmojiId to EMOJI_LIST
  const getDisplayedEmoji = () => {
    if (selectedEmojiId) {
      const found = EMOJI_LIST.find((e) => e.id === selectedEmojiId);
      if (found) {
        return <span className="text-lg leading-none">{found.emoji}</span>;
      }
    }
    // Default icon when no reaction
    return <span className="text-lg leading-none opacity-70">😊</span>;
  };

  // Menu actions
  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
    setShowMoreMenu(false);
  };

  const handleRepost = () => {
    setShowMoreMenu(false);
  };

  const handleReport = () => {
    setShowMoreMenu(false);
  };

  return (
    <div
      className="w-full flex items-center justify-between gap-2 py-2 px-3 overflow-visible relative"
      style={{ borderTop: `1px solid ${COLORS.lightPink}` }}
    >
      {/* Login Required Toast */}
      {showLoginToast && (
        <div
          className="absolute left-1/2 -translate-x-1/2 -top-12 z-50 px-4 py-2 rounded-full shadow-lg"
          style={{
            background: COLORS.primaryPink,
            color: COLORS.white,
            fontSize: '0.8rem',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            animation: 'fadeInUp 0.3s ease-out',
          }}
        >
          Vui lòng đăng nhập để tương tác 💖
        </div>
      )}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>

      {/* Vote Box */}
      <div
        className="flex-shrink-0 flex items-center gap-0.5 px-2 py-1.5 transition-all duration-150 hover:shadow-[0_4px_12px_rgba(242,149,182,0.25)]"
        style={{
          border: `1.5px solid ${COLORS.lightPink}`,
          borderRadius: '50px',
          background: COLORS.white,
        }}
      >
        {/* Upvote */}
        <button
          onClick={() => onVoteClick('upvote')}
          disabled={isVoting}
          className="group p-0.5 transition-all duration-150 hover:scale-110 disabled:opacity-50 active:scale-95"
          title={isLoggedIn ? "Upvote" : "Đăng nhập để vote"}
        >
          <UpvoteIcon active={voteType === 'upvote'} size={16} />
        </button>

        {/* Vote Count */}
        <span
          className="min-w-[28px] text-center font-medium text-xs select-none"
          style={{ color: COLORS.primaryText }}
        >
          {netVotes}
        </span>

        {/* Downvote */}
        <button
          onClick={() => onVoteClick('downvote')}
          disabled={isVoting}
          className="group p-0.5 transition-all duration-150 hover:scale-110 disabled:opacity-50 active:scale-95"
          title={isLoggedIn ? "Downvote" : "Đăng nhập để vote"}
        >
          <DownvoteIcon active={voteType === 'downvote'} size={16} />
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 flex-shrink-0 overflow-visible">
        {/* Emoji Reaction */}
        <div className="relative flex-shrink-0 overflow-visible" ref={emojiPickerRef}>
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            disabled={isReacting}
            className="w-8 h-8 rounded-full transition-all duration-150 hover:scale-110 hover:shadow-[0_4px_12px_rgba(242,149,182,0.25)] disabled:opacity-50 active:scale-95 flex items-center justify-center"
            style={{
              background: COLORS.lighterPink,
              border: `1px solid ${COLORS.lightPink}`,
            }}
            title="React"
          >
            <span className="text-base leading-none">{selectedEmojiId ? EMOJI_LIST.find(e => e.id === selectedEmojiId)?.emoji || '😊' : '😊'}</span>
          </button>

          {/* Emoji Picker Dropdown */}
          {showEmojiPicker && (
            <div
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 flex gap-1 p-2"
              style={{
                background: COLORS.white,
                border: `1.5px solid ${COLORS.lightPink}`,
                borderRadius: '50px',
                boxShadow: '0 8px 24px rgba(242, 149, 182, 0.25)',
              }}
            >
              {EMOJI_LIST.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onEmojiClick(item.id)}
                  className="w-9 h-9 flex items-center justify-center rounded-full transition-all duration-150 hover:scale-125 active:scale-95"
                  style={{
                    background:
                      selectedEmojiId === item.id
                        ? COLORS.lighterPink
                        : 'transparent',
                  }}
                  title={item.label}
                >
                  <span className="text-xl">{item.emoji}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Comment */}
        <button
          onClick={() => navigate(`/post/${postId}`)}
          className="flex-shrink-0 flex items-center gap-1 px-2 py-1.5 transition-all duration-150 hover:scale-105 hover:shadow-[0_4px_12px_rgba(242,149,182,0.25)] active:scale-95"
          style={{
            border: `1.5px solid ${COLORS.lightPink}`,
            borderRadius: '50px',
            background: COLORS.white,
            color: COLORS.primaryPink,
          }}
          title="Comment"
        >
          <MessageCircle size={16} strokeWidth={2} />
          <span className="text-xs font-medium" style={{ color: COLORS.primaryText }}>
            {totalComments}
          </span>
        </button>

        {/* More Menu */}
        <div className="relative flex-shrink-0 overflow-visible" ref={moreMenuRef}>
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="w-7 h-7 flex items-center justify-center rounded-full transition-all duration-150 hover:scale-110 hover:shadow-[0_4px_12px_rgba(242,149,182,0.25)] active:scale-95"
            style={{
              background: showMoreMenu ? COLORS.lighterPink : 'transparent',
              color: COLORS.primaryPink,
            }}
            title="More"
          >
            <MoreHorizontal size={16} strokeWidth={2} />
          </button>

          {/* More Menu Dropdown */}
          {showMoreMenu && (
            <div
              className="absolute top-full right-0 mt-2 z-50 min-w-[140px] py-1.5"
              style={{
                background: COLORS.white,
                border: `1.5px solid ${COLORS.lightPink}`,
                borderRadius: '15px',
                boxShadow: '0 8px 24px rgba(242, 149, 182, 0.25)',
              }}
            >
              <button
                onClick={handleShare}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-all duration-150"
                style={{ color: COLORS.primaryText }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(242,149,182,0.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <Share2 size={16} style={{ color: COLORS.primaryPink }} />
                <span className="text-sm font-medium">Share</span>
              </button>
              <button
                onClick={handleRepost}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-all duration-150"
                style={{ color: COLORS.primaryText }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(242,149,182,0.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <Repeat2 size={16} style={{ color: COLORS.primaryPink }} />
                <span className="text-sm font-medium">Repost</span>
              </button>
              <button
                onClick={handleReport}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-all duration-150"
                style={{ color: COLORS.primaryText }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(242,149,182,0.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <Flag size={16} style={{ color: COLORS.primaryPink }} />
                <span className="text-sm font-medium">Report</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InteractBar;
