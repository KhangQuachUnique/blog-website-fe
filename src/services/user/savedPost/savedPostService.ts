import axiosInstance from '../../../config/axiosCustomize';
import type {
  ToggleSavedPostDto,
  ToggleSavedPostResponse,
  CheckSavedResponse,
  BatchCheckSavedResponse,
  SavedPostListResponse,
} from '../../../types/savedPost';

// ============================================
// 🔖 Saved Post API Service
// ============================================

/**
 * Toggle save/unsave post (bookmark)
 * - Click 1 lần = save
 * - Click lần 2 = unsave
 * 
 * POST /saved-posts/toggle
 */
export const toggleSavePost = async (
  dto: ToggleSavedPostDto
): Promise<ToggleSavedPostResponse> => {
  const response = await axiosInstance.post('/saved-posts/toggle', dto);
  return response as unknown as ToggleSavedPostResponse;
};

/**
 * Check if a single post is saved by user
 * 
 * GET /saved-posts/check?userId=X&postId=Y
 */
export const checkIfSaved = async (
  userId: number,
  postId: number
): Promise<boolean> => {
  const response = await axiosInstance.get<CheckSavedResponse>(
    '/saved-posts/check',
    { params: { userId, postId } }
  );
  return (response as unknown as CheckSavedResponse).isSaved;
};

/**
 * Batch check: Check multiple posts at once (for newsfeed)
 * 
 * GET /saved-posts/batch-check?userId=X&postIds=1,2,3
 */
export const batchCheckSaved = async (
  userId: number,
  postIds: number[]
): Promise<Record<number, boolean>> => {
  if (postIds.length === 0) {
    return {};
  }
  
  const response = await axiosInstance.get<BatchCheckSavedResponse>(
    '/saved-posts/batch-check',
    { params: { userId, postIds: postIds.join(',') } }
  );
  return (response as unknown as BatchCheckSavedResponse).savedMap;
};

/**
 * Get user's saved posts with pagination
 * 
 * GET /saved-posts/user/:userId?page=1&limit=20
 */
export const getUserSavedPosts = async (
  userId: number,
  page = 1,
  limit = 20
): Promise<SavedPostListResponse> => {
  const response = await axiosInstance.get<SavedPostListResponse>(
    `/saved-posts/user/${userId}`,
    { params: { page, limit } }
  );
  return response as unknown as SavedPostListResponse;
};

/**
 * Get total count of saved posts
 * 
 * GET /saved-posts/count?userId=X
 */
export const getSavedPostsCount = async (userId: number): Promise<number> => {
  const response = await axiosInstance.get<{ count: number }>(
    '/saved-posts/count',
    { params: { userId } }
  );
  return (response as unknown as { count: number }).count;
};

/**
 * Remove saved post by item ID
 * 
 * DELETE /saved-posts/:itemId?userId=X
 */
export const removeSavedPost = async (
  itemId: number,
  userId: number
): Promise<void> => {
  await axiosInstance.delete(`/saved-posts/${itemId}`, {
    params: { userId },
  });
};
