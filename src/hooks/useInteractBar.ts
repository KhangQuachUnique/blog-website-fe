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
      if (!userId) return; // Don't vote if not logged in
      if (isVoting) return; // Already processing a vote

      // Debounce rapid clicks
      const now = Date.now();
      if (now - lastVoteTimeRef.current < VOTE_DEBOUNCE_MS) {
        console.log('Vote debounced - too fast');
        return;
      }
      lastVoteTimeRef.current = now;

      setIsVoting(true);

      // Save previous state for rollback
      const prevVoteType = voteType;
      const prevUpVotes = upVotes;
      const prevDownVotes = downVotes;

      // Optimistic update IMMEDIATELY - no blocking
      if (voteType === type) {
        // Toggle off
        setVoteType(null);
        if (type === 'upvote') setUpVotes((v) => v - 1);
        else setDownVotes((v) => v - 1);
      } else {
        // Switch or new vote
        if (voteType === 'upvote') setUpVotes((v) => v - 1);
        if (voteType === 'downvote') setDownVotes((v) => v - 1);
        setVoteType(type);
        if (type === 'upvote') setUpVotes((v) => v + 1);
        else setDownVotes((v) => v + 1);
      }

      // API call in background
      try {
        const response = await votePost(userId, postId, type);

        // Only update if server returns different values
        if (response.upVotes !== undefined) setUpVotes(response.upVotes);
        if (response.downVotes !== undefined) setDownVotes(response.downVotes);
        if (response.voteType !== undefined) setVoteType(response.voteType);
      } catch (error) {
        // Rollback on error
        setVoteType(prevVoteType);
        setUpVotes(prevUpVotes);
        setDownVotes(prevDownVotes);
        console.error('Vote failed:', error);
      } finally {
        setIsVoting(false);
      }
    },
    [userId, postId, voteType, upVotes, downVotes, isVoting]
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
