import EditPostForm from "../../../features/user/manageBlogPosts/editPostForm";
import { EPostType, type ICreateBlogPostDto } from "../../../types/post";
import { useCreatePost } from "../../../hooks/usePost";
import { useToast } from "../../../contexts/toast";
import { useAuthUser } from "../../../hooks/useAuth";

const CreateBlogPostPage = () => {
  const { user, isLoading, isAuthenticated } = useAuthUser();
  const { mutate } = useCreatePost();
  const { showToast } = useToast();

  if (isLoading) {
    return <p>Đang tải...</p>;
  }

  if (!isAuthenticated || !user) {
    return <p>Bạn cần đăng nhập để tạo bài viết.</p>;
  }

  const handlePublish = (dto: ICreateBlogPostDto) => {
    console.log("Publishing Post:", dto);
    mutate(dto, {
      onSuccess: () => {
        showToast({
          type: "success",
          message: "Đăng bài thành công!",
        });
      },
      onError: (err) => {
        showToast({
          type: "error",
          message: `Xảy ra lỗi khi đăng bài: ${err.message}`,
        });
      },
    });
  };

  return (
    <EditPostForm
      mode="create"
      authorId={user?.id || 0}
      postType={EPostType.PERSONAL}
      onPublish={handlePublish as (dto: unknown) => void}
    />
  );
};

export default CreateBlogPostPage;
