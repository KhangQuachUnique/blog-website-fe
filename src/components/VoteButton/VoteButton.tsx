import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useVote } from '../../hooks/useVote';
import type { VoteButtonProps, VoteType } from '../../types/vote.types';
import UpvoteIcon from './UpvoteIcon';
import DownvoteIcon from './DownvoteIcon';

// ============================================
// THEME
// ============================================
const THEME = {
  primary: '#F295B6',
  secondary: '#E8BCC8',
  tertiary: '#FFF0F5',
  white: '#FFFFFF',
  text: '#4A4A4A',
  upvoteActive: '#E8779F',
  downvoteActive: '#9B8A90',
  shadowSoft: '0 2px 12px rgba(242, 149, 182, 0.15)',
};

// ============================================
// SIZE CONFIGURATIONS
// ============================================
const SIZE_CONFIG = {
  sm: {
    iconSize: 16,
    fontSize: '11px',
    padding: '2px 4px',
    buttonSize: '24px',
    minWidth: '24px',
  },
  md: {
    iconSize: 18,
    fontSize: '13px',
    padding: '3px 5px',
    buttonSize: '28px',
    minWidth: '28px',
  },
  lg: {
    iconSize: 20,
    fontSize: '14px',
    padding: '4px 6px',
    buttonSize: '32px',
    minWidth: '32px',
  },
};

// ============================================
// VOTE BUTTON COMPONENT
// ============================================
interface VoteButtonInternalProps {
  direction: 'up' | 'down';
  active: boolean;
  disabled: boolean;
  onClick: () => void;
  size: 'sm' | 'md' | 'lg';
}

const VoteButtonInternal: React.FC<VoteButtonInternalProps> = ({
  direction,
  active,
  disabled,
  onClick,
  size,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const config = SIZE_CONFIG[size];

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
        width: config.buttonSize,
        height: config.buttonSize,
        borderRadius: '50px',
        border: 'none',
        background: active
          ? direction === 'up'
            ? THEME.tertiary
            : '#F0E8EA'
          : isHovered
          ? THEME.tertiary
          : 'transparent',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
        transform: isHovered && !disabled ? 'scale(1.1)' : 'scale(1)',
      }}
    >
      {direction === 'up' ? (
        <UpvoteIcon active={active} size={config.iconSize} />
      ) : (
        <DownvoteIcon active={active} size={config.iconSize} />
      )}
    </button>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
/**
 * VoteButton Component - Reusable vote button with optimistic updates
 * 
 * @example
 * // Using vote from post response (recommended)
 * <VoteButton 
 *   postId={1} 
 *   userId={123}
 *   vote={post.vote}
 * />
 * 
 * @example
 * // With fallback values
 * <VoteButton 
 *   postId={1} 
 *   userId={123}
 *   initialUpVotes={10}
 *   initialDownVotes={2}
 * />
 */
const VoteButton: React.FC<VoteButtonProps> = ({
  postId,
  userId,
  votes,
  initialVoteType = null,
  initialUpVotes = 0,
  initialDownVotes = 0,
  onVoteChange,
  size = 'md',
  showCount = true,
}) => {
  const config = SIZE_CONFIG[size];
  
  // Use vote from props or fallback to initial values
  const [upVotes, setUpVotes] = useState(votes?.upvotes ?? initialUpVotes);
  const [downVotes, setDownVotes] = useState(votes?.downvotes ?? initialDownVotes);
  const [currentVoteType, setCurrentVoteType] = useState<VoteType | null>(
    votes?.userVote ?? initialVoteType
  );
  
  // Sync state when vote prop changes (e.g., from server refetch)
  useEffect(() => {
    if (votes) {
      setUpVotes(votes.upvotes);
      setDownVotes(votes.downvotes);
      setCurrentVoteType(votes.userVote);
    }
  }, [votes]);
  
  // React Query mutation hook
  const voteMutation = useVote(userId, postId);
  
  const netVotes = upVotes - downVotes;
  
  // Debounce mechanism
  const lastVoteTimeRef = useRef<number>(0);
  const VOTE_DEBOUNCE_MS = 500;

  // Handle vote with optimistic update
  const handleVote = useCallback(
    async (type: VoteType) => {
      if (!userId || userId <= 0) {
        console.warn('User not logged in');
        return;
      }

      if (voteMutation.isPending) return;

      // Debounce
      const now = Date.now();
      if (now - lastVoteTimeRef.current < VOTE_DEBOUNCE_MS) {
        return;
      }
      lastVoteTimeRef.current = now;

      // Save previous state for rollback
      const prevVoteType = currentVoteType;
      const prevUpVotes = upVotes;
      const prevDownVotes = downVotes;

      // Optimistic update
      let newVoteType: VoteType | null = type;
      let newUpVotes = upVotes;
      let newDownVotes = downVotes;

      if (currentVoteType === type) {
        // Toggle off
        newVoteType = null;
        if (type === 'upvote') newUpVotes = Math.max(0, upVotes - 1);
        else newDownVotes = Math.max(0, downVotes - 1);
      } else {
        // Switch or new vote
        if (currentVoteType === 'upvote') newUpVotes = Math.max(0, upVotes - 1);
        if (currentVoteType === 'downvote') newDownVotes = Math.max(0, downVotes - 1);
        if (type === 'upvote') newUpVotes += 1;
        else newDownVotes += 1;
      }

      // Update local state immediately (optimistic)
      setUpVotes(newUpVotes);
      setDownVotes(newDownVotes);
      setCurrentVoteType(newVoteType);
      onVoteChange?.(newVoteType, newUpVotes, newDownVotes);

      // API call
      try {
        const response = await voteMutation.mutateAsync(type);
        
        // Update with server data
        setUpVotes(response.upVotes);
        setDownVotes(response.downVotes);
        setCurrentVoteType(response.voteType);
        onVoteChange?.(response.voteType, response.upVotes, response.downVotes);
      } catch (error) {
        // Rollback on error
        setUpVotes(prevUpVotes);
        setDownVotes(prevDownVotes);
        setCurrentVoteType(prevVoteType);
        onVoteChange?.(prevVoteType, prevUpVotes, prevDownVotes);
        console.error('Vote failed:', error);
      }
    },
    [userId, postId, currentVoteType, upVotes, downVotes, voteMutation, onVoteChange]
  );

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1px',
        padding: config.padding,
        background: THEME.white,
        borderRadius: '50px',
        border: `1.5px solid ${THEME.secondary}`,
        boxShadow: THEME.shadowSoft,
      }}
    >
      <VoteButtonInternal
        direction="up"
        active={currentVoteType === 'upvote'}
        disabled={voteMutation.isPending}
        onClick={() => handleVote('upvote')}
        size={size}
      />

      {showCount && (
        <span
          style={{
            minWidth: config.minWidth,
            textAlign: 'center',
            fontSize: config.fontSize,
            fontWeight: 700,
            color:
              currentVoteType === 'upvote'
                ? THEME.upvoteActive
                : currentVoteType === 'downvote'
                ? THEME.downvoteActive
                : THEME.text,
            fontFamily: "'Quicksand', sans-serif",
            userSelect: 'none',
            transition: 'color 0.2s ease',
          }}
        >
          {netVotes}
        </span>
      )}

      <VoteButtonInternal
        direction="down"
        active={currentVoteType === 'downvote'}
        disabled={voteMutation.isPending}
        onClick={() => handleVote('downvote')}
        size={size}
      />
    </div>
  );
};

export default VoteButton;
