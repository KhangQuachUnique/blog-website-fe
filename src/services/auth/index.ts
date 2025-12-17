import axiosCustomize from '../../config/axiosCustomize';
import type { EUserRole } from '../../types/user';

interface ApiResponse<T> {
  data: T;
  status?: number;
  statusCode?: number;
}

const unwrap = <T>(res: ApiResponse<T> | T): T => {
  // Backend wraps response in { status, statusCode, data }
  if (res && typeof res === 'object' && 'data' in res) {
    return res.data;
  }
  return res as T;
};

export interface LoginRequest {
  emailOrUsername: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: number;
    username: string;
    email: string;
    role: EUserRole;
  };
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  role: EUserRole;
  avatarUrl: string | null;
  bio: string | null;
  phoneNumber: string | null;
}

export interface RefreshResponse {
  accessToken: string;
}

export interface MessageResponse {
  message: string;
}

export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await axiosCustomize.post('/auth/login', data);
  return unwrap(response);
};

export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
  const response = await axiosCustomize.post('/auth/register', data);
  return unwrap(response);
};

export const logout = async (): Promise<void> => {
  try {
    await axiosCustomize.post('/auth/logout');
  } catch (error) {
    // Ignore errors on logout
  }
};

export const getCurrentUser = async (): Promise<UserResponse> => {
  const response = await axiosCustomize.get('/auth/me');
  return unwrap(response);
};

export const refresh = async (): Promise<RefreshResponse> => {
  const response = await axiosCustomize.post('/auth/refresh');
  return unwrap(response);
};

export const sendOtp = async (email: string): Promise<MessageResponse> => {
  const response = await axiosCustomize.post('/auth/send-otp', { email });
  return unwrap(response);
};

export const verifyOtp = async (email: string, otp: string): Promise<MessageResponse> => {
  const response = await axiosCustomize.post('/auth/verify-otp', { email, otp });
  return unwrap(response);
};

export const sendResetOtp = async (email: string): Promise<MessageResponse> => {
  const response = await axiosCustomize.post('/auth/forgot-password/send-otp', { email });
  return unwrap(response);
};

export const resetPassword = async (email: string, otp: string, newPassword: string): Promise<MessageResponse> => {
  const response = await axiosCustomize.post('/auth/forgot-password/reset', { email, otp, newPassword });
  return unwrap(response);
};
