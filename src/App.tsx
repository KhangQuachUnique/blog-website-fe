import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "./routes";
import { ToastProvider } from "./contexts/toast";
import { useAuth } from "./contexts/AuthContext";
import { prefetchCustomEmojis } from "./hooks/useCustomEmojis";

function App() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Prefetch custom emojis ngay sau khi user authenticated
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      prefetchCustomEmojis(queryClient, user.id);
    }
  }, [isAuthenticated, user?.id, queryClient]);

  return (
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  );
}

export default App;
