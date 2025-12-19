import axiosCustomize from '../config/axiosCustomize';
import type { 
  Comment, 
  CommentsResponse, 
  CreateCommentRequest, 
  CreateChildCommentRequest,
  ChildComment 
} from '../types/comment.types';

class CommentService {
  // Tạo comment (bao gồm cả comment gốc và reply)
  async createComment(data: CreateCommentRequest): Promise<Comment> {
    console.log('CommentService.createComment - data:', data);
    
    try {
      const response = await axiosCustomize.post('/comments', data);
      console.log('CommentService.createComment - response:', response);
      
      // Handle different response structures
      const resp: any = response as any;
      
      // Try different possible response structures
      if (resp && resp.comment) return resp.comment as Comment;
      if (resp && resp.id) return resp as Comment;
      if (resp && resp.data && resp.data.comment) return resp.data.comment as Comment;
      
      // If response is directly the comment object
      return resp as Comment;
    } catch (err) {
      console.error('CommentService.createComment error:', err);
      
      // Log detailed error information
      try {
        const errorResponse = (err as any)?.response;
        if (errorResponse) {
          console.error('Error status:', errorResponse.status);
          console.error('Error data:', errorResponse.data);
        }
      } catch (e) {
        // Ignore logging errors
      }
      
      throw err;
    }
  }

  // Tạo child comment (reply) - Deprecated, use createComment instead
  async createChildComment(data: CreateChildCommentRequest): Promise<ChildComment> {
    try {
      // Backend accepts replies via the same POST /comments endpoint
      const payload: any = {
        content: data.content,
        parentCommentId: data.parentCommentId,
        commenterId: (data as any).commentUserId ?? (data as any).commenterId,
        type: (data as any).type ? String((data as any).type).toUpperCase() : "POST",
      };
      
      if ((data as any).replyToUserId) payload.replyToUserId = (data as any).replyToUserId;
      if ((data as any).postId) payload.postId = (data as any).postId;
      if ((data as any).blockId) payload.blockId = (data as any).blockId;

      const response = await axiosCustomize.post('/comments', payload);
      const resp: any = response as any;
      
      if (resp && resp.comment) return resp.comment as ChildComment;
      if (resp && resp.id) return resp as ChildComment;
      if (resp && resp.data && resp.data.comment) return resp.data.comment as ChildComment;
      
      return resp as ChildComment;
    } catch (err) {
      console.error('CommentService.createChildComment error:', err);
      
      try {
        const errorResponse = (err as any)?.response;
        if (errorResponse) {
          console.error('Error status:', errorResponse.status);
          console.error('Error data:', errorResponse.data);
        }
      } catch (e) {
        // Ignore
      }
      
      throw err;
    }
  }

  // Lấy comments của post với sorting
  async getCommentsByPost(
    postId: number, 
    sortBy: 'newest' | 'interactions' = 'newest'
  ): Promise<CommentsResponse> {
    try {
      const comments = await axiosCustomize.get(
        `/comments/post/${postId}?sortBy=${sortBy}`
      ) as unknown as Comment[];
      
      return {
        comments: comments || [],
        totalCount: comments?.length || 0,
        sortBy: sortBy
      };
    } catch (err) {
      console.error('Error fetching comments by post:', err);
      throw err;
    }
  }

  // Lấy comments của block
  async getCommentsByBlock(blockId: number): Promise<Comment[]> {
    try {
      const response = await axiosCustomize.get(`/comments/block/${blockId}`);
      return response as unknown as Comment[];
    } catch (err) {
      console.error('Error fetching comments by block:', err);
      throw err;
    }
  }

  // Lấy chi tiết comment
  async getComment(id: number): Promise<Comment> {
    try {
      const response = await axiosCustomize.get(`/comments/${id}`);
      return response as unknown as Comment;
    } catch (err) {
      console.error('Error fetching comment:', err);
      throw err;
    }
  }

  // Update comment
  async updateComment(id: number, content: string): Promise<Comment> {
    try {
      const response = await axiosCustomize.patch(`/comments/${id}`, { content });
      return response as unknown as Comment;
    } catch (err) {
      console.error('Error updating comment:', err);
      throw err;
    }
  }

  // Xóa comment
  async deleteComment(id: number): Promise<void> {
    try {
      await axiosCustomize.delete(`/comments/${id}`);
    } catch (err) {
      console.error('Error deleting comment:', err);
      throw err;
    }
  }

  // Xóa child comment (reply)
  async deleteChildComment(id: number): Promise<void> {
    try {
      // Backend uses a single comments table; delete via same endpoint
      await axiosCustomize.delete(`/comments/${id}`);
    } catch (err) {
      console.error('Error deleting child comment:', err);
      throw err;
    }
  }

  // Đếm replies
  async countReplies(commentId: number): Promise<number> {
    try {
      const response = await axiosCustomize.get(`/comments/${commentId}/count-replies`) as unknown as { count: number };
      return response.count;
    } catch (err) {
      console.error('Error counting replies:', err);
      return 0;
    }
  }
}

export const commentService = new CommentService();