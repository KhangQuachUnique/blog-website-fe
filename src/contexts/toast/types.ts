export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

export interface ToastContextValue {
  /**
   *
   * @param type: "success" | "error" | "info"
   * @param message: string
   * @param duration: number (in milliseconds)
   * @returns
   */
  showToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}
