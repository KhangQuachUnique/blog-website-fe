export interface User {
  id: number;
  username: string;
  email?: string; // Optional: chỉ hiện nếu user cho phép
  phoneNumber?: string; // Optional: chỉ hiện nếu user cho phép
  bio?: string;
  avatarUrl?: string;
  dob?: string; // Date of birth
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  isPrivate: boolean;
  joinAt: string;
}

export interface Community {
  id: number;
  name: string;
  thumbnailUrl?: string;
}

export interface BlogPost {
  id: number;
  title: string;
  thumbnailUrl?: string;
  isPublic: boolean;
  createdAt: string;
  upVotes: number;
  downVotes: number;
}

// Response từ API GET /users/:id/profile
export interface UserProfile {
  id: number;
  username: string;
  email?: string;
  phoneNumber?: string;
  bio?: string;
  avatarUrl?: string;
  dob?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  isPrivate: boolean;
  joinAt: string;
  communities: Community[];
  followersCount: number;
  followingCount: number;
  posts: BlogPost[];
}

export interface UpdateProfileData {
  username?: string;
  bio?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  dob?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
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

export interface ChangeEmailRequest {
  newEmail: string;
}

export interface VerifyEmailRequest {
  newEmail: string;
  verificationCode: string;
}
