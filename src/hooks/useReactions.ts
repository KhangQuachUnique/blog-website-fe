import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { togglePostReact } from "../services/user/reactions/reactionService";
import { getOrCreateSessionSeed } from "./useNewsFeed";
import type { EmojiReactSummaryDto, IToggleReactDto } from "../types/userReact";
import {
  type IGetNewsfeedResponseDto,
  type INewsfeedItemDto,
} from "../types/newsfeed";
import type { IPostResponseDto } from "../types/post";
import { useSearchParams } from "react-router-dom";
import type {
  ISearchResponseDto,
  SearchResultItem,
} from "../services/search/search.service";

/**
 * Hook to toggle reaction on a post.
 * @returns
 */
export const useTogglePostReact = () => {
  const queryClient = useQueryClient();
  const sessionSeed = getOrCreateSessionSeed();
  const [searchParams] = useSearchParams();

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

      const newFeed = await updateNewsfeedReacts(previousFeed, toggleData);
      const newPost = await updateSinglePostReacts(previousPost, toggleData);
      const newSearchResults = await updateSearchPostReacts(
        previousSearchResults,
        toggleData
      );

      // Cập nhật cache ngay lập tức (phải dùng cùng queryKey với các thao tác khác)
      queryClient.setQueryData(["newsfeed", sessionSeed], newFeed);
      queryClient.setQueryData(["post", toggleData.postId], newPost);
      queryClient.setQueryData(["search", q, "post"], newSearchResults);

      console.log("Previous Post ??????????????:", previousPost);
      console.log("After Toggle - New Post????????????????:", newPost);

      // Trả về context để rollback nếu lỗi
      return { previousFeed, previousPost, previousSearchResults };
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
    },
  });
};

/**
 * Hook to toggle reaction on a comment.
 * @returns
 */
export const useToggleCommentReact = () => {
  return useMutation({
    mutationFn: togglePostReact,
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
    console.warn("This post does not have reactions data.");
    return post;
  }

  const newEmojis = [...post.reacts.emojis];
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
