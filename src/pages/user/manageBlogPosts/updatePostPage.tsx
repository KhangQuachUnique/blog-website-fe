import { useParams } from "react-router-dom";

import EditPostForm from "../../../features/user/manageBlogPosts/components/editPostForm";
import { useGetPostById, useUpdatePost } from "../../../hooks/usePost";
import { EPostType, type IUpdateBlogPostDto } from "../../../types/post";

const UpdatePostPage = () => {
  const { id } = useParams<{ id: string }>();
  const postId = Number(id);
  const { data: post, isLoading, error } = useGetPostById(postId);
  const { mutate } = useUpdatePost();

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
        console.log("Post updated successfully.");
      },
      onError: (err) => {
        console.error("Error updating post:", err);
      },
    });
  };

  return (
    <EditPostForm
      mode="update"
      post={post}
      authorId={3}
      postType={EPostType.PERSONAL}
      onPublish={handleUpdate as (dto: unknown) => void}
    />
  );
};

export default UpdatePostPage;
