import axiosInstance from "../config/axiosCustomize";

export interface IUser {
  id: number;
  username: string;
  email: string;
  phoneNumber?: string;
  type: "USER" | "ADMIN";
  isBanned: boolean;
  isPrivate?: boolean;
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
  type?: "USER" | "ADMIN";
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  phoneNumber?: string;
  type?: "USER" | "ADMIN";
}

export interface UserListResponse {
  data: IUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BanUserRequest {
  reason?: string;
}

// Lấy danh sách người dùng (Admin) - Server-side Pagination
export const getUserList = async (params?: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}): Promise<{
  data: IUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> => {
  const response = await axiosInstance.get("/users/admin/all", { params });
  return response;
};

// Lấy chi tiết người dùng (Admin)
export const getUserById = async (id: number): Promise<IUser> => {
  const response = await axiosInstance.get<IUser>(`/users/admin/${id}`);
  return response as unknown as IUser;
};

// Tạo người dùng (Admin)
export const createUser = async (data: CreateUserRequest): Promise<IUser> => {
  const response = await axiosInstance.post<IUser>("/users/admin", data);
  return response as unknown as IUser;
};

// Cập nhật người dùng (Admin)
export const updateUser = async (
  id: number,
  data: UpdateUserRequest
): Promise<IUser> => {
  const response = await axiosInstance.patch<IUser>(`/users/admin/${id}`, data);
  return response as unknown as IUser;
};

// Cập nhật role người dùng (Admin)
export const updateUserRole = async (
  id: number,
  role: "USER" | "ADMIN"
): Promise<{ message: string; user: IUser }> => {
  const response = await axiosInstance.patch(`/users/admin/${id}/role`, {
    role,
  });
  return response as unknown as { message: string; user: IUser };
};

// Khóa người dùng - Ban (Admin)
export const banUser = async (
  id: number,
  reason?: string
): Promise<{ message: string; user: IUser }> => {
  const response = await axiosInstance.post(`/users/admin/${id}/ban`, {
    reason,
  });
  return response as unknown as { message: string; user: IUser };
};

// Mở khóa người dùng - Unban (Admin)
export const unbanUser = async (
  id: number
): Promise<{ message: string; user: IUser }> => {
  const response = await axiosInstance.post(`/users/admin/${id}/unban`, {});
  return response as unknown as { message: string; user: IUser };
};

// Xóa người dùng (Admin)
export const deleteUser = async (id: number): Promise<{ message: string }> => {
  const response = await axiosInstance.delete(`/users/admin/${id}`);
  return response as unknown as { message: string };
};
