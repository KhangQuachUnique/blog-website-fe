import { RouterProvider } from "react-router-dom";
import { router } from "./routes";

import { useNotificationSocket } from "./hooks/useNotificationSocket";

function App() {
  const userId = "54"; // lấy từ auth hoặc redux

  useNotificationSocket(userId);

  return <RouterProvider router={router} />;
}

export default App;
