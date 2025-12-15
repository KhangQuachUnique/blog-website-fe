import axiosCustomize from '../../config/axiosCustomize';

const unwrap = (res: any) => {
  // Backend wraps response in { status, statusCode, data }
  if (res?.data) return res.data;
  return res;
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
  user?: {
    id: number;
    username: string;
    email: string;
    role?: string;
  };
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

export const getCurrentUser = async () => {
  const response = await axiosCustomize.get('/auth/me');
  return unwrap(response);
};

export const refresh = async (): Promise<{ accessToken: string }> => {
  const response = await axiosCustomize.post('/auth/refresh');
  return unwrap(response);
};

export const sendOtp = async (email: string): Promise<{ message: string }> => {
  const response = await axiosCustomize.post('/auth/send-otp', { email });
  return unwrap(response);
};

export const verifyOtp = async (email: string, otp: string): Promise<{ message: string }> => {
  const response = await axiosCustomize.post('/auth/verify-otp', { email, otp });
  return unwrap(response);
};

export const sendResetOtp = async (email: string): Promise<{ message: string }> => {
  const response = await axiosCustomize.post('/auth/forgot-password/send-otp', { email });
  return unwrap(response);
};

export const resetPassword = async (email: string, otp: string, newPassword: string): Promise<{ message: string }> => {
  const response = await axiosCustomize.post('/auth/forgot-password/reset', { email, otp, newPassword });
  return unwrap(response);
};
