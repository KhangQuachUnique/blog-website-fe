import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  toggleSavePost,
  checkIfSaved,
  batchCheckSaved,
  getUserSavedPosts,
  getSavedPostsCount,
  removeSavedPost,
} from '../services/user/savedPost/savedPostService';
import type { ToggleSavedPostDto, SavedPostListResponse } from '../types/savedPost';

// ============================================
// 🔖 Saved Post React Query Hooks
// ============================================

/**
 * 🔍 Hook to check if a single post is saved
 */
export const useCheckSaved = (userId: number | null, postId: number) => {
  return useQuery({
    queryKey: ['savedPost', 'check', userId, postId],
    queryFn: () => checkIfSaved(userId!, postId),
    enabled: !!userId && postId > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * 🔍 Hook to batch check multiple posts (for newsfeed)
 */
export const useBatchCheckSaved = (
  userId: number | null,
  postIds: number[]
) => {
  return useQuery({
    queryKey: ['savedPost', 'batchCheck', userId, postIds.sort().join(',')],
    queryFn: () => batchCheckSaved(userId!, postIds),
    enabled: !!userId && postIds.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * 🔄 Hook to toggle save/unsave post
 * Includes optimistic update for instant UI feedback
 */
export const useToggleSavePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: ToggleSavedPostDto) => toggleSavePost(dto),

    // Optimistic update
    onMutate: async (dto) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ['savedPost', 'check', dto.userId, dto.postId],
      });

      // Snapshot previous value
      const previousValue = queryClient.getQueryData<boolean>([
        'savedPost',
        'check',
        dto.userId,
        dto.postId,
      ]);

      // Optimistically update
      queryClient.setQueryData(
        ['savedPost', 'check', dto.userId, dto.postId],
        !previousValue
      );

      return { previousValue };
    },

    // Rollback on error
    onError: (_err, dto, context) => {
      if (context?.previousValue !== undefined) {
        queryClient.setQueryData(
          ['savedPost', 'check', dto.userId, dto.postId],
          context.previousValue
        );
      }
    },

    // Refetch on success
    onSuccess: (result, dto) => {
      // Update the check query with actual result
      queryClient.setQueryData(
        ['savedPost', 'check', dto.userId, dto.postId],
        result.isSaved
      );

      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: ['savedPost', 'list', dto.userId],
      });
      queryClient.invalidateQueries({
        queryKey: ['savedPost', 'count', dto.userId],
      });
      queryClient.invalidateQueries({
        queryKey: ['savedPost', 'batchCheck', dto.userId],
      });
    },
  });
};

/**
 * 📋 Hook to get user's saved posts (paginated)
 */
export const useGetSavedPosts = (
  userId: number | null,
  page = 1,
  limit = 20
) => {
  return useQuery<SavedPostListResponse>({
    queryKey: ['savedPost', 'list', userId, page, limit],
    queryFn: () => getUserSavedPosts(userId!, page, limit),
    enabled: !!userId,
  });
};

/**
 * 📊 Hook to get saved posts count
 */
export const useGetSavedPostsCount = (userId: number | null) => {
  return useQuery({
    queryKey: ['savedPost', 'count', userId],
    queryFn: () => getSavedPostsCount(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * 🗑️ Hook to remove saved post item
 */
export const useRemoveSavedPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, userId }: { itemId: number; userId: number }) =>
      removeSavedPost(itemId, userId),

    onSuccess: (_, variables) => {
      // Invalidate list and count queries
      queryClient.invalidateQueries({
        queryKey: ['savedPost', 'list', variables.userId],
      });
      queryClient.invalidateQueries({
        queryKey: ['savedPost', 'count', variables.userId],
      });
    },
  });
};
