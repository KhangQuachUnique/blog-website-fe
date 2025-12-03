import { useState, useEffect, useCallback } from 'react';
import { commentService } from '../services/comment.service';
import type { Comment, CommentsResponse, SortType } from '../types/comment.types';

export const useComments = (postId?: number, blockId?: number) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortType>('newest');
  const [totalCount, setTotalCount] = useState(0);

  // Load comments
  const loadComments = useCallback(async () => {
    if (!postId && !blockId) return;
    
    console.log('Loading comments for postId:', postId, 'blockId:', blockId, 'sortBy:', sortBy);
    setLoading(true);
    setError(null);
    
    try {
      if (postId) {
        const response: CommentsResponse = await commentService.getCommentsByPost(postId, sortBy);
        console.log('Comments response:', response);
        setComments(response.comments);
        setTotalCount(response.totalCount);
      } else if (blockId) {
        const commentsData = await commentService.getCommentsByBlock(blockId);
        console.log('Block comments data:', commentsData);
        setComments(commentsData);
        setTotalCount(commentsData.length);
      }
    } catch (err) {
      setError('Không thể tải comments');
      console.error('Error loading comments:', err);
    } finally {
      setLoading(false);
    }
  }, [postId, blockId, sortBy]);

  // Tạo comment mới
  const createComment = async (content: string, commenterId: number) => {
    try {
      const newComment = await commentService.createComment({
        content,
        postId,
        blockId,
        type: postId ? 'post' : 'block',
        commenterId
      });
      
      setComments(prev => [newComment, ...prev]);
      setTotalCount(prev => prev + 1);
      return newComment;
    } catch (err) {
      setError('Không thể tạo comment');
      throw err;
    }
  };

  // Tạo reply
  const createReply = async (
    parentCommentId: number, 
    content: string, 
    commentUserId: number, 
    replyToUserId?: number
  ) => {
    try {
      const newReply = await commentService.createChildComment({
        content,
        parentCommentId,
        commentUserId,
        replyToUserId
      });

      // Update comment trong state
      setComments(prev => 
        prev.map(comment => 
          comment.id === parentCommentId
            ? {
                ...comment,
                childComments: [...comment.childComments, newReply],
                childCommentsCount: comment.childCommentsCount + 1
              }
            : comment
        )
      );
      
      return newReply;
    } catch (err) {
      setError('Không thể tạo reply');
      throw err;
    }
  };

  // Xóa comment
  const deleteComment = async (commentId: number) => {
    try {
      await commentService.deleteComment(commentId);
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      setTotalCount(prev => prev - 1);
    } catch (err) {
      setError('Không thể xóa comment');
      throw err;
    }
  };

  // Xóa reply
  const deleteReply = async (commentId: number, replyId: number) => {
    try {
      await commentService.deleteChildComment(replyId);
      
      setComments(prev =>
        prev.map(comment =>
          comment.id === commentId
            ? {
                ...comment,
                childComments: comment.childComments.filter(child => child.id !== replyId),
                childCommentsCount: comment.childCommentsCount - 1
              }
            : comment
        )
      );
    } catch (err) {
      setError('Không thể xóa reply');
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
    changeSortBy
  };
};