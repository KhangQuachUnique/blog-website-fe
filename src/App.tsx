import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { ToastProvider } from "./contexts/toast";
import { useNotificationSocket } from "./hooks/useNotificationSocket";
import { useGetNotifications } from "./hooks/useNotification";

function App() {
  useGetNotifications();
  useNotificationSocket();

  return (
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  );
}

export default App;
