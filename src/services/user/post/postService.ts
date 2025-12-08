import axios from "../../../config/axiosCustomize";
import type {
  ICreateBlogPostDto,
  IPostResponseDto,
  IUpdateBlogPostDto,
} from "../../../types/post";

export const getPostById = async (
  postId: number
): Promise<IPostResponseDto> => {
  const response = await axios.get<IPostResponseDto>(`/blog-posts/${postId}`);
  console.log("Fetched Post:", response);
  return response;
};

export const createPost = async (
  data: ICreateBlogPostDto
): Promise<IPostResponseDto> => {
  const response = await axios.post<IPostResponseDto>("/blog-posts", data);
  return response;
};

export const updatePost = async (
  data: IUpdateBlogPostDto
): Promise<IPostResponseDto> => {
  const { id, ...updateData } = data;
  const response = await axios.patch<IPostResponseDto>(
    `/blog-posts/${id}`,
    updateData
  );
  return response;
};
