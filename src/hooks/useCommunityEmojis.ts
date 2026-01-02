import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCommunityEmojis,
  createCommunityEmoji,
  deleteCommunityEmoji,
} from "../services/emoji/communityEmojiService";
import type { ICreateCommunityEmojiDto } from "../types/emoji";

// Query keys
export const COMMUNITY_EMOJIS_KEY = "community-emojis";

/**
 * Hook để lấy danh sách emoji của một cộng đồng
 */
export const useGetCommunityEmojis = (communityId: number) => {
  return useQuery({
    queryKey: [COMMUNITY_EMOJIS_KEY, communityId],
    queryFn: () => getCommunityEmojis(communityId),
    enabled: !!communityId && communityId > 0,
    staleTime: 5 * 60 * 1000, // 5 phút
  });
};

/**
 * Hook để tạo emoji mới cho cộng đồng (chỉ Admin)
 */
export const useCreateCommunityEmoji = (communityId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ICreateCommunityEmojiDto) =>
      createCommunityEmoji(communityId, data),
    onSuccess: () => {
      // Invalidate để refresh danh sách emoji
      queryClient.invalidateQueries({
        queryKey: [COMMUNITY_EMOJIS_KEY, communityId],
      });
      // Invalidate custom emojis cache của user (để EmojiPicker cập nhật)
      queryClient.invalidateQueries({
        queryKey: ["custom-emojis"],
      });
    },
  });
};

/**
 * Hook để xóa emoji của cộng đồng (chỉ Admin)
 */
export const useDeleteCommunityEmoji = (communityId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (emojiId: number) => deleteCommunityEmoji(communityId, emojiId),
    onSuccess: () => {
      // Invalidate để refresh danh sách emoji
      queryClient.invalidateQueries({
        queryKey: [COMMUNITY_EMOJIS_KEY, communityId],
      });
      // Invalidate custom emojis cache của user
      queryClient.invalidateQueries({
        queryKey: ["custom-emojis"],
      });
    },
  });
};
