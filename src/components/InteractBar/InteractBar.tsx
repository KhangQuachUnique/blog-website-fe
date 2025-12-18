import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, MoreHorizontal, Share2, Repeat2, Flag, Bookmark } from 'lucide-react';
import { useInteractBar } from '../../hooks/useInteractBar';
import { useCheckSaved, useToggleSavePost } from '../../hooks/useSavedPost';

// ============================================
// 🎨 BLOOKIE DESIGN SYSTEM - PASTEL PINK EDITION
// ============================================
const THEME = {
  // Core Colors
  primary: '#F295B6',
  secondary: '#FFB8D1', 
  tertiary: '#FFE7F0',
  cream: '#FFF8FA',
  text: '#4A3C42',
  textMuted: '#8B7B82',
  white: '#FFFFFF',
  
  // Semantic
  upvote: '#F295B6',
  upvoteActive: '#E8779F',
  downvote: '#B8A5AB',
  downvoteActive: '#9B8A90',
  
  // Shadows
  shadowSoft: '0 2px 12px rgba(242, 149, 182, 0.15)',
  shadowMedium: '0 4px 20px rgba(242, 149, 182, 0.2)',
  shadowStrong: '0 8px 32px rgba(242, 149, 182, 0.25)',
};

// Backward compatibility - removed unused COLORS constant

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
// 🎯 CUSTOM ICONS - Soft Outline Style
// ============================================

