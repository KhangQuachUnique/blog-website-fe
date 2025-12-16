import axiosInstance from '../../../config/axiosCustomize';

export interface ReactRequest {
  userId: number;
  unicodeCodepoint?: string;
  emojiId?: number;
  targetType: 'post' | 'comment';
  postId?: number;
  commentId?: number;
}

export interface UnreactRequest {
  userId: number;
  targetType: 'post' | 'comment';
  postId?: number;
  commentId?: number;
}

export interface EmojiReaction {
  type: 'unicode' | 'custom';
  icon: string;
  count: number;
  is_reacted_by_me: boolean;
  emoji_id: number;
}

export interface EmojiBarResponse {
  reactions: EmojiReaction[];
}

export interface ReactSuccessResponse {
  message: string;
  data: EmojiBarResponse;
}

/**
 * React with emoji to a post or comment
 */
export const reactWithEmoji = async (data: ReactRequest): Promise<ReactSuccessResponse> => {
  const response = await axiosInstance.post('/user-reacts/react', data);
  return response as unknown as ReactSuccessResponse;
};

/**
 * Remove emoji reaction
 */
export const unreact = async (data: UnreactRequest): Promise<void> => {
  await axiosInstance.post('/user-reacts/unreact', data);
};

/**
 * Get emoji bar for a post or comment
 */
export const getEmojiBar = async (
  targetType: 'post' | 'comment',
  targetId: number,
  userId?: number
): Promise<EmojiBarResponse> => {
  const params = userId ? { userId } : {};
  const response = await axiosInstance.get(`/user-reacts/emoji-bar/${targetType}/${targetId}`, { params });
  return response as unknown as EmojiBarResponse;
};
