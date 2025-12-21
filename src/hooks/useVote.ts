import {
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { votePost, getVoteStatus } from "../services/vote.service";
import type { VoteType } from "../types/vote.types";
import { getOrCreateSessionSeed } from "./useNewsFeed";
import type {
  IGetNewsfeedResponseDto,
  INewsfeedItemDto,
} from "../types/newsfeed";
import type { IPostResponseDto } from "../types/post";

// ============================================
// QUERY KEYS
// ============================================
export const voteKeys = {
  all: ["votes"] as const,
  status: (userId: number, postId: number) =>
    [...voteKeys.all, "status", userId, postId] as const,
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
  const sessionSeed = getOrCreateSessionSeed();

  return useMutation({
    mutationFn: (voteType: VoteType) => votePost(userId, postId, voteType),

    // Optimistic update
    onMutate: async (voteType: VoteType) => {
      await queryClient.cancelQueries({
        queryKey: ["newsfeed", sessionSeed],
      });

      const previousFeed = queryClient.getQueryData<
        InfiniteData<IGetNewsfeedResponseDto>
      >(["newsfeed", sessionSeed]);

      const newFeed = updateNewsfeedVotes(previousFeed, voteType, postId);

      queryClient.setQueryData(["newsfeed", sessionSeed], newFeed);

      console.log("Previous Feed:", previousFeed);
      console.log("After Vote - New Feed:", newFeed);

      // Return context with previous value
      return { previousFeed };
    },

    // On error, rollback
    onError: (_error, _variables, context) => {
      if (context?.previousFeed) {
        queryClient.setQueryData(
          ["newsfeed", sessionSeed],
          context.previousFeed
        );
      }
    },

    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["newsfeed", sessionSeed],
      });
    },
  });
};

/**
 * Utils hỗ trợ update cache sau khi vote
 */
const updatePostVotes = (
  post: IPostResponseDto,
  voteType: VoteType
): IPostResponseDto => {
  if (!post) return post;

  const newVotes = { ...post.votes };

  if (post.votes.userVote === null) {
    // User chưa vote trước đó
    if (voteType === "upvote") {
      newVotes.upvotes += 1;
    } else if (voteType === "downvote") {
      newVotes.downvotes += 1;
    }
    newVotes.userVote = voteType;
  } else if (post.votes.userVote === voteType) {
    // User muốn hủy vote
    if (voteType === "upvote") {
      newVotes.upvotes -= 1;
    } else if (voteType === "downvote") {
      newVotes.downvotes -= 1;
    }
    newVotes.userVote = null;
  } else {
    // User đổi vote
    if (voteType === "upvote") {
      newVotes.upvotes += 1;
      newVotes.downvotes -= 1;
    } else if (voteType === "downvote") {
      newVotes.downvotes += 1;
      newVotes.upvotes -= 1;
    }
    newVotes.userVote = voteType;
  }

  return { ...post, votes: newVotes };
};

/**
 *
 * @param feed
 * @param toggleData
 * @returns
 */
export function updateNewsfeedVotes(
  feed: InfiniteData<IGetNewsfeedResponseDto> | undefined,
  voteType: VoteType,
  postId: number
): InfiniteData<IGetNewsfeedResponseDto> {
  if (!feed) {
    return { pages: [], pageParams: [] };
  }

  return {
    ...feed,
    pages: feed.pages.map((page) => ({
      ...page,
      items: Array.isArray(page.items)
        ? page.items.map((post: INewsfeedItemDto) =>
            post.id === postId ? updatePostVotes(post, voteType) : post
          )
        : page.items,
    })),
  };
}
