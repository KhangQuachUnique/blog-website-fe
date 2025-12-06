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
    console.log('CommentService.createComment - data:', data);
    // Axios interceptor đã extract response.data.data
    const response = await axiosCustomize.post('/comments', data);
    console.log('CommentService.createComment - response:', response);
    return response as unknown as Comment;
  }

  // Tạo child comment (reply)
  async createChildComment(data: CreateChildCommentRequest): Promise<ChildComment> {
    const response = await axiosCustomize.post('/comments/reply', data);
    return response as unknown as ChildComment;
  }

  // Lấy comments của post với sorting
  async getCommentsByPost(
    postId: number, 
    sortBy: 'newest' | 'interactions' = 'newest'
  ): Promise<CommentsResponse> {
    // Axios interceptor đã extract response.data.data -> trả về array comments
    const comments = await axiosCustomize.get(
      `/comments/post/${postId}?sortBy=${sortBy}`
    ) as unknown as Comment[];
    
    return {
      comments: comments || [],
      totalCount: comments?.length || 0,
      sortBy: sortBy
    };
  }

  // Lấy comments của block
  async getCommentsByBlock(blockId: number): Promise<Comment[]> {
    const response = await axiosCustomize.get(`/comments/block/${blockId}`);
    return response as unknown as Comment[];
  }

  // Lấy chi tiết comment
  async getComment(id: number): Promise<Comment> {
    const response = await axiosCustomize.get(`/comments/${id}`);
    return response as unknown as Comment;
  }

  // Update comment
  async updateComment(id: number, content: string): Promise<Comment> {
    const response = await axiosCustomize.patch(`/comments/${id}`, { content });
    return response as unknown as Comment;
  }

  // Xóa comment
  async deleteComment(id: number): Promise<void> {
    await axiosCustomize.delete(`/comments/${id}`);
  }

  // Xóa child comment (reply)
  async deleteChildComment(id: number): Promise<void> {
    await axiosCustomize.delete(`/comments/reply/${id}`);
  }

  // Đếm replies
  async countReplies(commentId: number): Promise<number> {
    const response = await axiosCustomize.get(`/comments/${commentId}/count-replies`) as unknown as { count: number };
    return response.count;
  }
}

export const commentService = new CommentService();