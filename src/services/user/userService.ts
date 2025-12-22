import axiosCustomize from "../../config/axiosCustomize";
import type {
  UserProfile,
  UpdateProfileData,
  ChangePasswordData,
  BlockedUser,
} from "../../types/user.ts";

const unwrap = (res: any) => {
  if (res?.data) return res.data;
  return res;
};

/**
 * Lấy profile của người dùng hiện tại
 */
export const getMyProfile = async (): Promise<UserProfile> => {
  const response = await axiosCustomize.get("/users/me/profile");
  return unwrap(response);
};

/**
 * Lấy profile của user bất kỳ
 */
export const getUserProfile = async (
  userId: number,
  viewerId?: number
): Promise<UserProfile> => {
  const params = viewerId ? { viewerId } : {};
  const response = await axiosCustomize.get(`/users/${userId}/profile`, {
    params,
  });
  return unwrap(response);
};

/**
 * Cập nhật profile của người dùng hiện tại
 */
export const updateMyProfile = async (
  data: UpdateProfileData
): Promise<UserProfile> => {
  const response = await axiosCustomize.patch("/users/me/profile", data);
  return unwrap(response);
};

/**
 * Đổi mật khẩu
 */
export const changePassword = async (
  data: ChangePasswordData
): Promise<{ message: string }> => {
  const response = await axiosCustomize.post("/users/me/change-password", {
    currentPassword: data.currentPassword,
    newPassword: data.newPassword,
    confirmPassword: data.confirmPassword,
  });
  return unwrap(response);
};

/**
 * Yêu cầu reset mật khẩu (quên mật khẩu)
 */
export const requestPasswordReset = async (
  email: string
): Promise<{ message: string }> => {
  const response = await axiosCustomize.post("/users/forgot-password", {
    email,
  });
  return unwrap(response);
};

/**
 * Reset mật khẩu với verification code
 */
export const resetPassword = async (data: {
  email: string;
  verificationCode: string;
  newPassword: string;
}): Promise<{ message: string }> => {
  const response = await axiosCustomize.post("/users/reset-password", data);
  return unwrap(response);
};

/**
 * Chuyển đổi chế độ riêng tư
 */
export const togglePrivacy = async (): Promise<{ isPrivate: boolean }> => {
  const response = await axiosCustomize.patch("/users/me/privacy");
  return unwrap(response);
};

/**
 * Tìm kiếm người dùng theo username
 */
export const searchUsers = async (query: string): Promise<BlockedUser[]> => {
  const response = await axiosCustomize.get("/users/search", {
    params: { q: query },
  });
  return unwrap(response);
};

/**
 * Lấy danh sách người dùng đã chặn
 */
export const getBlockedUsers = async (): Promise<BlockedUser[]> => {
  const response = await axiosCustomize.get("/users/me/blocked");
  return unwrap(response);
};

/**
 * Chặn người dùng
 */
export const blockUser = async (
  userId: number
): Promise<{ message: string }> => {
  const response = await axiosCustomize.post(`/users/${userId}/block`);
  return unwrap(response);
};

/**
 * Bỏ chặn người dùng
 */
export const unblockUser = async (
  userId: number
): Promise<{ message: string }> => {
  const response = await axiosCustomize.delete(`/users/${userId}/block`);
  return unwrap(response);
};

/**
 * Xóa tài khoản
 */
export const deleteAccount = async (): Promise<{ message: string }> => {
  const response = await axiosCustomize.delete("/users/me/account");
  return unwrap(response);
};

/**
 * Follow người dùng
 */
export const followUser = async (
  userId: number
): Promise<{ message: string }> => {
  const response = await axiosCustomize.post(`/users/${userId}/follow`);
  return unwrap(response);
};

/**
 * Unfollow người dùng
 */
export const unfollowUser = async (
  userId: number
): Promise<{ message: string }> => {
  const response = await axiosCustomize.delete(`/users/${userId}/follow`);
  return unwrap(response);
};

/**
 * Lấy danh sách followers
 */
export const getFollowers = async (userId: number): Promise<any[]> => {
  const response = await axiosCustomize.get(`/users/${userId}/followers`);
  return unwrap(response);
};

/**
 * Lấy danh sách following
 */
export const getFollowing = async (userId: number): Promise<any[]> => {
  const response = await axiosCustomize.get(`/users/${userId}/following`);
  return unwrap(response);
};

/**
 * Upload avatar
 */
export const uploadAvatar = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await axiosCustomize.post("/files/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return unwrap(response);
};
