// src/config/api.ts
import axiosCustomize from './axiosCustomize';

// Hàm gỡ wrapper của Spring Boot (bắt buộc để dùng thoải mái)
const unwrap = (res: any) => {
  if (res?.data?.data?.data) return res.data.data.data;
  if (res?.data?.data) return res.data.data;
  return res?.data || res;
};

// Các hàm API chính thức bạn sẽ dùng khắp nơi
export const getNewsfeed = async (cursor?: string | null) => {
  const url = cursor ? `/newsfeed?cursor=${cursor}` : '/newsfeed';
  const response = await axiosCustomize.get(url);
  return unwrap(response);
};

export const getPostById = async (id: string) => {
  const response = await axiosCustomize.get(`/posts/${id}`);
  return unwrap(response);
};

