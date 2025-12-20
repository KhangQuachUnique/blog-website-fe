import { useQuery } from "@tanstack/react-query";
import { getUserCommunityEmojis } from "../services/emoji/customEmojiService";
import {
  loadEmojiCache,
  saveEmojiCache,
} from "../services/emoji/customEmojiCache";

export const CUSTOM_EMOJIS_QUERY_KEY = "custom-emojis";

export const useCustomEmojis = (userId?: number) => {
  return useQuery({
    queryKey: [CUSTOM_EMOJIS_QUERY_KEY, userId],
    enabled: !!userId,

    initialData: () => (userId ? loadEmojiCache(userId) : undefined),

    queryFn: async () => {
      const emojis = await getUserCommunityEmojis(12);
      saveEmojiCache(userId!, emojis);
      return emojis;
    },

    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
};
