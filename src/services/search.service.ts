import axios from '../config/axiosCustomize';

// 1. Cập nhật Interface khớp với Backend Response
export interface SearchMeta {
  postsTotal?: number;
  postsHasMore?: boolean;
  usersTotal?: number;
  usersHasMore?: boolean;
  communitiesTotal?: number;
  communitiesHasMore?: boolean;
}

export interface SearchResponse {
  posts: SearchResultItem[];
  users: SearchResultItem[];
  communities: SearchResultItem[];
  meta: SearchMeta;
}

// Interface item giữ nguyên (hoặc bổ sung field nếu thiếu)
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

  // Fields used by UI / convertToPost
  upVotes?: number;
  downVotes?: number;
  totalComments?: number;
  totalReacts?: number;
  author?: {
    id: number;
    username: string;
    avatarUrl?: string;
  };

  // ... các field khác
  type?: 'POST' | 'USER' | 'COMMUNITY'; // Frontend tự đánh dấu để render
}

export const searchAPI = {
  /**
   * @param keyword Từ khóa
   * @param type Loại tìm kiếm (để trống nếu tìm tất cả)
   * @param page Trang số mấy (Bắt đầu từ 1)
   * @param limit Số lượng item mỗi lần lấy
   * @returns { items, hasMore }
   */
  search: async (
    keyword: string,
    type: string,
    page = 1,
    limit = 10
  ): Promise<{ items: SearchResultItem[]; hasMore: boolean }> => {
    try {
      // pagination calculation (backend expects skip/take)
      const skip = (page - 1) * limit;

      const params: any = {
        q: keyword,
        skip,
        take: limit,
      };

      if (type) params.type = type;

      const response: any = await axios.get('/search', { params });

      // Annotate items with a `type` flag so the UI can distinguish
      const posts: SearchResultItem[] = (response.posts || []).map((p: any) => ({ ...p, type: 'POST' }));
      const users: SearchResultItem[] = (response.users || []).map((u: any) => ({ ...u, type: 'USER' }));
      const communities: SearchResultItem[] = (response.communities || []).map((c: any) => ({ ...c, type: 'COMMUNITY' }));

      let items: SearchResultItem[] = [];

      if (type === 'post' || type === 'hashtag') items = posts;
      else if (type === 'user') items = users;
      else if (type === 'community') items = communities;
      else items = [...users, ...communities, ...posts]; // default order: users -> communities -> posts for quick search

      const meta = response.meta || {};
      let hasMore = false;

      if (type === 'post') hasMore = typeof meta.postsHasMore === 'boolean' ? meta.postsHasMore : posts.length === limit;
      else if (type === 'user') hasMore = typeof meta.usersHasMore === 'boolean' ? meta.usersHasMore : users.length === limit;
      else if (type === 'community') hasMore = typeof meta.communitiesHasMore === 'boolean' ? meta.communitiesHasMore : communities.length === limit;
      else hasMore = Boolean(meta.postsHasMore || meta.usersHasMore || meta.communitiesHasMore) || items.length === limit;

      return { items, hasMore };
    } catch (error) {
      console.error('Lỗi khi tìm kiếm:', error);
      throw error;
    }
  }
};