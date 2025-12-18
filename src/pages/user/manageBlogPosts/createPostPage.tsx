import { useNavigate } from "react-router-dom";
import EditPostForm from "../../../features/user/manageBlogPosts/editPostForm";
import { EPostType, type ICreateBlogPostDto } from "../../../types/post";
import { useCreatePost } from "../../../hooks/usePost";

const CreateBlogPostPage = () => {
  const { mutate } = useCreatePost();
  const navigate = useNavigate();

  const handleSaveDraft = (dto: ICreateBlogPostDto) => {
    console.log("Saving Draft:", dto);
    // TODO: Call API to save draft
  };

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
      },
      onError: (err: unknown) => {
        console.error("Error publishing post (raw):", err);
        if (err instanceof Error) {
          console.error("Validation messages:", err.message);
        }
      },
    });
  };

  return (
    <EditPostForm
      mode="create"
      authorId={3}
      postType={EPostType.PERSONAL}
      onSaveDraft={handleSaveDraft as (dto: unknown) => void}
      onPublish={handlePublish as (dto: unknown) => void}
    />
  );
};

export default CreateBlogPostPage;
