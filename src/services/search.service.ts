import axios from '../config/axiosCustomize';

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

export const searchAPI = {
  search: async (keyword: string, type: string): Promise<SearchResultItem[]> => {
    try {
      // [FIX] Tạo object params động
      const params: any = { q: keyword };
      
      // Chỉ thêm 'type' vào params nếu nó có giá trị (không rỗng, không null)
      if (type) {
        params.type = type;
      }

      // Lúc này axios sẽ chỉ gửi /search?q=M (không có &type=)
      const response = await axios.get('/search', { params });
      
      // Case 1: Tìm cụ thể Post hoặc Hashtag -> Trả về mảng posts
      if ((type === 'post' || type === 'hashtag') && response.posts) return response.posts;
      
      // Case 2: Tìm Community
      if (type === 'community' && response.communities) return response.communities;
      
      // Case 3: Tìm User
      if (type === 'user' && response.users) return response.users;

      // Case 4 [QUAN TRỌNG]: Tìm tổng hợp (Sidebar Search) - Type rỗng
      if (!type) {
        let results: SearchResultItem[] = [];
        // Ưu tiên hiển thị bài viết trước
        if (response.posts) results = [...results, ...response.posts];
        // Sau đó đến user
        if (response.users) results = [...results, ...response.users];
        // Cuối cùng là community
        if (response.communities) results = [...results, ...response.communities];
        
        return results;
      }

      return [];
    } catch (error) {
      console.error("Lỗi khi tìm kiếm:", error);
      throw error;
    }
  }
};