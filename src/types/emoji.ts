/**
 * ============================================
 * EMOJI TYPES - Centralized Type Definitions
 * ============================================
 */

/**
 * Backend custom emoji response
 */
export interface CustomEmoji {
  id: number;
  type: 'CUSTOM' | 'UNICODE';
  emojiUrl: string;
  codepoint: string | null;
  community: {
    id: number;
    name: string;
    thumbnailUrl: string;
  };
}

/**
 * Frontend emoji item (used in picker UI)
 */
export interface EmojiItem {
  emoji: string;
  name: string;
  codepoint: string;
  twemoji_url: string;
  isCustom?: boolean;
  customEmojiId?: number;
  communityId?: number;
  communityName?: string;
}

/**
 * Emoji data grouped by category
 */
export type EmojiCategoryData = Record<string, EmojiItem[]>;

/**
 * Category tab metadata
 */
export interface CategoryTab {
  key: string;
  label: string;
  icon: string;
}

/**
 * Default category tabs (Discord-like)
 */
export const DEFAULT_CATEGORY_TABS: CategoryTab[] = [
  { key: 'Smileys & Emotion', label: 'Smileys', icon: '😀' },
  { key: 'People & Body', label: 'People', icon: '👋' },
  { key: 'Animals & Nature', label: 'Nature', icon: '🐻' },
  { key: 'Food & Drink', label: 'Food', icon: '🍔' },
  { key: 'Travel & Places', label: 'Travel', icon: '✈️' },
  { key: 'Activities', label: 'Activities', icon: '⚽' },
  { key: 'Objects', label: 'Objects', icon: '💡' },
  { key: 'Symbols', label: 'Symbols', icon: '❤️' },
  { key: 'Flags', label: 'Flags', icon: '🏳️' },
];

/**
 * Emoji reaction data for reaction bar
 */
export interface EmojiReactionData {
  emoji: string;
  count: number;
  isReactedByMe: boolean;
  emojiId: number;
}
