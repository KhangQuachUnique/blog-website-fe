import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { useAuth } from "./useAuth";
import { getSocket } from "../lib/socket";
import type { NotificationResponseDto } from "../types/notification";

export const useNotificationSocket = () => {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const socket = getSocket();

    socket.auth = { userId: user.id };
    socket.connect();

    const onNewNotification = (notification: NotificationResponseDto) => {
      queryClient.setQueryData<NotificationResponseDto[]>(
        ["notifications", user.id],
        (oldNotifications = []) => [notification, ...oldNotifications]
      );
    };

    socket.on("notification:new", onNewNotification);

    return () => {
      socket.off("notification:new", onNewNotification);
      socket.disconnect();
    };
  }, [isAuthenticated, user, queryClient]);
};
