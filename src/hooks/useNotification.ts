import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getNotifications } from "../services/notification";
import { useAuthUser } from "./useAuth";
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
  const { user, isAuthenticated } = useAuthUser();

  const userId = user?.id as number;

  return useQuery({
    queryKey: ["notifications", userId],
    queryFn: () => getNotifications(userId),
    enabled: isAuthenticated,
    staleTime: 1000 * 60, // 1 phút
  });
};

/**
 * Đánh dấu thông báo đã đọc
 * @param notificationId - ID của notification cần đánh dấu
 * @returns Mutation hook
 */
export const useMarkNotificationAsRead = (notificationId: number) => {
  const { user } = useAuthUser();
  const queryClient = useQueryClient();
  const userId = user?.id as number;

  return useMutation({
    mutationFn: () => markNotificationAsRead(notificationId),
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["notifications", userId] });

      // Snapshot current value
      const previousNotifications = queryClient.getQueryData<
        NotificationResponseDto[]
      >(["notifications", userId]);

      // Optimistically update
      if (previousNotifications) {
        queryClient.setQueryData<NotificationResponseDto[]>(
          ["notifications", userId],
          previousNotifications.map((n) =>
            n.id === notificationId ? { ...n, isRead: true } : n
          )
        );
      }

      return { previousNotifications };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousNotifications) {
        queryClient.setQueryData(
          ["notifications", userId],
          context.previousNotifications
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications", userId],
      });
    },
  });
};

/**
 * Đánh dấu tất cả thông báo của user đã đọc
 * @returns Mutation hook
 */
export const useMarkAllNotificationsAsRead = () => {
  const { user } = useAuthUser();
  const queryClient = useQueryClient();
  const userId = user?.id as number;

  return useMutation({
    mutationFn: () => markAllNotificationsAsRead(userId),
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["notifications", userId] });

      // Snapshot current value
      const previousNotifications = queryClient.getQueryData<
        NotificationResponseDto[]
      >(["notifications", userId]);

      // Optimistically mark all as read
      if (previousNotifications) {
        queryClient.setQueryData<NotificationResponseDto[]>(
          ["notifications", userId],
          previousNotifications.map((n) => ({ ...n, isRead: true }))
        );
      }

      return { previousNotifications };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousNotifications) {
        queryClient.setQueryData(
          ["notifications", userId],
          context.previousNotifications
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications", userId],
      });
    },
  });
};