// Upvote Arrow - Soft rounded style
const UpvoteArrow: React.FC<{ active?: boolean; size?: number }> = ({ 
  active = false, 
  size = 18 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none"
    style={{ transition: 'all 0.2s ease' }}
  >
    <path
      d="M12 4L4 14H9V20H15V14H20L12 4Z"
      fill={active ? THEME.upvoteActive : 'transparent'}
      stroke={active ? THEME.upvoteActive : THEME.secondary}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Downvote Arrow - Soft rounded style
const DownvoteArrow: React.FC<{ active?: boolean; size?: number }> = ({ 
  active = false, 
  size = 18 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none"
    style={{ transition: 'all 0.2s ease' }}
  >
    <path
      d="M12 20L20 10H15V4H9V10H4L12 20Z"
      fill={active ? THEME.downvoteActive : 'transparent'}
      stroke={active ? THEME.downvoteActive : THEME.secondary}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ============================================
// 🧩 SUB-COMPONENTS
// ============================================

// Floating Toast Notification
const Toast: React.FC<{ message: string; visible: boolean; anchorRect?: DOMRect | null }> = ({ message, visible, anchorRect }) => {
  if (!visible) return null;

  const toast = (
    <>
      <style>{`
        @keyframes toastSlideIn {
          0% { opacity: 0; transform: translateX(-50%) translateY(8px) scale(0.95); }
          100% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        }
      `}</style>
      <div
        style={{
          position: 'fixed',
          left: anchorRect ? `${anchorRect.left + anchorRect.width / 2}px` : '50%',
          top: anchorRect ? `${anchorRect.top - 8}px` : undefined,
          transform: anchorRect ? 'translateX(-50%) translateY(-100%)' : 'translateX(-50%)',
          background: `linear-gradient(135deg, ${THEME.primary} 0%, ${THEME.secondary} 100%)`,
          color: THEME.white,
          padding: '10px 20px',
          borderRadius: '24px',
          fontSize: '13px',
          fontWeight: 600,
          fontFamily: "'Quicksand', sans-serif",
          whiteSpace: 'nowrap',
          boxShadow: THEME.shadowStrong,
          animation: 'toastSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          zIndex: 1000,
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {message}
      </div>
    </>
  );

  return createPortal(toast, document.body);
};

// Vote Button Component
const VoteButton: React.FC<{
  direction: 'up' | 'down';
  active: boolean;
  disabled: boolean;
  onClick: () => void;
}> = ({ direction, active, disabled, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '28px',
        height: '28px',
        borderRadius: '50px',
        border: 'none',
        background: active 
          ? (direction === 'up' ? THEME.tertiary : '#F0E8EA')
          : isHovered 
            ? THEME.tertiary 
            : 'transparent',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
        transform: isHovered && !disabled ? 'scale(1.08)' : 'scale(1)',
      }}
    >
      {direction === 'up' 
        ? <UpvoteArrow active={active} size={14} />
        : <DownvoteArrow active={active} size={14} />
      }
    </button>
  );
};

// Emoji Picker Popup
const EmojiPicker: React.FC<{
  visible: boolean;
  selectedId: number | null;
  onSelect: (id: number) => void;
  anchorRect?: DOMRect | null;
}> = ({ visible, selectedId, onSelect, anchorRect }) => {
  if (!visible) return null;

  const picker = (
    <>
      <style>{`
        @keyframes emojiPickerPop {
          0% { opacity: 0; transform: translateX(-50%) scale(0.9) translateY(8px); }
          100% { opacity: 1; transform: translateX(-50%) scale(1) translateY(0); }
        }
        @keyframes emojiWiggle {
          0%, 100% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.15) rotate(-5deg); }
          75% { transform: scale(1.15) rotate(5deg); }
        }
      `}</style>
      <div
        style={{
          position: 'fixed',
          left: anchorRect ? `${anchorRect.left + anchorRect.width / 2}px` : '50%',
          top: anchorRect ? `${anchorRect.top}px` : undefined,
          transform: anchorRect ? 'translateX(-50%) translateY(-8px)' : 'translateX(-50%)',
          display: 'flex',
          gap: '4px',
          padding: '10px 14px',
          background: THEME.white,
          borderRadius: '28px',
          border: `1.5px solid ${THEME.secondary}`,
          boxShadow: THEME.shadowStrong,
          animation: 'emojiPickerPop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
          zIndex: 1000,
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {EMOJI_LIST.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            title={item.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: 'none',
              background: selectedId === item.id ? THEME.tertiary : 'transparent',
              cursor: 'pointer',
              fontSize: '22px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = THEME.tertiary;
              e.currentTarget.style.animation = 'emojiWiggle 0.4s ease';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = selectedId === item.id ? THEME.tertiary : 'transparent';
              e.currentTarget.style.animation = 'none';
            }}
          >
            {item.emoji}
          </button>
        ))}
      </div>
    </>
  );

  return createPortal(picker, document.body);
};

// More Menu Dropdown (rendered in a portal so it overlays without affecting layout)
const MoreMenu: React.FC<{
  visible: boolean;
  onShare: () => void;
  onRepost: () => void;
  onReport: () => void;
  anchorRect?: DOMRect | null;
}> = ({ visible, onShare, onRepost, onReport, anchorRect }) => {
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
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          width: '100%',
          padding: '12px 16px',
          border: 'none',
          background: isHovered ? THEME.tertiary : 'transparent',
          cursor: 'pointer',
          fontFamily: "'Quicksand', sans-serif",
          fontSize: '14px',
          fontWeight: 600,
          color: danger ? '#E57373' : THEME.text,
          transition: 'all 0.15s ease',
          textAlign: 'left',
        }}
      >
        <span style={{ 
          display: 'flex', 
          color: danger ? '#E57373' : THEME.primary,
          opacity: 0.9,
        }}>
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
        style={{
          position: 'fixed',
          top: anchorRect ? `${anchorRect.bottom + 8}px` : undefined,
          left: anchorRect ? `${anchorRect.right}px` : undefined,
          transform: anchorRect ? 'translateX(-100%)' : undefined,
          minWidth: '160px',
          background: THEME.white,
          borderRadius: '16px',
          border: `1.5px solid ${THEME.secondary}`,
          boxShadow: THEME.shadowStrong,
          overflow: 'hidden',
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
        <MenuItem 
          icon={<Repeat2 size={16} strokeWidth={2.5} />} 
          label="Đăng lại" 
          onClick={onRepost} 
        />
        <div style={{ 
          height: '1px', 
          background: THEME.tertiary, 
          margin: '4px 12px',
        }} />
        <MenuItem 
          icon={<Flag size={16} strokeWidth={2.5} />} 
          label="Báo cáo" 
          onClick={onReport}
          danger 
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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showLoginToast, setShowLoginToast] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [saveToastMessage, setSaveToastMessage] = useState('');
  const [commentHovered, setCommentHovered] = useState(false);
  const [moreHovered, setMoreHovered] = useState(false);
  const [bookmarkHovered, setBookmarkHovered] = useState(false);
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);
  
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

  // 🔖 Saved post hooks
  const { data: isSaved = false } = useCheckSaved(isLoggedIn ? userId : null, postId);
  const { mutate: toggleSave, isPending: isSaving } = useToggleSavePost();

  // Toast handler
  const showLoginRequired = () => {
    setShowLoginToast(true);
    setTimeout(() => setShowLoginToast(false), 2500);
  };

  // Vote with login check
  const onVoteClick = (type: 'upvote' | 'downvote') => {
    if (!isLoggedIn) {
      showLoginRequired();
      return;
    }
    handleVote(type);
  };

  // Emoji with login check  
  const onEmojiClick = (emojiId: number) => {
    if (!isLoggedIn) {
      showLoginRequired();
      setShowEmojiPicker(false);
      return;
    }
    handleEmojiReact(emojiId);
    setShowEmojiPicker(false);
  };

  // Bookmark with login check
  const onBookmarkClick = () => {
    if (!isLoggedIn) {
      showLoginRequired();
      return;
    }
    toggleSave(
      { userId, postId },
      {
        onSuccess: (result) => {
          setSaveToastMessage(result.isSaved ? 'Đã lưu bài viết 🔖' : 'Đã bỏ lưu bài viết');
          setShowSaveToast(true);
          setTimeout(() => setShowSaveToast(false), 2000);
        },
      }
    );
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

  // Get current emoji display
  const getCurrentEmoji = () => {
    if (selectedEmojiId) {
      const found = EMOJI_LIST.find((e) => e.id === selectedEmojiId);
      if (found) return found.emoji;
    }
    return '💗';
  };

  // Menu handlers
  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
    setShowMoreMenu(false);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 2000);
  };

  const handleRepost = () => {
    if (!isLoggedIn) {
      showLoginRequired();
      setShowMoreMenu(false);
      return;
    }
    setShowMoreMenu(false);
  };

  const handleReport = () => {
    if (!isLoggedIn) {
      showLoginRequired();
      setShowMoreMenu(false);
      return;
    }
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '10px',
        padding: '8px 12px',
        paddingBottom: `${computedPaddingBottom}px`,
        background: THEME.cream,
        borderTop: `1px solid ${THEME.tertiary}`,
        borderRadius: '0 0 10px 10px',
        fontFamily: "'Quicksand', sans-serif",
        position: 'relative',
      }}
    >
      {/* Toast (portal) */}
      <Toast message="Đăng nhập để tương tác 💕" visible={showLoginToast} anchorRect={wrapperRef.current?.getBoundingClientRect() ?? null} />
      <Toast message="Đã sao chép link! 📋" visible={showShareToast} anchorRect={wrapperRef.current?.getBoundingClientRect() ?? null} />
      <Toast message={saveToastMessage} visible={showSaveToast} anchorRect={wrapperRef.current?.getBoundingClientRect() ?? null} />

      {/* ===== LEFT: Vote Group ===== */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1px',
          padding: '3px 5px',
          background: THEME.white,
          borderRadius: '50px',
          border: `1.5px solid ${THEME.secondary}`,
          boxShadow: THEME.shadowSoft,
        }}
      >
        <VoteButton
          direction="up"
          active={voteType === 'upvote'}
          disabled={isVoting}
          onClick={() => onVoteClick('upvote')}
        />
        
        <span
          style={{
            minWidth: '28px',
            textAlign: 'center',
            fontSize: '13px',
            fontWeight: 700,
            color: voteType === 'upvote' 
              ? THEME.upvoteActive 
              : voteType === 'downvote'
                ? THEME.downvoteActive
                : THEME.text,
            fontFamily: "'Quicksand', sans-serif",
            userSelect: 'none',
            transition: 'color 0.2s ease',
          }}
        >
          {netVotes}
        </span>
        
        <VoteButton
          direction="down"
          active={voteType === 'downvote'}
          disabled={isVoting}
          onClick={() => onVoteClick('downvote')}
        />
      </div>

      {/* ===== MIDDLE: Bookmark Button ===== */}
      <button
        onClick={onBookmarkClick}
        disabled={isSaving}
        onMouseEnter={() => setBookmarkHovered(true)}
        onMouseLeave={() => setBookmarkHovered(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          padding: '6px 12px',
          background: isSaved ? THEME.tertiary : bookmarkHovered ? THEME.tertiary : THEME.white,
          border: `1.5px solid ${isSaved ? THEME.primary : THEME.secondary}`,
          borderRadius: '50px',
          cursor: isSaving ? 'not-allowed' : 'pointer',
          opacity: isSaving ? 0.5 : 1,
          boxShadow: THEME.shadowSoft,
          transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transform: bookmarkHovered ? 'scale(1.05)' : 'scale(1)',
        }}
      >
        <Bookmark
          size={14}
          strokeWidth={2.5}
          fill={isSaved ? THEME.primary : 'none'}
          style={{ 
            color: isSaved ? THEME.primary : THEME.textMuted,
            transition: 'all 0.2s ease',
          }}
        />
        <span
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: isSaved ? THEME.primary : THEME.text,
            fontFamily: "'Quicksand', sans-serif",
          }}
        >
          {isSaved ? 'Đã lưu' : 'Lưu'}
        </span>
      </button>

      {/* ===== RIGHT: Emoji, Comment & More ===== */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {/* Emoji React */}
        <div 
          ref={emojiPickerRef}
          style={{ position: 'relative' }}
        >
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            disabled={isReacting}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: '50px',
              border: `1.5px solid ${selectedEmojiId ? THEME.primary : THEME.secondary}`,
              background: selectedEmojiId ? THEME.tertiary : THEME.white,
              cursor: isReacting ? 'not-allowed' : 'pointer',
              opacity: isReacting ? 0.5 : 1,
              fontSize: '14px',
              boxShadow: THEME.shadowSoft,
              transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
              transform: showEmojiPicker ? 'scale(1.05)' : 'scale(1)',
            }}
            onMouseEnter={(e) => {
              if (!isReacting) e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              if (!showEmojiPicker) e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {getCurrentEmoji()}
          </button>
          
          <EmojiPicker
            visible={showEmojiPicker}
            selectedId={selectedEmojiId}
            onSelect={onEmojiClick}
            anchorRect={emojiPickerRef.current?.getBoundingClientRect() ?? null}
          />
        </div>

        {/* Comment Button */}
        <button
          onClick={() => navigate(`/post/${postId}`)}
          onMouseEnter={() => setCommentHovered(true)}
          onMouseLeave={() => setCommentHovered(false)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 10px',
            background: commentHovered ? THEME.tertiary : THEME.white,
            border: `1.5px solid ${THEME.secondary}`,
            borderRadius: '50px',
            cursor: 'pointer',
            boxShadow: THEME.shadowSoft,
            transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transform: commentHovered ? 'scale(1.05)' : 'scale(1)',
          }}
        >
          <MessageCircle 
            size={14} 
            strokeWidth={2.5}
            style={{ color: THEME.primary }}
          />
          <span
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: THEME.text,
              fontFamily: "'Quicksand', sans-serif",
            }}
          >
            {totalComments}
          </span>
        </button>

        {/* More Menu Button */}
        <div ref={moreMenuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            onMouseEnter={() => setMoreHovered(true)}
            onMouseLeave={() => setMoreHovered(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: '50px',
              border: `1.5px solid ${showMoreMenu ? THEME.primary : THEME.secondary}`,
              background: showMoreMenu ? THEME.tertiary : moreHovered ? THEME.tertiary : THEME.white,
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
              transform: moreHovered ? 'scale(1.05)' : 'scale(1)',
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
            onRepost={handleRepost}
            onReport={handleReport}
            anchorRect={moreMenuRef.current?.getBoundingClientRect() ?? null}
          />
        </div>
      </div>
    </div>
  );
};

export default InteractBar;
