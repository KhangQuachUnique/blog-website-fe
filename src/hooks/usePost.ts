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
  hidePost,
  restorePost,
} from "../services/user/post/postService";
import { type IPostResponseDto, EBlogPostStatus } from "../types/post";

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

/**
 * Hook to hide a blog post
 * Used for Admin or Community Manager
 */
export const useHidePost = () => {
  const qc = useQueryClient();
  
  return useMutation({
    mutationFn: (postId: number) => hidePost(postId),
    
    onSuccess: (_, postId) => {
      qc.setQueryData<IPostResponseDto[]>(["posts"], (oldPosts) => {
        if (!oldPosts) return [];
        return oldPosts.map((post) =>
          post.id === postId 
            ? { ...post, status: EBlogPostStatus.HIDDEN }
            : post
        );
      });

      qc.setQueryData<IPostResponseDto>(["post", postId], (oldPost) => {
          if (!oldPost) return oldPost;
          return { ...oldPost, status: EBlogPostStatus.HIDDEN };
      });

      qc.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

/**
 * Hook to restore a hidden blog post
 */
export const useRestorePost = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => restorePost(postId),
    
    onSuccess: (_, postId) => {
      qc.setQueryData<IPostResponseDto[]>(["posts"], (oldPosts) => {
        if (!oldPosts) return [];
        return oldPosts.map((post) =>
          post.id === postId 
            ? { ...post, status: EBlogPostStatus.ACTIVE }
            : post
        );
      });

      qc.setQueryData<IPostResponseDto>(["post", postId], (oldPost) => {
          if (!oldPost) return oldPost;
          return { ...oldPost, status: EBlogPostStatus.ACTIVE };
      });

      qc.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

export const useGetCommunityPosts = (communityId: number) => {
  return useQuery({
    queryKey: ["community-posts", communityId],
    queryFn: () => getPostsByCommunityId(communityId),
    enabled: Number.isFinite(communityId) && communityId > 0,
  });
};

export const useGetCommunityManagePosts = (communityId: number) => {
  return useQuery({
    queryKey: ["community-manage-posts", communityId],
    queryFn: async () => await getManagePostsByCommunityId(communityId),
    enabled: Number.isFinite(communityId) && communityId > 0,
  });
};

export const useApprovePost = (communityId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId: number) => approvePost(postId),

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["community-manage-posts", communityId],
      });
      qc.invalidateQueries({ queryKey: ["community-posts", communityId] });
    },
  });
};

export const useDeletePost = (communityId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId: number) => deletePost(postId),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["community-manage-posts", communityId],
      });
      qc.invalidateQueries({ queryKey: ["community-posts", communityId] });
    },
  });
};
