import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { ToastProvider } from "./contexts/toast";

function App() {
  return (
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  );
}

export default App;
