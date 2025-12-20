import type {
  IEmojiCategoryData,
  IEmojiResponseDto,
} from "../../../types/emoji";

/**
 * Search emojis by name (case-insensitive)
 */
export function searchEmoji(
  data: IEmojiCategoryData[],
  query: string
): IEmojiResponseDto[] {
  const lowerQuery = query.toLowerCase();
  const result: IEmojiResponseDto[] = [];
  data.find((categoryData) => {
    categoryData.emojis.forEach((emoji) => {
      // Assuming emoji has a 'name' property for searching
      if (emoji.codepoint?.toLowerCase().includes(lowerQuery)) {
        result.push(emoji as IEmojiResponseDto);
      }
    });
  });
  return result;
}

/**
 * Group emojis into recent category
 */
export function getRecentEmojis(
  recentCodepoints: string[],
  data: IEmojiCategoryData[]
): IEmojiResponseDto[] {
  const allEmojis: IEmojiResponseDto[] = data.flatMap(
    (category) => category.emojis
  );
  const emojiMap = new Map(allEmojis.map((e) => [e.codepoint, e]));

  return recentCodepoints
    .map((codepoint) => emojiMap.get(codepoint))
    .filter((e): e is IEmojiResponseDto => e !== undefined);
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
