import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import {
  toggleCommentReact,
  togglePostReact,
} from "../services/user/reactions/reactionService";
import { getOrCreateSessionSeed } from "./useNewsFeed";
import type { EmojiReactSummaryDto, IToggleReactDto } from "../types/userReact";
import {
  type IGetNewsfeedResponseDto,
  type INewsfeedItemDto,
} from "../types/newsfeed";
import type { IPostResponseDto } from "../types/post";
import { useParams, useSearchParams } from "react-router-dom";
import type {
  ISearchResponseDto,
  SearchResultItem,
} from "../services/search/search.service";
import type { SavedPostListResponse } from "../types/savedPost";
import { useAuthUser } from "./useAuth";
import type { UserProfile } from "../types/user";
import type { ICommentResponse, ICommentsResponse } from "../types/comment";

/**
 * Hook to toggle reaction on a post.
 * @returns
 */
export const useTogglePostReact = () => {
  const queryClient = useQueryClient();
  const sessionSeed = getOrCreateSessionSeed();
  const { user: currentUser } = useAuthUser();
  const [searchParams] = useSearchParams();
  const { id: communityId } = useParams();
  const { userId } = useParams();

  const isMe = !userId || (userId && currentUser?.id === Number(userId));
  const q = searchParams.get("q") || "";

  return useMutation({
    mutationFn: togglePostReact,

    onMutate: async (toggleData: IToggleReactDto) => {
      await queryClient.cancelQueries({
        queryKey: ["newsfeed", sessionSeed],
      });

      await queryClient.cancelQueries({
        queryKey: ["post", toggleData.postId],
      });

      await queryClient.cancelQueries({
        queryKey: ["search", q, "post"],
      });

      await queryClient.cancelQueries({
        queryKey: ["savedPost", "list"],
      });

      await queryClient.cancelQueries({
        queryKey: ["community-posts", Number(communityId)],
      });

      await queryClient.cancelQueries({
        queryKey: isMe
          ? ["userProfile", "me"]
          : ["userProfile", Number(userId)],
      });

      const previousFeed = queryClient.getQueryData<
        InfiniteData<IGetNewsfeedResponseDto>
      >(["newsfeed", sessionSeed]);

      const previousPost = queryClient.getQueryData<IPostResponseDto>([
        "post",
        toggleData.postId,
      ]);

      const previousSearchResults = queryClient.getQueryData<
        InfiniteData<ISearchResponseDto>
      >(["search", q, "post"]);

      const previousSavedPosts =
        queryClient.getQueryData<SavedPostListResponse>(["savedPost", "list"]);

      const previousCommunityPosts = queryClient.getQueryData<
        IPostResponseDto[]
      >(["community-posts", Number(communityId)]);

      const previousUserProfile = queryClient.getQueryData<UserProfile>(
        isMe ? ["userProfile", "me"] : ["userProfile", Number(userId)]
      );

      console.log("Previous user profile reacts...", previousUserProfile);

      const newFeed = await updateNewsfeedReacts(previousFeed, toggleData);
      const newPost = await updateSinglePostReacts(previousPost, toggleData);
      const newSearchResults = await updateSearchPostReacts(
        previousSearchResults,
        toggleData
      );
      const newSavedPosts = await updateSavedPostReacts(
        previousSavedPosts,
        toggleData
      );
      const newCommunityPosts = await updateCommunityPostsReacts(
        previousCommunityPosts,
        toggleData
      );
      const newUserProfile = await updateUserProfilePostsReacts(
        previousUserProfile,
        toggleData
      );

      // Cập nhật cache ngay lập tức (phải dùng cùng queryKey với các thao tác khác)
      queryClient.setQueryData(["newsfeed", sessionSeed], newFeed);
      queryClient.setQueryData(["post", toggleData.postId], newPost);
      queryClient.setQueryData(["search", q, "post"], newSearchResults);
      queryClient.setQueryData(["savedPost", "list"], newSavedPosts);
      queryClient.setQueryData(
        ["community-posts", Number(communityId)],
        newCommunityPosts
      );
      queryClient.setQueryData(
        isMe ? ["userProfile", "me"] : ["userProfile", Number(userId)],
        newUserProfile
      );

      // Trả về context để rollback nếu lỗi
      return {
        previousFeed,
        previousPost,
        previousSearchResults,
        previousSavedPosts,
        previousCommunityPosts,
        previousUserProfile,
      };
    },

    onError: (_err, _vars, context) => {
      if (context?.previousFeed) {
        queryClient.setQueryData(
          ["newsfeed", sessionSeed],
          context.previousFeed
        );
      }
      if (context?.previousPost) {
        queryClient.setQueryData(["post", _vars.postId], context.previousPost);
      }
      if (context?.previousSearchResults) {
        queryClient.setQueryData(
          ["search", q, "post"],
          context.previousSearchResults
        );
      }
      if (context?.previousSavedPosts) {
        queryClient.setQueryData(
          ["savedPost", "list"],
          context.previousSavedPosts
        );
      }
      if (context?.previousCommunityPosts) {
        queryClient.setQueryData(
          ["community-posts", Number(communityId)],
          context.previousCommunityPosts
        );
      }
      if (context?.previousUserProfile) {
        queryClient.setQueryData(
          isMe ? ["userProfile", "me"] : ["userProfile", Number(userId)],
          context.previousUserProfile
        );
      }
    },
  });
};

