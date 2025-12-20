import { useMemo } from "react";
import unicodeEmojiData from "../../../assets/twemoji_valid_by_category.json";

import { useAuthUser } from "../../../hooks/useAuth";
import { useCustomEmojis } from "../../../hooks/useCustomEmojis";

import type {
  IEmojiCategoryData,
  IEmojiResponseDto,
} from "../../../types/emoji";

/**
 * Merge custom emoji categories with standard unicode categories
 */
export const mergeEmojiCategories = (
  unicodeData: IEmojiCategoryData[],
  customData: IEmojiCategoryData[]
): IEmojiCategoryData[] => {
  const merged = [...unicodeData, ...customData];
  return merged;
};

export function useEmojiData(): IEmojiCategoryData[] {
  const { user } = useAuthUser();
  const { data: customEmojis } = useCustomEmojis(user?.id);

  return useMemo(() => {
    // Convert Unicode emojis thành IEmojiCategoryData[]
    const unicodeCategories: IEmojiCategoryData[] = Object.entries(
      unicodeEmojiData
    ).map(([category, emojis]) => ({
      category,
      emojis: emojis as IEmojiResponseDto[],
    }));
    console.log("unicodeCategories", unicodeCategories);

    // Convert custom emojis thành IEmojiCategoryData[]
    const customCategories: IEmojiCategoryData[] =
      customEmojis?.map(({ community, emojis }) => ({
        category: community, // community là ICommunityDTO
        emojis: emojis.map((e) => ({
          ...e,
          isCustom: true,
          type: "CUSTOM",
        })),
      })) ?? [];
    console.log("customCategories", customCategories);

    // Merge Unicode + Custom
    return mergeEmojiCategories(unicodeCategories, customCategories);
  }, [customEmojis]);
}
