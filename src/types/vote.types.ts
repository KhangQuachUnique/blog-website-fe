// ============================================
// VOTE TYPES
// ============================================

/**
 * Loại vote
 */
export type VoteType = 'upvote' | 'downvote';

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
 */
export interface VoteButtonProps {
  postId: number;
  userId: number;
  initialVoteType?: VoteType | null;
  initialUpVotes?: number;
  initialDownVotes?: number;
  onVoteChange?: (voteType: VoteType | null, upVotes: number, downVotes: number) => void;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}
