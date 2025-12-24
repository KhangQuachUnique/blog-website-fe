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

export const getAllPosts = async (): Promise<IPostResponseDto[]> => {
  const response = await axios.get<IPostResponseDto[]>("/blog-posts");
  return response;
};

export const createPost = async (
  data: ICreateBlogPostDto
): Promise<IPostResponseDto> => {
  console.log("Creating post with data:", data);
  const response = await axios.post<IPostResponseDto>("/blog-posts", data);
  return response;
};

export const updatePost = async (
  data: IUpdateBlogPostDto
): Promise<IPostResponseDto> => {
  const { id, ...updateData } = data;
  console.log("Updating post with data:", updateData);
  const response = await axios.patch<IPostResponseDto>(
    `/blog-posts/${id}`,
    updateData
  );
  return response;
};

export const getPostsByCommunityId = async (communityId: number) => {
  return axios.get(`/blog-posts/community/${communityId}`);
};

export const getManagePostsByCommunityId = async (
  communityId: number
): Promise<IPostResponseDto[]> => {
  return axios.get(`/blog-posts/community/${communityId}/manage`);
};

export const approvePost = async (postId: number) => {
  return axios.patch(`/blog-posts/${postId}/publish`);
};

export const deletePost = async (postId: number) => {
  return axios.delete(`/blog-posts/${postId}`);
};

export const togglePostPrivacy = async (
  postId: number
): Promise<{ message: string; data: IPostResponseDto }> => {
  const response = await axios.patch(`/blog-posts/${postId}/toggle-privacy`);
  return response;
};
