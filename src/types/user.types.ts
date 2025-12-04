export interface User {
  id: string;
  username: string;
  email: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  bio?: string;
  avatar?: string;
  isPrivate: boolean;
  isBlocked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Community {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  memberCount: number;
  createdAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  authorId: string;
  author: User;
  status: 'draft' | 'published' | 'private';
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  user: User;
  communities: Community[];
  followers: User[];
  following: User[];
  posts: BlogPost[];
  followerCount: number;
  followingCount: number;
  postCount: number;
}

export interface UpdateProfileData {
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  isPrivate?: boolean;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface BlockedUser {
  id: string;
  username: string;
  fullName?: string;
  avatar?: string;
  blockedAt: string;
}
