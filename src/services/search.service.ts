import axios from "../config/axiosCustomize";
import type { IPostResponseDto } from "../types/post";

export interface SearchResultItem {
  id: number | string;
  title?: string;
  username?: string;
  name?: string;
  description?: string;
  avatarUrl?: string;
  thumbnailUrl?: string;
  createdAt?: string;
  hashtags?: { id: number; name: string }[];
  upVotes?: number;
  downVotes?: number;
  totalComments?: number;
  totalReacts?: number;
  author?: {
    id: number;
    username: string;
    avatarUrl?: string;
  };
}

export interface ISearchPaginationDto {
  hasMore: boolean;
  nextCursor?: string | null;
}

export interface ISearchResponseDto {
  items: SearchResultItem[];
  pagination: ISearchPaginationDto;
}

interface RawSearchResponse {
  posts?: IPostResponseDto[];
  users?: SearchResultItem[];
  communities?: SearchResultItem[];
  pagination?: ISearchPaginationDto;
}

/**
 * Search with pagination support for infinite scroll
 */
export const searchWithPagination = async (
  keyword: string,
  type: string,
  after?: string
): Promise<ISearchResponseDto> => {
  const params: Record<string, string | number> = {
    q: keyword,
    limit: 15,
  };

  if (type) {
    params.type = type;
  }

  if (after) {
    params.after = after;
  }

  const response = await axios.get<RawSearchResponse>("/search", { params });
  const data = response as unknown as RawSearchResponse;

  // Convert response to unified format
  let items: SearchResultItem[] | IPostResponseDto[] = [];

  if ((type === "post" || type === "hashtag") && data.posts) {
    items = data.posts;
  } else if (type === "community" && data.communities) {
    items = data.communities;
  } else if (type === "user" && data.users) {
    items = data.users;
  } else if (!type) {
    // Tìm kiếm tổng hợp
    if (data.posts) items = [...items, ...data.posts];
    if (data.users) items = [...items, ...data.users];
    if (data.communities) items = [...items, ...data.communities];
  }

  return {
    items,
    pagination: data.pagination ?? { hasMore: false, nextCursor: null },
  };
};

export const searchAPI = {
  search: async (
    keyword: string,
    type: string
  ): Promise<SearchResultItem[]> => {
    try {
      const params: Record<string, string> = { q: keyword };

      if (type) {
        params.type = type;
      }

      const response = await axios.get<RawSearchResponse>("/search", {
        params,
      });
      const data = response as unknown as RawSearchResponse;

      if ((type === "post" || type === "hashtag") && data.posts)
        return data.posts;
      if (type === "community" && data.communities) return data.communities;
      if (type === "user" && data.users) return data.users;

      if (!type) {
        let results: SearchResultItem[] = [];
        if (data.posts) results = [...results, ...data.posts];
        if (data.users) results = [...results, ...data.users];
        if (data.communities) results = [...results, ...data.communities];
        return results;
      }

      return [];
    } catch (error) {
      console.error("Lỗi khi tìm kiếm:", error);
      throw error;
    }
  },
};
