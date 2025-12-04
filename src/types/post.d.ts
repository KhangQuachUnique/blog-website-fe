import type { ICreateBlockDto } from "./block";

export enum EPostType {
  PERSONAL = "PERSONAL",
  COMMUNITY = "COMMUNITY",
  REPOST = "REPOST",
}

export enum EBlogPostStatus {
  ACTIVE = "ACTIVE",
  HIDDEN = "HIDDEN",
  DRAFT = "DRAFT",
}

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

export interface IBlockResponseDto {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: EBlockType;
  content: string;
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
}
