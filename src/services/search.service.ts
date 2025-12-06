import axios from '../config/axiosCustomize'; // Giả sử bạn đã config axios

// Định nghĩa kiểu dữ liệu trả về (Optional nhưng tốt cho TS)
export interface SearchResultItem {
  id: number | string;
  title?: string;      // Có nếu là Post
  username?: string;   // Có nếu là User
  name?: string;       // Có nếu là Community/Hashtag
  avatarUrl?: string;
  thumbnailUrl?: string;
  // Thêm các fields cho Post (giống Newsfeed)
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
  // Hàm gọi API Search
  search: async (keyword: string, type: string): Promise<SearchResultItem[]> => {
    try {
      const response = await axios.get('/search', {
        params: { q: keyword, type: type }
      });
      
      // Backend trả về { status, statusCode, data } - lấy data array
      if (response.data && response.data.data) {
        return response.data.data;
      }
      
      // Fallback nếu structure khác
      return response.data || [];
    } catch (error) {
      console.error("Lỗi khi tìm kiếm:", error);
      throw error;
    }
  }
};