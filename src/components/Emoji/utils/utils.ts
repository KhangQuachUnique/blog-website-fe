import type { EmojiItem, EmojiCategoryData } from "../types";

/**
 * Search emojis by name (case-insensitive)
 */
export function searchEmoji(
  data: EmojiCategoryData,
  query: string
): EmojiItem[] {
  if (!query.trim()) return [];

  const lowerQuery = query.toLowerCase().trim();
  const results: EmojiItem[] = [];

  Object.values(data).forEach((categoryEmojis) => {
    categoryEmojis.forEach((emoji) => {
      if (emoji.name.toLowerCase().includes(lowerQuery)) {
        results.push(emoji);
      }
    });
  });

  return results;
}

/**
 * Group emojis into recent category
 */
export function getRecentEmojis(
  recentCodepoints: string[],
  data: EmojiCategoryData
): EmojiItem[] {
  const allEmojis: EmojiItem[] = Object.values(data).flat();
  const emojiMap = new Map(allEmojis.map((e) => [e.codepoint, e]));

  return recentCodepoints
    .map((codepoint) => emojiMap.get(codepoint))
    .filter((e): e is EmojiItem => e !== undefined);
}

/**
 * Debounce function for search input
 */
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}
