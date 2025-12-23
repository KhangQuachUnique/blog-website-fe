/**
 * 🔖 Saved Post Types
 * Match với Backend DTOs
 */

import type { IPostResponseDto } from "./post";

// ============================================
// Request DTOs
// ============================================

export interface ToggleSavedPostDto {
  userId: number;
  postId: number;
}

// ============================================
// Response DTOs
// ============================================

export interface SavedPostAuthor {
  id: number;
  username: string;
  avatarUrl?: string;
}

export interface SavedPostListResponse {
  items: IPostResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ToggleSavedPostResponse {
  message: string;
  isSaved: boolean;
}

export interface CheckSavedResponse {
  isSaved: boolean;
}

export interface BatchCheckSavedResponse {
  savedMap: Record<number, boolean>;
}
