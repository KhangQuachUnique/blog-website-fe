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
    // If response has nested data.data structure, unwrap it
    if (response && response?.data && response?.data?.data) {
      return response.data.data;
    }
    // Otherwise return just response.data (the actual data)
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

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
        
        // Only redirect if not already on login/register page and not the refresh endpoint itself
        const isAuthPage = window.location.pathname === '/login' || window.location.pathname === '/register';
        const isRefreshRequest = originalRequest.url?.includes('/auth/refresh');
        
        if (!isAuthPage && !isRefreshRequest) {
          window.location.href = "/login";
        }
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
