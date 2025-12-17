import { useMemo } from "react";
import unicodeEmojiData from "../../../assets/twemoji_valid_by_category.json";

import { useAuthUser } from "../../../hooks/useAuth";
import { useCustomEmojis } from "../../../hooks/useCustomEmojis";
import {
  convertCustomEmojisToCategories,
  mergeEmojiCategories,
} from "../utils/customEmojiConverter";
import type { IEmojiResponseDto } from "../../../types/emoji";

export function useEmojiData() {
  const { user } = useAuthUser();
  const { data: customEmojis } = useCustomEmojis(user?.id);

  return useMemo(() => {
    const customCategories = convertCustomEmojisToCategories(
      customEmojis ?? []
    );
    return mergeEmojiCategories(
      unicodeEmojiData as Record<string, IEmojiResponseDto[]>,
      customCategories
    );
  }, [customEmojis]);
}
