import { useState, useEffect, useCallback, useRef } from 'react';
import {
  votePost,
  getVoteStatus,
  reactWithEmoji,
  getUserEmojiReaction,
} from '../api/interact';
import type { VoteType } from '../types/interact.types';

// ============================================
// TYPES
// ============================================
export interface UseInteractBarProps {
  postId: number;
  userId: number;
  initialUpVotes?: number;
  initialDownVotes?: number;
}

export interface UseInteractBarReturn {
  // Vote
  voteType: VoteType | null;
  upVotes: number;
  downVotes: number;
  isVoting: boolean;
  handleVote: (type: VoteType) => Promise<void>;

  // Emoji - now uses emojiId instead of full object
  selectedEmojiId: number | null;
  isReacting: boolean;
  handleEmojiReact: (emojiId: number) => Promise<void>;

  // Loading
  isLoading: boolean;
}

// ============================================
// HOOK
// ============================================
export const useInteractBar = ({
  postId,
  userId,
  initialUpVotes = 0,
  initialDownVotes = 0,
}: UseInteractBarProps): UseInteractBarReturn => {
  // Vote states
  const [voteType, setVoteType] = useState<VoteType | null>(null);
  const [upVotes, setUpVotes] = useState(initialUpVotes);
  const [downVotes, setDownVotes] = useState(initialDownVotes);
  const [isVoting, setIsVoting] = useState(false);

  // Emoji states - use emojiId instead of full object
  const [selectedEmojiId, setSelectedEmojiId] = useState<number | null>(null);
  const [isReacting, setIsReacting] = useState(false);

  // Loading
  const [isLoading, setIsLoading] = useState(true);

  // ============================================
  // LOAD INITIAL DATA
  // ============================================
  useEffect(() => {
    const loadData = async () => {
      if (!userId || !postId) return;

      setIsLoading(true);
      try {
        // Load vote status
        const voteRes = await getVoteStatus(userId, postId);
        if (voteRes) {
          setVoteType(voteRes.voteType);
          if (voteRes.upVotes !== undefined) setUpVotes(voteRes.upVotes);
          if (voteRes.downVotes !== undefined) setDownVotes(voteRes.downVotes);
        }

        // Load emoji reaction - extract emojiId from response
        const emojiRes = await getUserEmojiReaction(userId, postId);
        if (emojiRes && emojiRes.emoji?.id) {
          setSelectedEmojiId(emojiRes.emoji.id);
        } else {
          setSelectedEmojiId(null);
        }
      } catch (error) {
        console.error('Failed to load interact data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [userId, postId]);

  // ============================================
  // VOTE HANDLER
  // ============================================
  // Track last vote time to debounce rapid clicks
  const lastVoteTimeRef = useRef<number>(0);
  const VOTE_DEBOUNCE_MS = 500; // Minimum time between votes
  
  const handleVote = useCallback(
    async (type: VoteType) => {
      if (!userId) return;
      if (isVoting) return;

      // Debounce
      const now = Date.now();
      if (now - lastVoteTimeRef.current < VOTE_DEBOUNCE_MS) {
        console.log('Vote debounced');
        return;
      }
      lastVoteTimeRef.current = now;

      setIsVoting(true);

      // Save previous for rollback
      const prevVoteType = voteType;

      let prevUp = upVotes;
      let prevDown = downVotes;

      // --------------------------------------------
      // OPTIMISTIC UPDATE
      // --------------------------------------------
      setUpVotes((u) => {
        prevUp = u;
        if (voteType === 'upvote' && type === 'upvote') return u - 1; // toggle off
        if (voteType === 'downvote' && type === 'upvote') return u + 1; // switch down → up
        if (voteType === 'upvote' && type === 'downvote') return u - 1; // switch up → down (remove upvote)
        if (!voteType && type === 'upvote') return u + 1; // new upvote
        return u;
      });

      setDownVotes((d) => {
        prevDown = d;
        if (voteType === 'downvote' && type === 'downvote') return d - 1; // toggle off
        if (voteType === 'upvote' && type === 'downvote') return d + 1; // switch up → down
        if (voteType === 'downvote' && type === 'upvote') return d - 1; // switch down → up (remove downvote)
        if (!voteType && type === 'downvote') return d + 1; // new downvote
        return d;
      });

      setVoteType((prev) => (prev === type ? null : type));

      // --------------------------------------------
      // API CALL — only confirm, never overwrite
      // --------------------------------------------
      try {
        await votePost(userId, postId, type);
      } catch (error) {
        console.error('Vote failed:', error);

        // rollback đúng
        setVoteType(prevVoteType);
        setUpVotes(prevUp);
        setDownVotes(prevDown);
      } finally {
        setIsVoting(false);
      }
    },
    [userId, postId, voteType, isVoting]
  );

  // ============================================
  // EMOJI HANDLER
  // ============================================
  const handleEmojiReact = useCallback(
    async (emojiId: number) => {
      if (isReacting || !userId) return; // Don't react if not logged in

      setIsReacting(true);
      const prevEmojiId = selectedEmojiId;

      try {
        // Optimistic update - toggle or set new emojiId
        if (selectedEmojiId === emojiId) {
          // Same emoji clicked = remove reaction
          setSelectedEmojiId(null);
        } else {
          // Different emoji = set new one
          setSelectedEmojiId(emojiId);
        }

        // API call
        const response = await reactWithEmoji(userId, postId, emojiId);

        // Update from server response
        if ('message' in response && response.message === 'React removed') {
          setSelectedEmojiId(null);
        } else if ('emoji' in response && response.emoji?.id) {
          setSelectedEmojiId(response.emoji.id);
        }
      } catch (error) {
        // Rollback on error
        setSelectedEmojiId(prevEmojiId);
        console.error('React failed:', error);
      } finally {
        setIsReacting(false);
      }
    },
    [userId, postId, selectedEmojiId, isReacting]
  );

  return {
    voteType,
    upVotes,
    downVotes,
    isVoting,
    handleVote,
    selectedEmojiId,
    isReacting,
    handleEmojiReact,
    isLoading,
  };
};

export default useInteractBar;
