import type { IBlockResponseDto, ICreateBlockDto } from "./block";

export const EPostType = {
  PERSONAL: "PERSONAL",
  COMMUNITY: "COMMUNITY",
  REPOST: "REPOST",
} as const;

export type EPostType = (typeof EPostType)[keyof typeof EPostType];

export const EBlogPostStatus = {
  ACTIVE: "ACTIVE",
  HIDDEN: "HIDDEN",
  DRAFT: "DRAFT",
} as const;

export type EBlogPostStatus =
  (typeof EBlogPostStatus)[keyof typeof EBlogPostStatus];

export interface ICreateBlogPostDto {
  title: string;
  shortDescription: string;
  thumbnailUrl?: string;
  isPublic?: boolean;
  type: EPostType;
  authorId: number;
  communityId?: number; // Required if type = COMMUNITY
  originalPostId?: number; // Required if type = REPOST
  blocks?: ICreateBlockDto[];
  hashtags?: string[];
}

export interface IUpdateBlogPostDto {
  id: number;
  title?: string;
  shortDescription?: string;
  thumbnailUrl?: string;
  isPublic?: boolean;
  type?: EPostType;
  authorId?: number;
  communityId?: number; // Required if type = COMMUNITY
  originalPostId?: number; // Required if type = REPOST
  blocks?: ICreateBlockDto[];
  hashtags?: string[];
}

export interface IAuthorDto {
  id: number;
  username: string;
  avatarUrl: string;
}

export interface ICommunityDto {
  id: number;
  name: string;
  thumbnailUrl: string;
}

export interface IHashtagDto {
  id: number;
  name: string;
}

// ============================================
// Reaction / Emoji types (from backend UserReactSummaryDto)
// ============================================

/** Emoji types supported by backend */
export type EmojiType = 'UNICODE' | 'CUSTOM';

/** Single emoji summary in a reactions list */
export interface IEmojiSummaryDto {
  emojiId: number;
  type: EmojiType;
  codepoint?: string;       // e.g. "1f60d" for Unicode emojis
  emojiUrl?: string;        // URL for custom emoji images
  totalCount: number;
  reactedByCurrentUser: boolean;
}

/** Reactions summary for a post or comment */
export interface IReactionSummaryDto {
  targetId: number;
  targetType: 'post' | 'comment';
  emojis: IEmojiSummaryDto[];
  totalReactions: number;
}

/** Votes summary (from newsfeed) */
export interface IVotesSummaryDto {
  upvotes: number;
  downvotes: number;
  userVote: 'upvote' | 'downvote' | null;
}

// ============================================
// Post Response DTO
// ============================================

export interface IPostResponseDto {
  id: number;
  title: string;
  shortDescription: string;
  thumbnailUrl?: string;
  isPublic: boolean;
  author: IAuthorDto;
  status: EBlogPostStatus;
  type: EPostType;
  hashtags: IHashtagDto[];
  createdAt: Date | string;
  
  // Community & Repost fields
  community?: ICommunityDto;
  originalPost?: IPostResponseDto | null;
  originalPostId?: number | null;
  
  // Blocks (full post detail)
  blocks?: IBlockResponseDto[];
  
  // Vote & React summaries from newsfeed
  votes?: IVotesSummaryDto;
  reacts?: IReactionSummaryDto;
  reactions?: IReactionSummaryDto;  // Alias (some endpoints use this name)
  
  // Aggregate counts
  upVotes?: number;
  downVotes?: number;
  totalComments?: number;
  totalReacts?: number;
  
  // Newsfeed-specific fields
  final_score?: number;
  isViewed?: boolean;
}

export interface BlogPost {
  id: number;
  title: string;
  status: EBlogPostStatus;
  createdAt: string;
  thumbnailUrl?: string | null;
  upVotes?: number | null;
  downVotes?: number | null;
}
