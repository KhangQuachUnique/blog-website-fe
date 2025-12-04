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
  const response = await axios.put<IPostResponseDto>(
    `/blog-posts/${data.id}`,
    data
  );
  return response;
};
