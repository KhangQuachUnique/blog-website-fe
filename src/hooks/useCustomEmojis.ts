import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  fetchUserCommunityEmojis, 
  saveEmojisToCache, 
  getEmojisFromCache,
  clearEmojiCache 
} from '../services/emoji/customEmojiService';

export const CUSTOM_EMOJIS_QUERY_KEY = 'customEmojis';

/**
 * React Query hook để fetch custom emojis với cache
 */
export const useCustomEmojis = (userId: number | null | undefined) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [CUSTOM_EMOJIS_QUERY_KEY, userId],
    queryFn: async () => {
      if (!userId) return [];

      // Try cache first
      const cached = getEmojisFromCache(userId);
      if (cached) {
        console.log('[useCustomEmojis] Using cached emojis');
        return cached;
      }

      // Fetch from API
      console.log('[useCustomEmojis] Fetching from API');
      const emojis = await fetchUserCommunityEmojis(userId);
      
      // Save to cache
      saveEmojisToCache(userId, emojis);
      
      return emojis;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour (cacheTime renamed to gcTime in v5)
  });

  const clearCache = () => {
    clearEmojiCache();
    if (userId) {
      queryClient.invalidateQueries({ queryKey: [CUSTOM_EMOJIS_QUERY_KEY, userId] });
    }
  };

  return {
    ...query,
    emojis: query.data || [],
    clearCache,
  };
};

/**
 * Helper để prefetch emojis (dùng trong AuthContext)
 */
export const prefetchCustomEmojis = async (queryClient: any, userId: number) => {
  await queryClient.prefetchQuery({
    queryKey: [CUSTOM_EMOJIS_QUERY_KEY, userId],
    queryFn: async () => {
      const cached = getEmojisFromCache(userId);
      if (cached) {
        console.log('[prefetchCustomEmojis] Using cached emojis');
        return cached;
      }

      console.log('[prefetchCustomEmojis] Fetching from API');
      const emojis = await fetchUserCommunityEmojis(userId);
      saveEmojisToCache(userId, emojis);
      return emojis;
    },
    staleTime: 1000 * 60 * 30,
  });
};
