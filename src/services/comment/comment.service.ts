import axios from "../../config/axiosCustomize";
import type {
  ICommentResponse,
  ICommentsResponse,
  CreateCommentRequest,
} from "../../types/comment";

class CommentService {
  // Tạo comment (bao gồm cả comment gốc và reply)
  async createComment(data: CreateCommentRequest): Promise<ICommentResponse> {
    try {
      if (!data.postId && !data.blockId) {
        throw new Error("Either postId or blockId must be provided.");
      }
      const response = await axios.post("/comments", data);
      return response;
    } catch (err) {
      console.error("CommentService.createComment error:", err);
      throw err;
    }
  }

  // Lấy comments của post với sorting
  async getCommentsByPost(
    postId: number,
    sortBy: "newest" | "interactions" = "newest"
  ): Promise<ICommentsResponse> {
    const comments = await axios.get(
      `/comments/post/${postId}?sortBy=${sortBy}`
    );

    console.log("Fetched comments by post:", comments);

    return {
      comments: comments || [],
      totalCount: comments?.length || 0,
      sortBy: sortBy,
    };
  }

  // Lấy comments của block
  async getCommentsByBlock(blockId: number): Promise<ICommentResponse[]> {
    const response = await axios.get(`/comments/block/${blockId}`);
    return response || [];
  }

  // Lấy chi tiết comment
  async getComment(id: number): Promise<ICommentResponse> {
    try {
      const response = await axios.get(`/comments/${id}`);
      return response;
    } catch (err) {
      console.error("Error fetching comment:", err);
      throw err;
    }
  }

  // Update comment
  async updateComment(id: number, content: string): Promise<ICommentResponse> {
    try {
      const response = await axios.patch(`/comments/${id}`, {
        content,
      });
      return response;
    } catch (err) {
      console.error("Error updating comment:", err);
      throw err;
    }
  }

  // Xóa comment
  async deleteComment(id: number): Promise<void> {
    try {
      await axios.delete(`/comments/${id}`);
    } catch (err) {
      console.error("Error deleting comment:", err);
      throw err;
    }
  }

  // Xóa child comment (reply)
  async deleteChildComment(id: number): Promise<void> {
    try {
      // Backend uses a single comments table; delete via same endpoint
      await axios.delete(`/comments/${id}`);
    } catch (err) {
      console.error("Error deleting child comment:", err);
      throw err;
    }
  }

  // Đếm replies
  async countReplies(commentId: number): Promise<number> {
    try {
      const response = (await axios.get(
        `/comments/${commentId}/count-replies`
      )) as unknown as { count: number };
      return response.count;
    } catch (err) {
      console.error("Error counting replies:", err);
      return 0;
    }
  }
}

export const commentService = new CommentService();
