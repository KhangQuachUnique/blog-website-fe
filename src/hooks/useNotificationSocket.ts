import { useEffect } from "react";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function useNotificationSocket(userId: string) {
  useEffect(() => {
    if (!userId) return;

    socket = io("http://localhost:8080", {
      transports: ["websocket"],

      query: { userId },
    });

    socket.on("connect", () => {
      console.log("Connected to WS");
      socket?.emit("join", userId);
    });

    socket.on("notification", (data) => {
      console.log("New notification:", data);
    });

    return () => {
      socket?.disconnect();
    };
  }, [userId]);
}
