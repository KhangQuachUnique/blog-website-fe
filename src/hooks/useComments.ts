import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { commentService } from "../services/comment/comment.service";
import type {
  CreateCommentRequest,
  ICommentsResponse,
  SortType,
} from "../types/comment";

export const useGetPostComments = (postId: number, sortBy: SortType) => {
  return useQuery<ICommentsResponse>({
    queryKey: ["postComments", postId, sortBy],
    queryFn: () => commentService.getCommentsByPost(postId, sortBy),
    enabled: Number.isFinite(postId) && postId > 0,
    initialData: {
      comments: [],
      totalCount: 0,
      sortBy,
    },
  });
};

export const useGetBlockComments = (blockId: number) => {
  return useQuery({
    queryKey: ["blockComments", blockId],
    queryFn: () => commentService.getCommentsByBlock(blockId),
    enabled: Number.isFinite(blockId) && blockId > 0,
  });
};

export const useGetComment = (commentId: number) => {
  return useQuery({
    queryKey: ["comment", commentId],
    queryFn: () => commentService.getComment(commentId),
    enabled: Number.isFinite(commentId) && commentId > 0,
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: commentService.createComment,

    onMutate: async (data: CreateCommentRequest) => {
      await queryClient.cancelQueries({
        queryKey: ["postComments", data.postId],
      });

      await queryClient.cancelQueries({
        queryKey: ["blockComments", data.blockId],
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["postComments"],
      });
      queryClient.invalidateQueries({
        queryKey: ["blockComments"],
      });
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: number) => commentService.deleteComment(commentId),

    onSuccess: () => {
      // Invalidate all post and block comments queries to reflect the deletion
      queryClient.invalidateQueries({
        queryKey: ["postComments"],
      });
      queryClient.invalidateQueries({
        queryKey: ["blockComments"],
      });
    },
  });
};
