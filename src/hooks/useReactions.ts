import { useMutation, useQueryClient } from "@tanstack/react-query";
import { togglePostReact } from "../services/user/reactions/reactionService";
import { getOrCreateSessionSeed } from "./useNewsFeed";
import type { EmojiReactSummaryDto, IToggleReactDto } from "../types/userReact";

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
      const previousFeed = queryClient.getQueryData(["newsfeed", sessionSeed]);

      const newFeed = {
        pages:
          previousFeed?.pages?.map((page: any) => {
            const items =
              page.items ?? page.data?.items ?? page.results ?? page;

            if (!Array.isArray(items)) {
              return page; // không thay đổi nếu không có items
            }

            // Tìm post cần update
            const updatedItems = items.map((post: any) => {
              if (post.id !== toggleData.postId || !post.reacts?.emojis) {
                return post;
              }

              // Sao chép mảng emojis
              const newEmojis = [...post.reacts.emojis];

              const { emojiId, codePoint } = toggleData;
              const existingIndex = newEmojis.findIndex(
                (r: EmojiReactSummaryDto) =>
                  emojiId ? r.emojiId === emojiId : r.codepoint === codePoint
              );

              if (existingIndex !== -1) {
                const existing = newEmojis[existingIndex];

                if (existing.reactedByCurrentUser) {
                  // Đang react → bỏ react
                  if (existing.totalCount <= 1) {
                    // Xóa luôn nếu count về 0
                    newEmojis.splice(existingIndex, 1);
                  } else {
                    newEmojis[existingIndex] = {
                      ...existing,
                      totalCount: existing.totalCount - 1,
                      reactedByCurrentUser: false,
                    };
                  }
                } else {
                  // Chưa react → thêm react
                  newEmojis[existingIndex] = {
                    ...existing,
                    totalCount: existing.totalCount + 1,
                    reactedByCurrentUser: true,
                  };
                }
              } else {
                // Reaction hoàn toàn mới
                const newReaction: EmojiReactSummaryDto = {
                  emojiId: emojiId,
                  codepoint: codePoint,
                  totalCount: 1,
                  reactedByCurrentUser: true,
                  type: emojiId ? "CUSTOM" : "UNICODE",
                  // emojiUrl nếu cần có thể truyền từ component hoặc để backend bổ sung sau
                };
                newEmojis.push(newReaction);
              }

              // Tính lại totalReactions nếu có field này
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

            // Trả về page mới với items đã update
            if (page.items) {
              return { ...page, items: updatedItems };
            }
            if (page.data?.items) {
              return { ...page, data: { ...page.data, items: updatedItems } };
            }
            if (page.results) {
              return { ...page, results: updatedItems };
            }
            return { ...page, ...updatedItems }; // fallback nếu items là chính page
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
