import EditPostForm from "../../../features/user/manageBlogPosts/editPostForm";
import { EPostType, type ICreateBlogPostDto } from "../../../types/post";
import { useCreatePost } from "../../../hooks/usePost";

const CreateBlogPostPage = () => {
  const { mutate } = useCreatePost();

  const handleSaveDraft = (dto: ICreateBlogPostDto) => {
    console.log("Saving Draft:", dto);
    // TODO: Call API to save draft
  };

  const handlePublish = (dto: ICreateBlogPostDto) => {
    console.log("Publishing Post:", dto);
    mutate(dto, {
      onSuccess: () => {
        console.log("Post published successfully.");
      },
      onError: (err: any) => {
        console.error("Error publishing post (raw):", err);
        console.error("Validation messages:", err?.message);
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
