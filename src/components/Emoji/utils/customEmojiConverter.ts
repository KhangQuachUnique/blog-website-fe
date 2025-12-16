import type { CustomEmoji, EmojiItem, EmojiCategoryData } from '../../../types/emoji';

/**
 * Convert custom emojis to EmojiItem format and group by community
 */
export const convertCustomEmojisToCategories = (
  customEmojis: CustomEmoji[]
): EmojiCategoryData => {
  const categories: EmojiCategoryData = {};

  customEmojis.forEach((emoji) => {
    const categoryKey = emoji.community.name;

    if (!categories[categoryKey]) {
      categories[categoryKey] = [];
    }

    const emojiItem: EmojiItem = {
      emoji: '', // Custom emoji doesn't have unicode
      name: `Custom emoji from ${emoji.community.name}`,
      codepoint: `custom_${emoji.id}`,
      twemoji_url: emoji.emojiUrl,
      isCustom: true,
      customEmojiId: emoji.id,
      communityId: emoji.community.id,
      communityName: emoji.community.name,
    };

    categories[categoryKey].push(emojiItem);
  });

  return categories;
};

/**
 * Merge custom emoji categories with standard unicode categories
 */
export const mergeEmojiCategories = (
  unicodeData: EmojiCategoryData,
  customData: EmojiCategoryData
): EmojiCategoryData => {
  return {
    ...unicodeData,
    ...customData,
  };
};
