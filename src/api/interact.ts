import axiosInstance from '../config/axiosCustomize';
import type { VoteType, VoteResponse, EmojiReaction } from '../types/interact.types';

// Re-export types for convenience
export type { VoteType, VoteResponse, EmojiReaction } from '../types/interact.types';

// ============================================
// 1. VOTE APIs (Legacy - Use vote.service.ts instead)
// ============================================

/**
 * Toggle vote (upvote/downvote)
 * @deprecated Use votePost from '../services/vote.service' instead
 */
export const votePost = async (
  userId: number,
  postId: number,
  voteType: VoteType
): Promise<VoteResponse> => {
  const response = await axiosInstance.post('/votes', {
    userId: Number(userId),
    postId: Number(postId),
    voteType,
  });
  return response.data as VoteResponse;
};

/**
 * Lấy trạng thái vote hiện tại
 * @deprecated Use getVoteStatus from '../services/vote.service' instead
 */
export const getVoteStatus = async (
  userId: number,
  postId: number
): Promise<VoteResponse> => {
  const response = await axiosInstance.get('/votes/status', {
    params: { userId, postId },
  });
  return response.data as VoteResponse;
};

// ============================================
// 2. EMOJI REACTION APIs
// ============================================

/**
 * Toggle emoji reaction
 */
export const reactWithEmoji = async (
  userId: number,
  postId: number,
  emojiId: number
): Promise<EmojiReaction | { message: string }> => {
  const response = await axiosInstance.post('/user-reacts', {
    userId: Number(userId),
    postId: Number(postId),
    emojiId: Number(emojiId),
    type: 'post',
  });
  return response as unknown as EmojiReaction | { message: string };
};

/**
 * Lấy emoji reaction của user
 */
export const getUserEmojiReaction = async (
  userId: number,
  postId: number
): Promise<EmojiReaction | null> => {
  try {
    const response = await axiosInstance.get(
      `/user-reacts/posts/${Number(postId)}/user/${Number(userId)}`
    );
    return response as unknown as EmojiReaction;
  } catch {
    return null;
  }
};
