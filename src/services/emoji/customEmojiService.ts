import axiosInstance from "../../config/axiosCustomize";
import type { IEmojiCommunityResponseDto } from "../../types/emoji";

export const getUserCommunityEmojis = async (
  userId: number
): Promise<IEmojiCommunityResponseDto[]> => {
  const response = await axiosInstance.get<[IEmojiCommunityResponseDto]>(
    `/emojis/user/${userId}/communities`
  );
  return response;
};
