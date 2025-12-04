import EditPostForm from "../../../features/user/manageBlogPosts/components/editPostForm";
import { usePostForm } from "../../../features/user/manageBlogPosts/usePostForm";
import { EPostType } from "../../../types/post";

const UpdatePostPage = () => {
  const {
    // Title
    title,
    handleTitleChange,
    // Short Description
    shortDescription,
    handleShortDescriptionChange,
    // Layout
    layout,
    handleLayoutChange,
    // Blocks
    blocks,
    handleBlockContentChange,
    handleBlockCaptionChange,
    handleBlockObjectFitChange,
    handleDeleteBlock,
    handleAddBlock,
    handleGridDrop,
    // Config
    thumbnailUrl,
    isPublic,
    hashtags,
    handleThumbnailChange,
    handleIsPublicChange,
    addHashtag,
    removeHashtag,
    // DTO Getters
    getUpdateDto,
  } = usePostForm();

  const handleUpdate = () => {
    const dto = getUpdateDto(0, EPostType.PERSONAL);
    console.log("Updating Post:", dto);
    // TODO: Call API to update post
  };

  return (
    <EditPostForm
      mode="update"
      title={title}
      onTitleChange={handleTitleChange}
      shortDescription={shortDescription}
      onShortDescriptionChange={handleShortDescriptionChange}
      layout={layout}
      blocks={blocks}
      onLayoutChange={handleLayoutChange}
      onBlockContentChange={handleBlockContentChange}
      onBlockCaptionChange={handleBlockCaptionChange}
      onBlockObjectFitChange={handleBlockObjectFitChange}
      onDeleteBlock={handleDeleteBlock}
      onAddBlock={handleAddBlock}
      onGridDrop={handleGridDrop}
      // Config
      thumbnailUrl={thumbnailUrl}
      isPublic={isPublic}
      hashtags={hashtags}
      onThumbnailChange={handleThumbnailChange}
      onIsPublicChange={handleIsPublicChange}
      onAddHashtag={addHashtag}
      onRemoveHashtag={removeHashtag}
      // Actions
      onPublish={handleUpdate}
    />
  );
};

export default UpdatePostPage;
