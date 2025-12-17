export const EEmojiType = {
  CUSTOM: "CUSTOM",
  UNICODE: "UNICODE",
};
export type EEmojiType = (typeof EEmojiType)[keyof typeof EEmojiType];

interface ICommunityDTO {
  id: number;
  name: string;
  avatarUrl?: string;
}

export interface IEmojiResponseDto {
  id?: number;
  type?: EEmojiType;
  codepoint?: string;
  emojiUrl?: string;
  communityId?: number;
}

export interface IEmojiCommunityResponseDto {
  community: ICommunityDTO;
  emojis: IEmojiResponseDto[];
}

export interface IEmojiCategoryData {
  category: string | ICommunityDTO;
  emojis: IEmojiResponseDto[];
}

export interface CategoryTab {
  key: string;
  label: string;
  icon: string;
}

/**
 * Default category tabs (Discord-like)
 */
export const DEFAULT_CATEGORY_TABS: CategoryTab[] = [
  { key: "Smileys & Emotion", label: "Smileys", icon: "😀" },
  { key: "People & Body", label: "People", icon: "👋" },
  { key: "Animals & Nature", label: "Nature", icon: "🐻" },
  { key: "Food & Drink", label: "Food", icon: "🍔" },
  { key: "Travel & Places", label: "Travel", icon: "✈️" },
  { key: "Activities", label: "Activities", icon: "⚽" },
  { key: "Objects", label: "Objects", icon: "💡" },
  { key: "Symbols", label: "Symbols", icon: "❤️" },
  { key: "Flags", label: "Flags", icon: "🏳️" },
];
