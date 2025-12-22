import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { ToastProvider } from "./contexts/toast";
import { useNotificationSocket } from "./hooks/useNotificationSocket";
import { useGetNotifications } from "./hooks/useNotification";
import { useAuth } from "./contexts/AuthContext";
import { usePrefetchCustomEmojis } from "./hooks/usePrefetchCustomEmojis";

function App() {
  useGetNotifications();
  useNotificationSocket();

  const { user, isAuthenticated } = useAuth();
  usePrefetchCustomEmojis(isAuthenticated ? user?.id : undefined);

  return (
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  );
}

export default App;
