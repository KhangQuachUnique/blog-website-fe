import { useToast } from "../contexts/toast";
import { useAuth } from "../contexts/AuthContext";

interface LoginRequiredToastOptions {
  message?: string;
  duration?: number;
}

/**
 * Hook để kiểm tra đăng nhập và hiển thị toast yêu cầu đăng nhập
 * 
 * @example
 * const { requireLogin, isLoggedIn } = useLoginRequired();
 * 
 * const handleAction = () => {
 *   if (!requireLogin()) return;
 *   // Tiếp tục thực hiện action...
 * };
 */
export const useLoginRequired = () => {
  const { showToast } = useToast();
  const { user, isAuthenticated } = useAuth();

  const isLoggedIn = !!user && isAuthenticated;

  /**
   * Kiểm tra nếu người dùng chưa đăng nhập thì hiển thị toast
   * @returns true nếu đã đăng nhập, false nếu chưa đăng nhập
   */
  const requireLogin = (options?: LoginRequiredToastOptions): boolean => {
    if (!isLoggedIn) {
      showToast({
        type: "info",
        message: options?.message || "Vui lòng đăng nhập để sử dụng tính năng này",
        duration: options?.duration || 3000,
      });
      return false;
    }
    return true;
  };

  /**
   * Wrapper function cho các action yêu cầu đăng nhập
   * @param callback Hàm sẽ được gọi nếu đã đăng nhập
   * @param options Tùy chọn cho toast
   */
  const withLoginRequired = <T extends unknown[]>(
    callback: (...args: T) => void,
    options?: LoginRequiredToastOptions
  ) => {
    return (...args: T) => {
      if (!requireLogin(options)) return;
      callback(...args);
    };
  };

  return {
    isLoggedIn,
    requireLogin,
    withLoginRequired,
    userId: user?.id || 0,
  };
};