/**
 * Hook to toggle reaction on a comment.
 * @returns
 */
export const useToggleCommentReact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleCommentReact,

    onMutate: async (toggleData: IToggleReactDto) => {
      console.log("Toggling comment react...", toggleData);
      console.log("Step 1: Canceling comment queries...");
      await queryClient.cancelQueries({
        queryKey: ["postComments", toggleData.postId],
      });

      await queryClient.cancelQueries({
        queryKey: ["blockComments", toggleData.blockId],
      });

      console.log(
        "Step 2: Getting previous comment data...",
        toggleData.postId
      );
      const previousComments = queryClient.getQueryData<ICommentsResponse>([
        "postComments",
        toggleData.postId,
      ]);
      console.log("Previous comments:", previousComments);

      const previousBlockComments = queryClient.getQueryData<ICommentsResponse>(
        ["blockComments", toggleData.blockId]
      );
      console.log("Previous block comments:", previousBlockComments);

      console.log("Step 3: Updating comment reacts in cache...");
      const newComments = updatePostCommentReacts(previousComments, toggleData);
      console.log("Updated comments:", newComments);
      const newBlockComments = updateBlockCommentReacts(
        previousBlockComments,
        toggleData
      );
      console.log("Updated block comments:", newBlockComments);

      console.log("Step 4: Setting new comment data in cache...");
      // Cập nhật cache ngay lập tức (phải dùng cùng queryKey với các thao tác khác)
      queryClient.setQueryData(
        ["postComments", toggleData.postId],
        newComments
      );
      queryClient.setQueryData(
        ["blockComments", toggleData.blockId],
        newBlockComments
      );

      // Trả về context để rollback nếu lỗi
      return {
        previousComments,
        previousBlockComments,
      };
    },

    onError: (_err, _vars, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(
          ["postComments", _vars.postId],
          context.previousComments
        );
      }
      if (context?.previousBlockComments) {
        queryClient.setQueryData(
          ["blockComments", _vars.blockId],
          context.previousBlockComments
        );
      }
    },
  });
};

/**
 * UTILS FUNCTIONS FOR UPDATING REACTIONS IN CACHE
 */

/**
 * Update the reactions of a post based on the toggle data.
 * @param post
 * @param toggleData
 * @returns
 */
export function updatePostReacts(
  post: IPostResponseDto,
  toggleData: IToggleReactDto
): IPostResponseDto {
  if (post.id !== toggleData.postId || !post.reacts?.emojis) {
    return post;
  }

  const newEmojis = [...post.reacts.emojis];
  const { emojiId, codepoint, emojiUrl } = toggleData;

  const index = newEmojis.findIndex((r) =>
    emojiId ? r.emojiId === emojiId : r.codepoint === codepoint
  );

  if (index !== -1) {
    const current = newEmojis[index];

    if (current.reactedByCurrentUser) {
      if (current.totalCount <= 1) {
        newEmojis.splice(index, 1);
      } else {
        newEmojis[index] = {
          ...current,
          emojiUrl: current.emojiUrl,
          totalCount: current.totalCount - 1,
          reactedByCurrentUser: false,
        };
      }
    } else {
      newEmojis[index] = {
        ...current,
        emojiUrl: current.emojiUrl,
        totalCount: current.totalCount + 1,
        reactedByCurrentUser: true,
      };
    }
  } else {
    newEmojis.push({
      emojiId,
      codepoint,
      emojiUrl,
      totalCount: 1,
      reactedByCurrentUser: true,
      type: emojiId ? "CUSTOM" : "UNICODE",
    } as EmojiReactSummaryDto);
  }

  const totalReactions = newEmojis.reduce((sum, r) => sum + r.totalCount, 0);

  return {
    ...post,
    reacts: {
      ...post.reacts,
      emojis: newEmojis,
      totalReactions,
    },
  };
}

/**
 * Update the reactions of the newsfeed based on the toggle data.
 * @param feed
 * @param toggleData
 * @returns
 */
