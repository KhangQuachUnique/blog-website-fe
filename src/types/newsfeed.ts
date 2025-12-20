import type { IPostResponseDto, IHashtagDto } from "./post";

/**
 * 📰 Newsfeed Item - Extended Post with Newsfeed-specific fields
 * 
 * Cấu trúc này mở rộng từ PostResponseDto với các trường bổ sung 
 * được trả về từ API newsfeed
 */
export interface INewsfeedItemDto extends IPostResponseDto {
  // Newsfeed-specific fields (overrides parent if needed)
  final_score?: number;                    // Scoring/ranking score từ backend
  isViewed?: boolean;                      // Trạng thái xem bài viết
  
  // Repost support - định danh post gốc
  originalPostId?: number | null;          // ID của post gốc (nếu là repost)
  originalPost?: IPostResponseDto | null;  // Full post object gốc (nullable)
  originalPostPreview?: {                  // Preview của post gốc
    id: number;
    title: string;
    thumbnailUrl?: string | null;
    author: {
      id: number;
      username: string;
      avatarUrl: string;
    };
    hashtags?: IHashtagDto[];
    createdAt: string;
  } | null;
}

/**
 * 📄 Pagination Info
 * 
 * Thông tin phân trang để lấy trang tiếp theo
 */
export interface IPaginationDto {
  hasMore: boolean;                        // Còn trang tiếp theo không
  nextCursor?: string | null;              // Cursor để lấy trang kế tiếp
}

/**
 * 🎯 Newsfeed Response DTO
 * 
 * Response trả về khi gọi GET /newsfeed
 * Cấu trúc: { status: "success", data: GetNewsfeedResponseDto }
 */
export interface IGetNewsfeedResponseDto {
  items: INewsfeedItemDto[];               // Danh sách bài viết trong newsfeed
  pagination: IPaginationDto;              // Thông tin phân trang
}

/**
 * 📡 Newsfeed API Response Wrapper
 * 
 * Response wrapper từ API
 */
export interface INewsfeedApiResponse {
  status: string;                          // e.g. "success"
  data: IGetNewsfeedResponseDto;
}
