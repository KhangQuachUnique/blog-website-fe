import axios from "axios";
import type {
  ICreateBlogPostDto,
  IPostResponseDto,
  IUpdateBlogPostDto,
} from "../../../types/post";

export const getPostById = async (postId: number) => {
  const response = await axios.get<IPostResponseDto>(`/api/posts/${postId}`);
  return response.data;
};

export const createPost = async (data: ICreateBlogPostDto) => {
  const response = await axios.post<IPostResponseDto>("/api/posts", data);
  return response.data;
};

export const updatePost = async (data: IUpdateBlogPostDto) => {
  const response = await axios.put<IPostResponseDto>(
    `/api/posts/${data.id}`,
    data
  );
  return response.data;
};
