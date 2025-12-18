import axiosInstance from '../../../config/axiosCustomize';

// ============================================
// 🎯 DTOs - Match Backend
// ============================================

/**
 * DTO để toggle reaction (giống BE ToggleReactDto)
 */
export interface ToggleReactDto {
  userId: number;
  /** ID của custom emoji hoặc emoji đã có trong DB */
  emojiId?: number;
  /** Unicode codepoint (e.g., "1f604" cho 😄) - dùng cho unicode emoji */
  unicodeCodepoint?: string;
  postId?: number;
  commentId?: number;
}

/**
 * Single emoji summary trong emoji bar
 */
export interface EmojiSummary {
  emojiId: number;
  type: 'unicode' | 'custom';
  codepoint?: string;
  emojiUrl?: string;
  totalCount: number;
  reactedByCurrentUser: boolean;
}

/**
 * Response DTO cho emoji bar của post/comment
 */
export interface UserReactSummary {
  targetId: number;
  targetType: 'post' | 'comment';
  emojis: EmojiSummary[];
  totalReactions: number;
}

/**
 * Response sau khi toggle
 */
export interface ToggleReactResponse {
  message: string;
}

// ============================================
// 🔄 API Functions - Match Backend Endpoints
// ============================================

/**
 * Toggle react cho POST
 * - Click 1 lần = react
 * - Click lần 2 = unreact
 * 
 * POST /user-reacts/posts/toggle
 */
export const togglePostReact = async (dto: ToggleReactDto): Promise<ToggleReactResponse> => {
  const response = await axiosInstance.post('/user-reacts/posts/toggle', dto);
  return response as unknown as ToggleReactResponse;
};

/**
 * Toggle react cho COMMENT
 * 
 * POST /user-reacts/comments/toggle
 */
export const toggleCommentReact = async (dto: ToggleReactDto): Promise<ToggleReactResponse> => {
  const response = await axiosInstance.post('/user-reacts/comments/toggle', dto);
  return response as unknown as ToggleReactResponse;
};

/**
 * Lấy reactions của POST
 * 
 * GET /user-reacts/posts/:postId?userId=
 */
export const getPostReactions = async (
  postId: number,
  userId?: number
): Promise<UserReactSummary> => {
  const params = userId ? { userId } : {};
  const response = await axiosInstance.get(`/user-reacts/posts/${postId}`, { params });
  return response as unknown as UserReactSummary;
};

/**
 * Lấy reactions của COMMENT
 * 
 * GET /user-reacts/comments/:commentId?userId=
 */
export const getCommentReactions = async (
  commentId: number,
  userId?: number
): Promise<UserReactSummary> => {
  const params = userId ? { userId } : {};
  const response = await axiosInstance.get(`/user-reacts/comments/${commentId}`, { params });
  return response as unknown as UserReactSummary;
};

/**
 * Batch query: Lấy reactions của NHIỀU POSTS
 * 
 * GET /user-reacts/posts/batch?postIds=1,2,3&userId=
 */
export const getPostReactionsBatch = async (
  postIds: number[],
  userId?: number
): Promise<Record<number, UserReactSummary>> => {
  const params: any = { postIds: postIds.join(',') };
  if (userId) params.userId = userId;
  
  const response = await axiosInstance.get('/user-reacts/posts/batch', { params });
  return response as unknown as Record<number, UserReactSummary>;
};

// ============================================
// 🔄 Legacy Compatibility (deprecated)
// ============================================

/**
 * @deprecated Use togglePostReact or toggleCommentReact instead
 */
export const reactWithEmoji = async (data: {
  userId: number;
  emojiId: number;
  targetType: 'post' | 'comment';
  postId?: number;
  commentId?: number;
}): Promise<{ data: UserReactSummary }> => {
  const dto: ToggleReactDto = {
    userId: data.userId,
    emojiId: data.emojiId,
    postId: data.postId,
    commentId: data.commentId,
  };

  if (data.targetType === 'post') {
    await togglePostReact(dto);
    const reactions = await getPostReactions(data.postId!, data.userId);
    return { data: reactions };
  } else {
    await toggleCommentReact(dto);
    const reactions = await getCommentReactions(data.commentId!, data.userId);
    return { data: reactions };
  }
};

/**
 * @deprecated Use getPostReactions or getCommentReactions instead
 */
export const getEmojiBar = async (
  targetType: 'post' | 'comment',
  targetId: number,
  userId?: number
): Promise<UserReactSummary> => {
  if (targetType === 'post') {
    return getPostReactions(targetId, userId);
  } else {
    return getCommentReactions(targetId, userId);
  }
};

// ============================================
// 🔄 Type Aliases (for backward compatibility)
// ============================================

/**
 * @deprecated Use EmojiSummary instead
 */
export type EmojiReaction = EmojiSummary & {
  // Map old fields to new
  icon: string;
  count: number;
  is_reacted_by_me: boolean;
  emoji_id: number;
};

/**
 * @deprecated Use UserReactSummary instead
 */
export type EmojiBarResponse = {
  reactions: EmojiReaction[];
};
