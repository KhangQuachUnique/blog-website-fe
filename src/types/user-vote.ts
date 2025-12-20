export type VoteType = 'upvote' | 'downvote';

export interface UserVoteDto {
  upvotes: number;
  downvotes: number;
  userVote: VoteType | null;
}