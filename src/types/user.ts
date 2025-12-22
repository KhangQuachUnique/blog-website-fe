import type { Community } from "./community";
import type { IPostResponseDto } from "./post";

// User roles - match với backend enum
export const EUserRole = {
  ADMIN: "ADMIN",
  USER: "USER",
} as const;

export type EUserRole = (typeof EUserRole)[keyof typeof EUserRole];

export interface User {
  id: number;
  username: string;
  email?: string;
  role?: EUserRole;
  avatarUrl?: string | null;
  bio?: string | null;
  phoneNumber?: string | null;
  displayName?: string;
  dob?: string;
  gender?: "MALE" | "FEMALE";
  isPrivate?: boolean;
  showEmail?: boolean;
  showPhoneNumber?: boolean;
  joinAt?: string;
}

// Response từ API GET /users/:id/profile
export interface UserProfile {
  id: number;
  username: string;
  email?: string;
  phoneNumber?: string;
  bio?: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  dob?: string;
  gender?: "MALE" | "FEMALE";
  isPrivate: boolean;
  showEmail: boolean;
  showPhoneNumber: boolean;
  joinAt: string;
  communities: Community[];
  followersCount: number;
  followingCount: number;
  isFollowing?: boolean;
  posts: IPostResponseDto[];
}

export interface UpdateProfileData {
  username?: string;
  bio?: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  phoneNumber?: string;
  dob?: string;
  gender?: "MALE" | "FEMALE";
  showEmail?: boolean;
  showPhoneNumber?: boolean;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface BlockedUser {
  id: number;
  username: string;
  avatarUrl?: string;
}

export interface UserListItem {
  id: number;
  username: string;
  avatarUrl?: string;
  bio?: string;
  isFollowing?: boolean;
}

export interface ChangeEmailRequest {
  newEmail: string;
}

export interface VerifyEmailRequest {
  newEmail: string;
  verificationCode: string;
}
