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
  createdAt: Date;
  community?: ICommunityDto;
  originalPost?: IPostResponseDto;
  blocks?: IBlockResponseDto[];
  upVotes: number;
  downVotes: number;
  totalComments: number;
  totalReacts: number;
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
