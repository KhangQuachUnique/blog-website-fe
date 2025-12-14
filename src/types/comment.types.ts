export type SortType = 'newest' | 'interactions';

export interface User {
  id: number;
  username: string;
  avatarUrl?: string;
}

export interface ChildComment {
  id: number;
  content: string;
  createAt: string;
  
  // Frontend cũ dùng commentUser, backend trả về commenter
  // Giữ cả 2 hoặc mapping để an toàn cho UI
  commentUser: User; 
  commenter?: User; // Optional để linh hoạt khi map dữ liệu từ BE
  
  replyToUser?: User;
}

export interface Comment {
  id: number;
  content: string;
  type: 'POST' | 'BLOCK';
  createAt: string;
  
  commenter: User;
  
  // --- FIX LỖI CỦA BẠN Ở ĐÂY ---
  // Thêm trường này để useComments.ts có thể đọc được newReply.replyToUser
  replyToUser?: User; 
  
  childComments: ChildComment[];
  childCommentsCount: number;
}

export interface CommentsResponse {
  comments: Comment[];
  totalCount: number;
  sortBy: SortType;
}

export interface CreateCommentRequest {
  content: string;
  postId?: number;
  blockId?: number;
  type: 'POST' | 'BLOCK';
  commenterId: number;

  // --- CẬP NHẬT THÊM ---
  // Thêm 2 trường này để dùng chung 1 hàm createComment cho cả Reply
  parentCommentId?: number;
  replyToUserId?: number;
}

// Interface này có thể giữ lại để tương thích ngược, 
// nhưng logic mới nên dùng CreateCommentRequest
export interface CreateChildCommentRequest {
  content: string;
  parentCommentId: number;
  commentUserId: number;
  replyToUserId?: number;
  type: 'POST' | 'BLOCK';
  
  // Thêm các trường này nếu cần thiết cho legacy code
  postId?: number;
  blockId?: number;
}