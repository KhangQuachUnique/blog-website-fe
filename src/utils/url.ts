/**
 * Kiểm tra URL có phải là blob URL (ảnh local chưa upload) hay không
 */
export const isBlobUrl = (url: string | undefined | null): boolean => {
  return !!url && url.startsWith("blob:");
};

/**
 * Kiểm tra URL có phải là URL hợp lệ từ server (S3, CDN, etc.)
 */
export const isValidImageUrl = (url: string | undefined | null): boolean => {
  if (!url) return false;
  return url.startsWith("http://") || url.startsWith("https://");
};
