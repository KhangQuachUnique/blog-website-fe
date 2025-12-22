import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getNotifications } from "../services/notification";
import { useAuth } from "./useAuth";
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../services/notification";
import type { NotificationResponseDto } from "../types/notification";

/**
 * Lấy danh sách thông báo của user
 * @returns
 */
import type { UseQueryResult } from "@tanstack/react-query";

export const useGetNotifications = (): UseQueryResult<
  NotificationResponseDto[],
  Error
> => {
  const { user, isAuthenticated } = useAuth();

  const userId = user?.id as number;

  return useQuery({
    queryKey: ["notifications", userId],
    queryFn: () => getNotifications(userId),
    enabled: isAuthenticated && typeof user?.id === "number",
    staleTime: 10000,
  });
};

/**
 * Đánh dấu thông báo đã đọc
 * @param notificationId
 * @returns
 */
export const useMarkNotificationAsRead = (notificationId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markNotificationAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });
    },
  });
};

/**
 * Đánh dấu tất cả thông báo của user đã đọc
 * @returns
 */
export const useMarkAllNotificationsAsRead = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id as number;

  return useMutation({
    mutationFn: () => markAllNotificationsAsRead(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications", userId],
      });
    },
  });
};
