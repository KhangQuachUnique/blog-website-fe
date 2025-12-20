import { useNavigate } from "react-router-dom";
import EditPostForm from "../../../features/user/manageBlogPosts/editPostForm";
import { EPostType, type ICreateBlogPostDto } from "../../../types/post";
import { useCreatePost } from "../../../hooks/usePost";
import { useToast } from "../../../contexts/toast";
import { useAuthUser } from "../../../hooks/useAuth";

const CreateBlogPostPage = () => {
  const { user, isAuthenticated } = useAuthUser();
  const { mutate } = useCreatePost();
  const navigate = useNavigate();
  const { showToast } = useToast();

  if (!isAuthenticated || !user) {
    showToast({
      type: "error",
      message: "Bạn cần đăng nhập để tạo bài viết.",
    });
    return null; // Hoặc chuyển hướng đến trang đăng nhập
  }

  const handlePublish = (dto: ICreateBlogPostDto) => {
    console.log("Publishing Post:", dto);
    mutate(dto, {
      onSuccess: (data) => {
        console.log("Post published successfully.", data);
        // Navigate to the newly created post
        if (data?.id) {
          navigate(`/post/${data.id}`, { replace: true });
        } else {
          // Fallback to newsfeed if no ID returned
          navigate("/", { replace: true });
        }
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
      authorId={user.id}
      postType={EPostType.PERSONAL}
      onPublish={handlePublish as (dto: unknown) => void}
    />
  );
};

export default CreateBlogPostPage;
