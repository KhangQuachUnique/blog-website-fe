import { useState, useEffect, useCallback } from "react";
import { commentService } from "../services/comment/comment.service";
import type {
  Comment,
  CommentsResponse,
  SortType,
} from "../types/comment.types";

export const useComments = (postId?: number, blockId?: number) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortType>("newest");
  const [totalCount, setTotalCount] = useState(0);

  // Load comments
  const loadComments = useCallback(async () => {
    if (!postId && !blockId) return;

    console.log(
      "Loading comments for postId:",
      postId,
      "blockId:",
      blockId,
      "sortBy:",
      sortBy
    );
    setLoading(true);
    setError(null);

    try {
      if (postId) {
        const response: CommentsResponse =
          await commentService.getCommentsByPost(postId, sortBy);
        // console.log("Comments response:", response);
        setComments(response.comments);
        setTotalCount(response.totalCount);
      } else if (blockId) {
        const commentsData = await commentService.getCommentsByBlock(blockId);
        // console.log('Block comments data:', commentsData);
        setComments(commentsData);
        setTotalCount(commentsData.length);
      }
    } catch (err) {
      setError("Không thể tải comments");
      console.error("Error loading comments:", err);
    } finally {
      setLoading(false);
    }
  }, [postId, blockId, sortBy]);

  // Tạo comment gốc
  const createComment = async (content: string, commenterId: number) => {
    const commentType: "POST" | "BLOCK" = postId ? "POST" : "BLOCK";
    const requestData: any = {
      content,
      type: commentType,
      commenterId,
    };

    if (postId !== undefined && postId !== null)
      requestData.postId = Number(postId);
    if (blockId !== undefined && blockId !== null)
      requestData.blockId = Number(blockId);

    console.log("Creating comment with data:", requestData);

    try {
      const newComment = await commentService.createComment(requestData);

      // Normalize comment structure
      const normalizedComment = {
        ...newComment,
        childComments: newComment.childComments || [],
        childCommentsCount: newComment.childCommentsCount || 0,
      };

      setComments((prev) => [normalizedComment, ...prev]);
      setTotalCount((prev) => prev + 1);

      return newComment;
    } catch (err) {
      setError("Không thể tạo comment");
      console.error("Create comment error:", err);
      throw err;
    }
  };

  // Tạo reply (child comment) - ĐÃ CẬP NHẬT LOGIC TÌM NGƯỜI NHẬN
  const createReply = async (
    parentCommentId: number,
    content: string,
    commenterId: number,
    replyToUserId?: number
  ) => {
    const commentType: "POST" | "BLOCK" = postId ? "POST" : "BLOCK";
    const requestData: any = {
      content,
      type: commentType,
      commenterId,
      parentCommentId,
    };

    if (postId !== undefined && postId !== null)
      requestData.postId = Number(postId);
    if (blockId !== undefined && blockId !== null)
      requestData.blockId = Number(blockId);
    if (replyToUserId) requestData.replyToUserId = replyToUserId;

    console.log("Creating reply with data:", requestData);

    try {
      const newReply = await commentService.createComment(requestData);

      setComments((prev) =>
        prev.map((comment) => {
          if (comment.id !== parentCommentId) return comment;

          // --- LOGIC MỚI: TÌM THÔNG TIN NGƯỜI ĐƯỢC TRẢ LỜI ---
          let replyToUserObj = undefined;

          // 1. Nếu Backend trả về sẵn thông tin người nhận, dùng luôn (Ưu tiên cao nhất)
          if (newReply.replyToUser) {
            replyToUserObj = newReply.replyToUser;
          }
          // 2. Nếu không, tìm thủ công ở Client dựa trên ID đã truyền vào
          else if (replyToUserId) {
            // Case A: Reply chính người viết comment gốc (Parent)
            if (comment.commenter.id === replyToUserId) {
              replyToUserObj = comment.commenter;
            }
            // Case B: Reply một child comment khác trong cùng thread
            else {
              // Tìm trong danh sách childComments hiện tại
              const foundChild = comment.childComments.find(
                (c) =>
                  c.commentUser?.id === replyToUserId ||
                  (c as any).commenter?.id === replyToUserId
              );

              if (foundChild) {
                replyToUserObj =
                  foundChild.commentUser || (foundChild as any).commenter;
              }
            }
          }
          // --- KẾT THÚC LOGIC TÌM NGƯỜI NHẬN ---

          return {
            ...comment,
            childComments: [
              ...comment.childComments,
              {
                id: newReply.id,
                content: newReply.content,
                createAt: newReply.createAt,
                // Xử lý field user trả về từ BE có thể không đồng nhất
                commentUser:
                  newReply.commenter || (newReply as any).commentUser,
                replyToUser: replyToUserObj, // Đã có object user, UI sẽ hiển thị mũi tên ->
              },
            ],
            childCommentsCount: comment.childCommentsCount + 1,
          };
        })
      );

      return newReply;
    } catch (err) {
      setError("Không thể tạo reply");
      console.error("Create reply error:", err);
      throw err;
    }
  };

  // Xóa comment
  const deleteComment = async (commentId: number) => {
    try {
      await commentService.deleteComment(commentId);
      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
      setTotalCount((prev) => prev - 1);
    } catch (err) {
      setError("Không thể xóa comment");
      throw err;
    }
  };

  // Xóa reply
  const deleteReply = async (commentId: number, replyId: number) => {
    try {
      await commentService.deleteChildComment(replyId);

      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                childComments: comment.childComments.filter(
                  (child) => child.id !== replyId
                ),
                childCommentsCount: comment.childCommentsCount - 1,
              }
            : comment
        )
      );
    } catch (err) {
      setError("Không thể xóa reply");
      throw err;
    }
  };

  // Change sort
  const changeSortBy = (newSortBy: SortType) => {
    setSortBy(newSortBy);
  };

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  return {
    comments,
    loading,
    error,
    sortBy,
    totalCount,
    loadComments,
    createComment,
    createReply,
    deleteComment,
    deleteReply,
    changeSortBy,
  };
};
