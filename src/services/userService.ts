import axiosInstance from "../config/axiosCustomize";

export interface IUser {
  id: number;
  username: string;
  email: string;
  phoneNumber?: string;
  type: "USER" | "ADMIN";
  isBanned: boolean;
  avatarUrl?: string;
  bio?: string;
  dob?: string;
  gender?: string;
  joinAt?: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  phoneNumber?: string;
  type: "USER" | "ADMIN";
}

// Lấy danh sách người dùng
export const getUserList = async (params?: {
  search?: string;
  status?: string;
}): Promise<IUser[]> => {
  const response = await axiosInstance.get<IUser[]>("/users", { params });
  return response as unknown as IUser[];
};

// Lấy chi tiết người dùng
export const getUserById = async (id: number): Promise<IUser> => {
  const response = await axiosInstance.get<IUser>(`/users/${id}`);
  return response as unknown as IUser;
};

// Tạo người dùng
export const createUser = async (data: CreateUserRequest): Promise<IUser> => {
  const response = await axiosInstance.post<IUser>("/users", data);
  return response as unknown as IUser;
};

// Cập nhật người dùng
export const updateUser = async (id: number, data: Partial<IUser>): Promise<IUser> => {
  const response = await axiosInstance.patch<IUser>(`/users/${id}`, data);
  return response as IUser;
};

// Khóa người dùng (Ban)
export const banUser = async (id: number): Promise<{ message: string }> => {
  const response = await axiosInstance.post(`/users/${id}/ban`, {});
  return response;
};

// Mở khóa người dùng (Unban)
export const unbanUser = async (id: number): Promise<{ message: string }> => {
  const response = await axiosInstance.post(`/users/${id}/unban`, {});
  return response;
};

// Xóa người dùng
export const deleteUser = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/users/${id}`);
};
