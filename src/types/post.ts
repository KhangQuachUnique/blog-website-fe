import type { IBlockResponseDto, ICreateBlockDto } from "./block";
import type { UserReactSummaryDto } from "./userReact";
import type { IVotesSummaryDto } from "./user-vote";

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

  votes: IVotesSummaryDto;
  reacts?: UserReactSummaryDto;
  reactions?: UserReactSummaryDto; // Alias (some endpoints use this name)

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
