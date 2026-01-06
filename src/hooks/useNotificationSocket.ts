import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { useAuth } from "./useAuth";
import { getSocket } from "../lib/socket";
import { useToast } from "../contexts/toast";

export const useNotificationSocket = () => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const socket = getSocket();

    socket.auth = { userId: user.id };
    socket.connect();

    const onNewNotification = () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications", user.id],
      });
      showToast({
        type: "info",
        message: "Bạn có thông báo mới",
      });
    };

    socket.on("notification:new", onNewNotification);

    return () => {
      socket.off("notification:new", onNewNotification);
    };
  }, [isAuthenticated, user, queryClient, showToast]);
};
