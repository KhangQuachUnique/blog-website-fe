/**
 * 🔖 Saved Post Types
 * Match với Backend DTOs
 */

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

export interface SavedPostItem {
  id: number;
  savedAt: Date;
  postId: number;
  postTitle?: string;
  postPreview?: string;
  postThumbnail?: string;
  author: SavedPostAuthor;
}

export interface SavedPostListResponse {
  items: SavedPostItem[];
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
