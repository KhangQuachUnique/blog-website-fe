import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getUserCommunityEmojis } from "../services/emoji/customEmojiService";
import { CUSTOM_EMOJIS_QUERY_KEY } from "./useCustomEmojis";

export const usePrefetchCustomEmojis = (userId?: number) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    queryClient.prefetchQuery({
      queryKey: [CUSTOM_EMOJIS_QUERY_KEY, userId],
      queryFn: () => getUserCommunityEmojis(12),
      staleTime: 30 * 60 * 1000,
    });
  }, [userId, queryClient]);
};
