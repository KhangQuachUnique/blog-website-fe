import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createPost,
  getPostById,
  getAllPosts,
  updatePost,
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
