import axiosCustomize from '../config/axiosCustomize';
import type { 
  Comment, 
  CommentsResponse, 
  CreateCommentRequest, 
  CreateChildCommentRequest,
  ChildComment 
} from '../types/comment.types';

class CommentService {
  // Tạo comment gốc
  async createComment(data: CreateCommentRequest): Promise<Comment> {
    const response = await axiosCustomize.post('/comments', data);
    
    // Handle backend response structure
    if (response.data && response.data.data) {
      return response.data.data;
    }
    
    return response.data;
  }

  // Tạo child comment (reply)
  async createChildComment(data: CreateChildCommentRequest): Promise<ChildComment> {
    const response = await axiosCustomize.post('/comments/reply', data);
    return response.data;
  }

  // Lấy comments của post với sorting
  async getCommentsByPost(
    postId: number, 
    sortBy: 'newest' | 'interactions' = 'newest'
  ): Promise<CommentsResponse> {
    const response = await axiosCustomize.get(
      `/comments/post/${postId}?sortBy=${sortBy}`
    );
    
    // Handle backend response structure like search API
    if (response.data && response.data.data) {
      return {
        comments: response.data.data || [],
        totalCount: response.data.totalCount || response.data.data?.length || 0,
        sortBy: sortBy
      };
    }
    
    // Fallback for direct response
    return response.data;
  }

  // Lấy comments của block
  async getCommentsByBlock(blockId: number): Promise<Comment[]> {
    const response = await axiosCustomize.get(`/comments/block/${blockId}`);
    return response.data;
  }

  // Lấy chi tiết comment
  async getComment(id: number): Promise<Comment> {
    const response = await axiosCustomize.get(`/comments/${id}`);
    return response.data;
  }

  // Update comment
  async updateComment(id: number, content: string): Promise<Comment> {
    const response = await axiosCustomize.patch(`/comments/${id}`, { content });
    return response.data;
  }

  // Xóa comment
  async deleteComment(id: number): Promise<void> {
    await axiosCustomize.delete(`/comments/${id}`);
  }

  // Xóa child comment
  async deleteChildComment(id: number): Promise<void> {
    await axiosCustomize.delete(`/comments/child/${id}`);
  }

  // Đếm replies
  async countReplies(commentId: number): Promise<number> {
    const response = await axiosCustomize.get(`/comments/${commentId}/count-replies`);
    return response.data.count;
  }
}

export const commentService = new CommentService();