export function updateNewsfeedReacts(
  feed: InfiniteData<IGetNewsfeedResponseDto> | undefined,
  toggleData: IToggleReactDto
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
            updatePostReacts(post, toggleData)
          )
        : page.items,
    })),
  };
}

export function updateSinglePostReacts(
  post: IPostResponseDto | undefined,
  toggleData: IToggleReactDto
): IPostResponseDto | undefined {
  return post ? updatePostReacts(post, toggleData) : post;
}

const updateSearchPostReacts = (
  searchResults: InfiniteData<ISearchResponseDto> | undefined,
  toggleData: IToggleReactDto
): InfiniteData<ISearchResponseDto> | undefined => {
  if (!searchResults) {
    return undefined;
  }

  return {
    ...searchResults,
    pages: searchResults.pages.map((page) => ({
      ...page,
      items: Array.isArray(page.items)
        ? page.items.map((post: SearchResultItem) =>
            updatePostReacts(post as IPostResponseDto, toggleData)
          )
        : page.items,
    })),
  };
};

const updateSavedPostReacts = (
  savedPosts: SavedPostListResponse | undefined,
  toggleData: IToggleReactDto
): SavedPostListResponse | undefined => {
  if (!savedPosts) {
    return undefined;
  }

  return {
    ...savedPosts,
    items: Array.isArray(savedPosts.items)
      ? savedPosts.items.map((post: IPostResponseDto) =>
          updatePostReacts(post, toggleData)
        )
      : savedPosts.items,
  };
};

const updateCommunityPostsReacts = (
  communityPosts: IPostResponseDto[] | undefined,
  toggleData: IToggleReactDto
): IPostResponseDto[] | undefined => {
  if (!communityPosts) {
    return undefined;
  }

  return communityPosts.map((post: IPostResponseDto) =>
    updatePostReacts(post, toggleData)
  );
};

const updateUserProfilePostsReacts = (
  userProfile: UserProfile | undefined,
  toggleData: IToggleReactDto
): UserProfile | undefined => {
  console.log("Updating user profile reacts...", userProfile, toggleData);
  if (!userProfile) {
    return undefined;
  }

  return {
    ...userProfile,
    posts: userProfile.posts.map((post: IPostResponseDto) =>
      updatePostReacts(post, toggleData)
    ),
  };
};

/**
 * Update the reactions of a comment based on the toggle data.
 * @param comment
 * @param toggleData
 * @returns
 */
const updateCommentReacts = (
  comment: ICommentResponse,
  toggleData: IToggleReactDto
): ICommentResponse | undefined => {
  if (comment.id !== toggleData.commentId || !comment.reacts?.emojis) {
    return comment;
  }

  const newEmojis = [...comment.reacts.emojis];
  const { emojiId, codepoint } = toggleData;
  const index = newEmojis.findIndex((r) =>
    emojiId ? r.emojiId === emojiId : r.codepoint === codepoint
  );
  if (index !== -1) {
    const current = newEmojis[index];
    if (current.reactedByCurrentUser) {
      if (current.totalCount <= 1) {
        newEmojis.splice(index, 1);
      } else {
        newEmojis[index] = {
          ...current,
          totalCount: current.totalCount - 1,
          reactedByCurrentUser: false,
        };
      }
    } else {
      newEmojis[index] = {
        ...current,
        totalCount: current.totalCount + 1,
        reactedByCurrentUser: true,
      };
    }
  } else {
    newEmojis.push({
      emojiId,
      codepoint,
      totalCount: 1,
      reactedByCurrentUser: true,
      type: emojiId ? "CUSTOM" : "UNICODE",
    } as EmojiReactSummaryDto);
  }
  const totalReactions = newEmojis.reduce((sum, r) => sum + r.totalCount, 0);

  return {
    ...comment,
    reacts: {
      ...comment.reacts,
      emojis: newEmojis,
      totalReactions,
    },
  };
};

const updatePostCommentReacts = (
  commentsData: ICommentsResponse | undefined,
  toggleData: IToggleReactDto
): ICommentsResponse | undefined => {
  if (!commentsData) {
    return undefined;
  }
  return {
    ...commentsData,
    comments: commentsData.comments.map(
      (comment) => updateCommentReacts(comment, toggleData) as ICommentResponse
    ),
  };
};

const updateBlockCommentReacts = (
  blockCommentsData: ICommentsResponse | undefined,
  toggleData: IToggleReactDto
): ICommentsResponse | undefined => {
  if (!blockCommentsData) {
    return undefined;
  }
  return {
    ...blockCommentsData,
    comments: blockCommentsData.comments.map(
      (comment) => updateCommentReacts(comment, toggleData) as ICommentResponse
    ),
  };
};
