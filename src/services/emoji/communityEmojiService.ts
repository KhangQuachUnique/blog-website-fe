import axiosInstance from "../../config/axiosCustomize";
import type {
  ICreateCommunityEmojiDto,
  ICommunityEmojiResponseDto,
} from "../../types/emoji";

/**
 * Lấy danh sách emoji của một cộng đồng
 */
export const getCommunityEmojis = async (
  communityId: number
): Promise<ICommunityEmojiResponseDto[]> => {
  const response = await axiosInstance.get<ICommunityEmojiResponseDto[]>(
    `/emojis/community/${communityId}`
  );
  return response;
};

/**
 * Tạo emoji mới cho cộng đồng (chỉ Admin)
 */
export const createCommunityEmoji = async (
  communityId: number,
  data: ICreateCommunityEmojiDto
): Promise<ICommunityEmojiResponseDto> => {
  const response = await axiosInstance.post<ICommunityEmojiResponseDto>(
    `/emojis/${communityId}`,
    data
  );
  return response;
};

/**
 * Xóa emoji của cộng đồng (chỉ Admin)
 */
export const deleteCommunityEmoji = async (
  communityId: number,
  emojiId: number
): Promise<void> => {
  await axiosInstance.delete(`/emojis/community/${communityId}/${emojiId}`);
};
