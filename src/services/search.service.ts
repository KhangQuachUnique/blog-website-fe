import axios from '../config/axiosCustomize'; // Giả sử bạn đã config axios

// Định nghĩa kiểu dữ liệu trả về (Optional nhưng tốt cho TS)
export interface SearchResultItem {
  id: number | string;
  title?: string;      // Có nếu là Post
  username?: string;   // Có nếu là User
  name?: string;       // Có nếu là Community
  avatarUrl?: string;
  thumbnailUrl?: string;
}

export const searchAPI = {
  // Hàm gọi API Search
  search: async (keyword: string, type: string): Promise<SearchResultItem[]> => {
    try {
      const response = await axios.get('/search', {
        params: { q: keyword, type: type }
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tìm kiếm:", error);
      throw error;
    }
  }
};