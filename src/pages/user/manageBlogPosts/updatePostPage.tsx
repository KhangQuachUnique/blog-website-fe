import { useParams } from "react-router-dom";

import EditPostForm from "../../../features/user/manageBlogPosts/editPostForm";
import { useGetPostById, useUpdatePost } from "../../../hooks/usePost";
import { EPostType, type IUpdateBlogPostDto } from "../../../types/post";
import { useToast } from "../../../contexts/toast";

const UpdatePostPage = () => {
  const { id } = useParams<{ id: string }>();
  const postId = Number(id);
  const { data: post, isLoading, error } = useGetPostById(postId);
  const { mutate } = useUpdatePost();
  const { showToast } = useToast();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error || !post) {
    return <div>Error loading post.</div>;
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
