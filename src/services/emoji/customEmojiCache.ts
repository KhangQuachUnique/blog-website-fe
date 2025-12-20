import type { IEmojiCommunityResponseDto } from "../../types/emoji";

const CACHE_PREFIX = "custom_emojis";
const CACHE_DURATION = 30 * 60 * 1000; // 30 phút

const keyOf = (userId: number) => `${CACHE_PREFIX}_${userId}`;

export const loadEmojiCache = (
  userId: number
): IEmojiCommunityResponseDto[] | undefined => {
  try {
    const raw = localStorage.getItem(keyOf(userId));
    if (!raw) return;

    const { emojis, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > CACHE_DURATION) return;

    return emojis;
  } catch {
    return;
  }
};

export const saveEmojiCache = (
  userId: number,
  emojis: IEmojiCommunityResponseDto[]
) => {
  try {
    localStorage.setItem(
      keyOf(userId),
      JSON.stringify({
        emojis,
        timestamp: Date.now(),
      })
    );
  } catch {
    // ignore errors
  }
};

export const clearEmojiCache = (userId: number) => {
  localStorage.removeItem(keyOf(userId));
};
