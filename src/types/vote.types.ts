// ============================================
// VOTE TYPES
// ============================================

import type { UserVoteDto, VoteType } from './user-vote';

// Re-export từ user-vote để các file khác có thể import từ đây
export type { VoteType } from './user-vote';

/**
 * Response khi lấy trạng thái vote
 */
export interface VoteStatusResponse {
  voteType: VoteType | null;
}

/**
 * Response khi thực hiện vote action (create, update, delete)
 */
export interface VoteActionResponse {
  message: string;
  voteType: VoteType | null;
  upVotes: number;
  downVotes: number;
}

/**
 * Props cho VoteButton component
 * Sử dụng UserVoteDto từ post response
 */
export interface VoteButtonProps {
  postId: number;
  userId: number;
  /** Vote data từ post response - ưu tiên dùng cái này */
  votes?: UserVoteDto;
  /** Fallback nếu không có vote object */
  initialVoteType?: VoteType | null;
  initialUpVotes?: number;
  initialDownVotes?: number;
  onVoteChange?: (voteType: VoteType | null, upVotes: number, downVotes: number) => void;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}
