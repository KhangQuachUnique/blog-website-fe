import axiosInstance from '../../config/axiosCustomize';
import type { CustomEmoji } from '../../types/emoji';

const CACHE_KEY = 'blookie_custom_emojis';
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

/**
 * Fetch custom emojis từ backend
 */
export const fetchUserCommunityEmojis = async (userId: number): Promise<CustomEmoji[]> => {
  const response = await axiosInstance.get<CustomEmoji[]>(`/emojis/user/${userId}/communities`);
  // axiosCustomize có thể unwrap data
  return response;
};
  
/**
 * Lưu emojis vào localStorage với timestamp
 */
export const saveEmojisToCache = (userId: number, emojis: CustomEmoji[]): void => {
  try {
    const cacheData = {
      userId,
      emojis,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.error('[customEmojiService] Error saving to cache:', error);
  }
};

/**
 * Lấy emojis từ localStorage cache
 */
export const getEmojisFromCache = (userId: number): CustomEmoji[] | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const cacheData = JSON.parse(cached);
    
    // Check if cache is for the same user
    if (cacheData.userId !== userId) return null;

    // Check if cache is still valid
    const now = Date.now();
    if (now - cacheData.timestamp > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return cacheData.emojis;
  } catch (error) {
    console.error('[customEmojiService] Error reading from cache:', error);
    return null;
  }
};

/**
 * Xóa cache
 */
export const clearEmojiCache = (): void => {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.error('[customEmojiService] Error clearing cache:', error);
  }
};
