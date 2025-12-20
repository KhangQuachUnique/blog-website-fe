import type { IToggleReactDto } from "../../../types/userReact";
import axios from "../../../config/axiosCustomize";

/**
 * Toggle reaction for a post
 * @param data
 * @returns
 */
export const togglePostReact = async (data: IToggleReactDto): Promise<void> => {
  const response = await axios.post("/user-reacts/posts/toggle", data);
  return response;
};

/**
 * Toggle reaction for a comment
 * @param data
 * @returns
 */
export const toggleCommentReact = async (
  data: IToggleReactDto
): Promise<void> => {
  const response = await axios.post("/user-reacts/comments/toggle", data);
  return response;
};
