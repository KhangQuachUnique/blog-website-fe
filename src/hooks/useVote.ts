import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { votePost, getVoteStatus } from '../services/vote.service';
import type { VoteType, VoteActionResponse } from '../types/vote.types';

// ============================================
// QUERY KEYS
// ============================================
export const voteKeys = {
  all: ['votes'] as const,
  status: (userId: number, postId: number) => 
    [...voteKeys.all, 'status', userId, postId] as const,
};

// ============================================
// HOOKS
// ============================================

/**
 * Hook để lấy trạng thái vote hiện tại
 */
export const useVoteStatus = (userId: number | null, postId: number) => {
  return useQuery({
    queryKey: voteKeys.status(userId ?? 0, postId),
    queryFn: async () => {
      if (!userId || userId <= 0) {
        return { voteType: null };
      }
      const result = await getVoteStatus(userId, postId);
      return result || { voteType: null };
    },
    enabled: !!userId && userId > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook để thực hiện vote với optimistic update
 */
export const useVote = (userId: number, postId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (voteType: VoteType) => votePost(userId, postId, voteType),
    
    // Optimistic update
    onMutate: async (voteType: VoteType) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: voteKeys.status(userId, postId) 
      });

      // Snapshot the previous value
      const previousStatus = queryClient.getQueryData(
        voteKeys.status(userId, postId)
      );

      // Optimistically update to the new value
      queryClient.setQueryData(
        voteKeys.status(userId, postId),
        (old: any) => ({
          voteType: old?.voteType === voteType ? null : voteType,
        })
      );

      // Return context with previous value
      return { previousStatus };
    },

    // On success, update with server data
    onSuccess: (data: VoteActionResponse) => {
      queryClient.setQueryData(
        voteKeys.status(userId, postId),
        { voteType: data.voteType }
      );
    },

    // On error, rollback
    onError: (_error, _variables, context) => {
      if (context?.previousStatus) {
        queryClient.setQueryData(
          voteKeys.status(userId, postId),
          context.previousStatus
        );
      }
    },

    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ 
        queryKey: voteKeys.status(userId, postId) 
      });
    },
  });
};
