import { useParams } from "react-router-dom";

import EditPostForm from "../../../features/user/manageBlogPosts/editPostForm";
import { useGetPostById, useUpdatePost } from "../../../hooks/usePost";
import { EPostType, type IUpdateBlogPostDto } from "../../../types/post";
import { useToast } from "../../../contexts/toast";
import { useAuthUser } from "../../../hooks/useAuth";

const UpdatePostPage = () => {
  const { id } = useParams<{ id: string }>();
  const postId = Number(id);
  const { data: post, isLoading, error } = useGetPostById(postId);
  const { mutate } = useUpdatePost();
  const { showToast } = useToast();
  const { user, isLoading: isAuthLoading } = useAuthUser();

  if (isLoading || isAuthLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-[#F295B6]">
        <svg
          className="animate-spin h-8 w-8 mb-2"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="#F295B6"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="#F295B6"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
        <span className="text-lg font-semibold">Đang tải bài viết...</span>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-red-500">
        <svg
          className="h-10 w-10 mb-2"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z"
          />
        </svg>
        <span className="text-lg font-semibold">Không thể tải bài viết</span>
        <span className="text-sm mt-1">
          Vui lòng thử lại hoặc kiểm tra kết nối nha.
        </span>
      </div>
    );
  }

  if (post.author.id !== user?.id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-yellow-500">
        <svg
          className="h-10 w-10 mb-2"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z"
          />
        </svg>
        <span className="text-lg font-semibold">
          Bạn không có quyền chỉnh sửa bài viết này đâu
        </span>
        <span className="text-sm mt-1">
          Chỉ tác giả mới được chỉnh sửa nội dung thôi.
        </span>
      </div>
    );
  }

  const handleUpdate = (dto: IUpdateBlogPostDto) => {
    console.log("Updating Post:", dto);
    mutate(dto, {
      onSuccess: () => {
        showToast({
          type: "success",
          message: "Cập nhật bài viết thành công!",
        });
      },
      onError: (err) => {
        showToast({
          type: "error",
          message: `Xảy ra lỗi khi cập nhật bài viết: ${
            Array.isArray(err.message) ? err.message.join(", ") : err.message
          }`,
        });
      },
    });
  };

  return (
    <EditPostForm
      mode="update"
      post={post}
      authorId={post.author.id}
      postType={EPostType.PERSONAL}
      onPublish={handleUpdate as (dto: unknown) => void}
    />
  );
};

export default UpdatePostPage;
