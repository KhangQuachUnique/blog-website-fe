import React, { useState, useCallback } from "react";
import type { ReactNode } from "react";
import type { Toast } from "./types";
import { ToastContext } from "./ToastContext";
import {
  IoCheckmarkCircle,
  IoCloseCircle,
  IoInformationCircle,
  IoClose,
} from "react-icons/io5";

interface ToastProviderProps {
  children: ReactNode;
}

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
  isExiting: boolean;
}

const ToastItem: React.FC<ToastItemProps> = ({
  toast,
  onRemove,
  isExiting,
}) => {
  const getConfig = () => {
    switch (toast.type) {
      case "success":
        return {
          icon: <IoCheckmarkCircle className="w-5 h-5" />,
          bgClass: "bg-[#FFF0F5] border-[#F295B6]",
          iconColor: "text-[#F295B6]",
          textColor: "text-[#4A3C42]",
        };
      case "error":
        return {
          icon: <IoCloseCircle className="w-5 h-5" />,
          bgClass: "bg-[#FFF0F0] border-[#E57373]",
          iconColor: "text-[#E57373]",
          textColor: "text-[#4A3C42]",
        };
      case "info":
        return {
          icon: <IoInformationCircle className="w-5 h-5" />,
          bgClass: "bg-[#FFF0F5] border-[#F295B6]",
          iconColor: "text-[#F295B6]",
          textColor: "text-[#4A3C42]",
        };
    }
  };

  const config = getConfig();

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3.5 rounded-xl border
        shadow-sm hover:shadow-md backdrop-blur-sm
        transform transition-all duration-300 ease-out
        ${isExiting ? "animate-slideOut" : "animate-slideIn"}
        min-w-[320px] max-w-[420px]
        ${config.bgClass}
      `}
    >
      <div className={`flex-shrink-0 ${config.iconColor}`}>{config.icon}</div>

      <p className={`flex-1 text-sm font-medium ${config.textColor}`}>
        {toast.message}
      </p>

      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 p-1.5 rounded-full hover:bg-white/80 transition-colors group"
        aria-label="Đóng"
      >
        <IoClose className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
      </button>
    </div>
  );
};

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [exitingToasts, setExitingToasts] = useState<Set<string>>(new Set());

  const removeToast = useCallback((id: string) => {
    // Mark toast as exiting
    setExitingToasts((prev) => new Set(prev).add(id));

    // Remove toast after animation completes
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
      setExitingToasts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }, 300); // Match animation duration
  }, []);

  /**
   * Hiển thị toast mới
   * @param type Loại toast "success" | "error" | "info"
   * @param message Nội dung thông báo
   * @param duration Thời gian hiển thị (ms)
   */
  const showToast = useCallback(
    (options: Omit<Toast, "id">) => {
      const id = `toast-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const duration = options.duration ?? 3000;

      const newToast: Toast = {
        ...options,
        id,
        duration,
      };

      setToasts((prev) => {
        // Nếu >= 4 thì bỏ toast đầu tiên (cũ nhất)
        const trimmed = prev.length >= 4 ? prev.slice(1) : prev;
        return [...trimmed, newToast];
      });

      // Auto remove after duration
      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}

      {/* Toast UI Container */}
      {toasts.length > 0 && (
        <div className="fixed top-[100px] right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
          {toasts.map((toast) => (
            <div key={toast.id} className="pointer-events-auto">
              <ToastItem
                toast={toast}
                onRemove={removeToast}
                isExiting={exitingToasts.has(toast.id)}
              />
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
};
