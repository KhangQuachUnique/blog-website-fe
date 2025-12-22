import axiosInstance from "../../config/axiosCustomize";
import type {
  VoteType,
  VoteActionResponse,
  VoteStatusResponse,
} from "../../types/vote.types";

// ============================================
// VOTE SERVICE
// ============================================

/**
 * Toggle vote (upvote/downvote)
 * @param userId - ID của user thực hiện vote
 * @param postId - ID của bài viết được vote
 * @param voteType - Loại vote: 'upvote' hoặc 'downvote'
 * @returns Promise<VoteActionResponse> - Kết quả vote với upVotes, downVotes
 */
export const votePost = async (
  userId: number,
  postId: number,
  voteType: VoteType
): Promise<VoteActionResponse> => {
  const response = await axiosInstance.post("/votes", {
    userId: Number(userId),
    postId: Number(postId),
    voteType,
  });
  return response.data as VoteActionResponse;
};

/**
 * Lấy trạng thái vote hiện tại của user cho bài viết
 * @param userId - ID của user
 * @param postId - ID của bài viết
 * @returns Promise<VoteStatusResponse> - Trạng thái vote hiện tại
 */
export const getVoteStatus = async (
  userId: number,
  postId: number
): Promise<VoteStatusResponse> => {
  const response = await axiosInstance.get("/votes/status", {
    params: { userId, postId },
  });
  return response.data as VoteStatusResponse;
};
