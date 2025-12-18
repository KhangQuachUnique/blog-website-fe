import { useMutation } from "@tanstack/react-query";
import { togglePostReact } from "../services/user/reactions/reactionService";

/**
 * Hook to toggle reaction on a post.
 * @returns
 */
export const useTogglePostReact = () => {
  return useMutation({
    mutationFn: togglePostReact,
  });
};

/**
 * Hook to toggle reaction on a comment.
 * @returns
 */
export const useToggleCommentReact = () => {
  return useMutation({
    mutationFn: togglePostReact,
  });
};
