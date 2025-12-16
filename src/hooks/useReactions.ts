import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPostReactions,
  getCommentReactions,
  togglePostReact,
  toggleCommentReact,
  type ToggleReactDto,
  type UserReactSummary,
} from '../services/user/reactions/reactionService';
import { useAuth } from '../contexts/AuthContext';

// ============================================
// 🔑 Query Keys
// ============================================

export const REACTION_QUERY_KEYS = {
  post: (postId: number) => ['reactions', 'post', postId] as const,
  comment: (commentId: number) => ['reactions', 'comment', commentId] as const,
};

// ============================================
// 🔍 Query Hooks - Read Operations
// ============================================

/**
 * Fetch reactions for a POST
 */
export const usePostReactions = (postId: number, options?: { enabled?: boolean }) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: REACTION_QUERY_KEYS.post(postId),
    queryFn: () => getPostReactions(postId, user?.id),
    enabled: options?.enabled !== false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Fetch reactions for a COMMENT
 */
export const useCommentReactions = (commentId: number, options?: { enabled?: boolean }) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: REACTION_QUERY_KEYS.comment(commentId),
    queryFn: () => getCommentReactions(commentId, user?.id),
    enabled: options?.enabled !== false,
    staleTime: 5 * 60 * 1000,
  });
};

// ============================================
// 🔄 Mutation Hooks - Write Operations
// ============================================

/**
 * Toggle reaction for POST
 * - Auto refetch reactions after success
 */
export const useTogglePostReact = (postId: number) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (dto: Omit<ToggleReactDto, 'postId'>) =>
      togglePostReact({ ...dto, postId }),

    onSuccess: async () => {
      // Invalidate and refetch
      await queryClient.invalidateQueries({
        queryKey: REACTION_QUERY_KEYS.post(postId),
      });
    },

    // Optimistic update (optional)
    onMutate: async (dto) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: REACTION_QUERY_KEYS.post(postId),
      });

      // Snapshot previous value
      const previousData = queryClient.getQueryData<UserReactSummary>(
        REACTION_QUERY_KEYS.post(postId)
      );

      // Optimistically update
      if (previousData && user) {
        queryClient.setQueryData<UserReactSummary>(
          REACTION_QUERY_KEYS.post(postId),
          (old) => {
            if (!old) return old;

            const existingEmojiIndex = old.emojis.findIndex(
              (e) => e.emojiId === dto.emojiId
            );

            if (existingEmojiIndex >= 0) {
              // Emoji exists
              const emoji = old.emojis[existingEmojiIndex];
              
              if (emoji.reactedByCurrentUser) {
                // User already reacted → Toggle off
                const newEmojis = [...old.emojis];
                newEmojis[existingEmojiIndex] = {
                  ...emoji,
                  totalCount: emoji.totalCount - 1,
                  reactedByCurrentUser: false,
                };

                // Remove emoji if count = 0
                if (newEmojis[existingEmojiIndex].totalCount === 0) {
                  newEmojis.splice(existingEmojiIndex, 1);
                }

                return {
                  ...old,
                  emojis: newEmojis,
                  totalReactions: old.totalReactions - 1,
                };
              } else {
                // User not reacted → Toggle on
                const newEmojis = [...old.emojis];
                newEmojis[existingEmojiIndex] = {
                  ...emoji,
                  totalCount: emoji.totalCount + 1,
                  reactedByCurrentUser: true,
                };

                return {
                  ...old,
                  emojis: newEmojis,
                  totalReactions: old.totalReactions + 1,
                };
              }
            } else {
              // New emoji → Add
              return {
                ...old,
                emojis: [
                  ...old.emojis,
                  {
                    emojiId: dto.emojiId,
                    type: 'unicode', // Assume unicode for now
                    totalCount: 1,
                    reactedByCurrentUser: true,
                  },
                ],
                totalReactions: old.totalReactions + 1,
              };
            }
          }
        );
      }

      return { previousData };
    },

    // Rollback on error
    onError: (err, dto, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          REACTION_QUERY_KEYS.post(postId),
          context.previousData
        );
      }
    },
  });
};

/**
 * Toggle reaction for COMMENT
 */
export const useToggleCommentReact = (commentId: number) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (dto: Omit<ToggleReactDto, 'commentId'>) =>
      toggleCommentReact({ ...dto, commentId }),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: REACTION_QUERY_KEYS.comment(commentId),
      });
    },

    // Similar optimistic update logic as post
    onMutate: async (dto) => {
      await queryClient.cancelQueries({
        queryKey: REACTION_QUERY_KEYS.comment(commentId),
      });

      const previousData = queryClient.getQueryData<UserReactSummary>(
        REACTION_QUERY_KEYS.comment(commentId)
      );

      if (previousData && user) {
        queryClient.setQueryData<UserReactSummary>(
          REACTION_QUERY_KEYS.comment(commentId),
          (old) => {
            if (!old) return old;

            const existingEmojiIndex = old.emojis.findIndex(
              (e) => e.emojiId === dto.emojiId
            );

            if (existingEmojiIndex >= 0) {
              const emoji = old.emojis[existingEmojiIndex];
              
              if (emoji.reactedByCurrentUser) {
                const newEmojis = [...old.emojis];
                newEmojis[existingEmojiIndex] = {
                  ...emoji,
                  totalCount: emoji.totalCount - 1,
                  reactedByCurrentUser: false,
                };

                if (newEmojis[existingEmojiIndex].totalCount === 0) {
                  newEmojis.splice(existingEmojiIndex, 1);
                }

                return {
                  ...old,
                  emojis: newEmojis,
                  totalReactions: old.totalReactions - 1,
                };
              } else {
                const newEmojis = [...old.emojis];
                newEmojis[existingEmojiIndex] = {
                  ...emoji,
                  totalCount: emoji.totalCount + 1,
                  reactedByCurrentUser: true,
                };

                return {
                  ...old,
                  emojis: newEmojis,
                  totalReactions: old.totalReactions + 1,
                };
              }
            } else {
              return {
                ...old,
                emojis: [
                  ...old.emojis,
                  {
                    emojiId: dto.emojiId,
                    type: 'unicode',
                    totalCount: 1,
                    reactedByCurrentUser: true,
                  },
                ],
                totalReactions: old.totalReactions + 1,
              };
            }
          }
        );
      }

      return { previousData };
    },

    onError: (err, dto, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          REACTION_QUERY_KEYS.comment(commentId),
          context.previousData
        );
      }
    },
  });
};
