export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

export interface ToastContextValue {
  showToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}
