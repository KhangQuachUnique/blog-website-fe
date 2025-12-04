// ============================================
// INTERACT TYPES
// ============================================

export type VoteType = 'upvote' | 'downvote';

export interface VoteResponse {
  voteType: VoteType | null;
  upVotes?: number;
  downVotes?: number;
}

export interface EmojiReaction {
  id: number;
  emoji: {
    id: number;
    emojiUrl: string;
  };
}
