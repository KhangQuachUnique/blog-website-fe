import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPost } from '../services/user/post/postService';
import { uploadMultipleFiles } from '../services/upload/uploadImageService';
import { EPostType, type ICreateBlogPostDto, type IPostResponseDto } from '../types/post';
import type { RepostFormData } from '../components/repost/RepostModal';

// ============================================
// Types
// ============================================
export interface CreateRepostParams {
  formData: RepostFormData;
  originalPostId: number;
  authorId: number;
}

// ============================================
// Hook: useCreateRepost
// ============================================
export const useCreateRepost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ formData, originalPostId, authorId }: CreateRepostParams): Promise<IPostResponseDto> => {
      let thumbnailUrl = formData.thumbnailUrl;

      // Upload thumbnail if there's a new file
      if (formData.thumbnailFile) {
        const uploadForm = new FormData();
        uploadForm.append('thumbnail', formData.thumbnailFile);
        const uploadedUrls = await uploadMultipleFiles(uploadForm, ['thumbnail']);
        thumbnailUrl = uploadedUrls.thumbnail || null;
      }

      // Build create repost DTO
      const createDto: ICreateBlogPostDto = {
        title: formData.title,
        shortDescription: '', // Repost không cần short description
        thumbnailUrl: thumbnailUrl || undefined,
        isPublic: true,
        type: EPostType.REPOST,
        authorId,
        originalPostId,
        hashtags: formData.hashtags,
        blocks: [], // Repost không cần blocks
      };

      return createPost(createDto);
    },
    onSuccess: () => {
      // Invalidate newsfeed queries để refresh data
      queryClient.invalidateQueries({ queryKey: ['newsfeed'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};
