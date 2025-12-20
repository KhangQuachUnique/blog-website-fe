export type VoteType = "upvote" | "downvote";

export interface IVotesSummaryDto {
  upvotes: number;
  downvotes: number;
  userVote: VoteType | null;
}
