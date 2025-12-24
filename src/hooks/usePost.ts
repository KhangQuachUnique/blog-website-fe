import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPost,
  getPostById,
  getAllPosts,
  updatePost,
  getPostsByCommunityId,
  getManagePostsByCommunityId,
  approvePost,
  deletePost,
} from "../services/user/post/postService";

/**
 * Hook to get a blog post by ID
 * @param postId
 * @returns
 */
export const useGetPostById = (postId: number) => {
  return useQuery({
    queryKey: ["post", postId],
    queryFn: () => getPostById(postId),
  });
};

/**
 * Hook to get all blog posts
 * @returns
 */
export const useGetAllPosts = () => {
  return useQuery({
    queryKey: ["posts"],
    queryFn: getAllPosts,
  });
};

/**
 * Hook to create a new blog post
 * @returns
 */
export const useCreatePost = () => {
  return useMutation({
    mutationFn: createPost,
  });
};

/**
 * Hook to update an existing blog post
 * @returns
 */
export const useUpdatePost = () => {
  return useMutation({
    mutationFn: updatePost,
  });
};

export const useGetCommunityPosts = (communityId: number) => {
  return useQuery({
    queryKey: ["community-posts", communityId],
    queryFn: () => getPostsByCommunityId(communityId),
    enabled: Number.isFinite(communityId) && communityId > 0,
  });
};

export const useGetCommunityManagePosts = (
  communityId: number,
  params?: { status?: string; isApproved?: boolean }
) => {
  const statusKey = params?.status ?? "ALL";
  const approvedKey =
    typeof params?.isApproved === "boolean" ? String(params.isApproved) : "ALL";

  return useQuery({
    queryKey: ["community-manage-posts", communityId, statusKey, approvedKey],
    queryFn: async () => await getManagePostsByCommunityId(communityId, params),
    enabled: Number.isFinite(communityId) && communityId > 0,
  });
};

export const useApprovePost = (communityId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId: number) => approvePost(postId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["community-manage-posts", communityId] });
      qc.invalidateQueries({ queryKey: ["community-posts", communityId] });
    },
  });
};

export const useDeletePost = (communityId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId: number) => deletePost(postId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["community-manage-posts", communityId] });
      qc.invalidateQueries({ queryKey: ["community-posts", communityId] });
    },
  });
};
