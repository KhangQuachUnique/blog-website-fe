import axios from "../../config/axiosCustomize";
import type { IPostResponseDto } from "../../types/post";

// ============================================
// Search DTOs - tách biệt cho từng loại
// ============================================

export interface IUserSearchDto {
  id: number;
  username: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  bio?: string;
  gender: "MALE" | "FEMALE";
  joinedAt: Date;
}

export interface ICommunitySearchDto {
  id: number;
  name: string;
  description: string;
  thumbnailUrl?: string;
  isPublic: boolean;
  memberCount: number;
  createdAt: string;
}

export interface ISearchPaginationDto {
  hasMore: boolean;
  nextCursor?: string | null;
}

// ============================================
// Response types - tách biệt cho từng loại search
// ============================================

export interface IPostSearchResponseDto {
  posts: IPostResponseDto[];
  pagination: ISearchPaginationDto;
}

export interface IUserSearchResponseDto {
  users: IUserSearchDto[];
  pagination: ISearchPaginationDto;
}

export interface ICommunitySearchResponseDto {
  communities: ICommunitySearchDto[];
  pagination: ISearchPaginationDto;
}

// Raw response from backend
interface RawSearchResponse {
  posts?: IPostResponseDto[];
  users?: IUserSearchDto[];
  communities?: ICommunitySearchDto[];
  pagination?: ISearchPaginationDto;
}

// ============================================
// Search API functions - trả về đúng kiểu cho từng loại
// ============================================

/**
 * Search posts with pagination
 */
export const searchPosts = async (
  keyword: string,
  after?: string
): Promise<IPostSearchResponseDto> => {
  const params: Record<string, string | number> = {
    q: keyword,
    type: "post",
    limit: 15,
  };
  if (after) params.after = after;

  const response = await axios.get<RawSearchResponse>("/search", { params });
  const data = response as unknown as RawSearchResponse;

  return {
    posts: data.posts ?? [],
    pagination: data.pagination ?? { hasMore: false, nextCursor: null },
  };
};

/**
 * Search users with pagination
 */
export const searchUsers = async (
  keyword: string,
  after?: string
): Promise<IUserSearchResponseDto> => {
  const params: Record<string, string | number> = {
    q: keyword,
    type: "user",
    limit: 15,
  };
  if (after) params.after = after;

  const response = await axios.get<RawSearchResponse>("/search", { params });
  const data = response as unknown as RawSearchResponse;

  return {
    users: data.users ?? [],
    pagination: data.pagination ?? { hasMore: false, nextCursor: null },
  };
};

/**
 * Search communities with pagination
 */
export const searchCommunities = async (
  keyword: string,
  after?: string
): Promise<ICommunitySearchResponseDto> => {
  const params: Record<string, string | number> = {
    q: keyword,
    type: "community",
    limit: 15,
  };
  if (after) params.after = after;

  const response = await axios.get<RawSearchResponse>("/search", { params });
  const data = response as unknown as RawSearchResponse;

  return {
    communities: data.communities ?? [],
    pagination: data.pagination ?? { hasMore: false, nextCursor: null },
  };
};

/**
 * Search by hashtag (returns posts)
 */
export const searchByHashtag = async (
  keyword: string,
  after?: string
): Promise<IPostSearchResponseDto> => {
  const params: Record<string, string | number> = {
    q: keyword,
    type: "hashtag",
    limit: 15,
  };
  if (after) params.after = after;

  const response = await axios.get<RawSearchResponse>("/search", { params });
  const data = response as unknown as RawSearchResponse;

  return {
    posts: data.posts ?? [],
    pagination: data.pagination ?? { hasMore: false, nextCursor: null },
  };
};

// ============================================
// Legacy API (deprecated - for backward compatibility)
// ============================================

// Union type for search result items (legacy support)
export type SearchResultItem =
  | IPostResponseDto
  | IUserSearchDto
  | ICommunitySearchDto;

// Legacy unified response format
export interface ISearchResponseDto {
  items: SearchResultItem[];
  pagination: ISearchPaginationDto;
}

/**
 * Unified search function - requires type parameter
 */
export const searchWithPagination = async (
  keyword: string,
  type: string,
  after?: string
): Promise<ISearchResponseDto> => {
  if (!type) {
    throw new Error("Search type is required");
  }

  const params: Record<string, string | number> = {
    q: keyword,
    type: type,
    limit: 15,
  };

  if (after) {
    params.after = after;
  }

  const response = await axios.get<RawSearchResponse>("/search", { params });
  const data = response as unknown as RawSearchResponse;

  // Convert response to unified format
  let items: SearchResultItem[] = [];

  if ((type === "post" || type === "hashtag") && data.posts) {
    items = data.posts;
  } else if (type === "community" && data.communities) {
    items = data.communities;
  } else if (type === "user" && data.users) {
    items = data.users;
  }

  return {
    items,
    pagination: data.pagination ?? { hasMore: false, nextCursor: null },
  };
};