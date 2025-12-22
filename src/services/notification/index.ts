import type { NotificationResponseDto } from "../../types/notification";
import axios from "../../config/axiosCustomize";

/**
 * Lấy danh sách thông báo của user
 * @param userId
 * @returns Promise<NotificationResponseDto[]>
 */
export const getNotifications = async (
  userId: number
): Promise<NotificationResponseDto[]> => {
  const response = await axios.get<NotificationResponseDto[]>(
    `/notifications/${userId}`
  );
  return response;
};

/**
 * Đánh dấu thông báo đã đọc
 * @param notificationId
 */
export const markNotificationAsRead = async (
  notificationId: number
): Promise<void> => {
  await axios.post(`/notifications/mark-as-read/${notificationId}`);
};

/**
 * Đánh dấu tất cả thông báo của user đã đọc
 * @param userId
 */
export const markAllNotificationsAsRead = async (
  userId: number
): Promise<void> => {
  await axios.post(`/notifications/mark-all-as-read/${userId}`);
};
