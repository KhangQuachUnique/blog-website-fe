import axiosCustomize from '../../config/axiosCustomize';

const unwrap = (res: any) => {
  if (res?.data?.data?.data) return res.data.data.data;
  if (res?.data?.data) return res.data.data;
  return res?.data || res;
};

export interface LoginRequest {
  email: string;
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

export const verifyEmail = async (token: string) => {
  const response = await axiosCustomize.post('/auth/verify-email', { token });
  return unwrap(response);
};
