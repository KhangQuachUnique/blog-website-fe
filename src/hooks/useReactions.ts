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

/**
 * Hook to toggle reaction on a post.
 * @returns
 */
export const useTogglePostReact = () => {
  const queryClient = useQueryClient();
  const sessionSeed = getOrCreateSessionSeed();

  return useMutation({
    mutationFn: togglePostReact,

    onMutate: async (toggleData: IToggleReactDto) => {
      await queryClient.cancelQueries({
        queryKey: ["newsfeed", sessionSeed],
      });
      const previousFeed = queryClient.getQueryData<
        InfiniteData<IGetNewsfeedResponseDto>
      >(["newsfeed", sessionSeed]);

      console.log("Previous feed:", previousFeed);

      const newFeed: InfiniteData<IGetNewsfeedResponseDto> = {
        pages:
          previousFeed?.pages?.map((page: IGetNewsfeedResponseDto) => {
            const items = page.items;

            console.log("Page", page);
            console.log("Items:", items);

            if (!Array.isArray(items)) {
              return page; // không thay đổi nếu không có items
            }

            // Tìm post cần update
            const updatedItems = items.map((post: INewsfeedItemDto) => {
              if (post.id !== toggleData.postId || !post.reacts?.emojis) {
                return post;
              }

              const newEmojis = [...post.reacts.emojis];

              const { emojiId, codepoint } = toggleData;
              const existingIndex = newEmojis.findIndex(
                (r: EmojiReactSummaryDto) =>
                  emojiId ? r.emojiId === emojiId : r.codepoint === codepoint
              );

              if (existingIndex !== -1) {
                const existing = newEmojis[existingIndex];

                if (existing.reactedByCurrentUser) {
                  if (existing.totalCount <= 1) {
                    newEmojis.splice(existingIndex, 1);
                  } else {
                    newEmojis[existingIndex] = {
                      ...existing,
                      totalCount: existing.totalCount - 1,
                      reactedByCurrentUser: false,
                    };
                  }
                } else {
                  newEmojis[existingIndex] = {
                    ...existing,
                    totalCount: existing.totalCount + 1,
                    reactedByCurrentUser: true,
                  };
                }
              } else {
                const newReaction: EmojiReactSummaryDto = {
                  emojiId: emojiId,
                  codepoint: codepoint,
                  totalCount: 1,
                  reactedByCurrentUser: true,
                  type: emojiId ? "CUSTOM" : "UNICODE",
                };
                newEmojis.push(newReaction);
              }

              const totalReactions = newEmojis.reduce(
                (sum: number, r: EmojiReactSummaryDto) => sum + r.totalCount,
                0
              );

              return {
                ...post,
                reacts: {
                  ...post.reacts,
                  emojis: newEmojis,
                  totalReactions,
                },
              };
            });

            // Trả về page mới (the expected shape is IGetNewsfeedResponseDto)
            return {
              ...page,
              items: updatedItems,
              pagination: page.pagination,
            } as IGetNewsfeedResponseDto;
          }) || [],
        pageParams: previousFeed?.pageParams || [],
      };

      // Cập nhật cache ngay lập tức (phải dùng cùng queryKey với các thao tác khác)
      queryClient.setQueryData(["newsfeed", sessionSeed], newFeed);

      // Trả về context để rollback nếu lỗi
      return { previousFeed };
    },

    onError: (_err, _vars, context) => {
      if (context?.previousFeed) {
        queryClient.setQueryData(
          ["newsfeed", sessionSeed],
          context.previousFeed
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
  return useMutation({
    mutationFn: togglePostReact,
  });
};
