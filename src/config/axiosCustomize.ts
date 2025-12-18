import axios from "axios";
import { ACCESS_TOKEN_KEY } from "../constants/auth";

const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true, // Enable sending HttpOnly cookies
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling 401 and auto-refresh
instance.interceptors.response.use(
  (response) => {
    if (response && response?.data && response?.data?.data)
      return response.data.data;
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Skip refresh logic for auth endpoints to prevent infinite loops
    const isAuthEndpoint = originalRequest.url?.includes("/auth/");
    if (isAuthEndpoint) {
      return Promise.reject(error);
    }

    // Check if account is banned
    const errorMessage = error.response?.data?.message || '';
    const isBanned = errorMessage.includes('bị khóa') || errorMessage.includes('ban');
    
    if (error.response?.status === 401 && isBanned) {
      // Account is banned - logout immediately
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      sessionStorage.setItem('banMessage', 'Tài khoản của bạn đã bị ban. Vui lòng liên hệ admin.');
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // If 401 and not already retrying, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Call refresh endpoint (cookie sent automatically)
        const refreshResponse = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        // Backend wraps response: { data: { status, data: { accessToken } } }
        const { accessToken } = refreshResponse.data.data;

        // Save new access token
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return instance(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear auth state
        localStorage.removeItem(ACCESS_TOKEN_KEY);

        // Only redirect if not already on login/register page
        const isAuthPage =
          window.location.pathname === "/login" ||
          window.location.pathname === "/register";

        if (!isAuthPage) {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      }
    }
    if (error.response && error.response.data)
      error = error.response.data || error;

    return Promise.reject(error);
  }
);

export default instance;
