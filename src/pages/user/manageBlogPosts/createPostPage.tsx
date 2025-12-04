import EditPostForm from "../../../features/user/manageBlogPosts/components/editPostForm";
import { usePostForm } from "../../../features/user/manageBlogPosts/usePostForm";
import { EPostType, type ICreateBlogPostDto } from "../../../types/post";

const CreateBlogPostPage = () => {
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
    getCreateDto,
  } = usePostForm();

  const handleSaveDraft = () => {
    const dto: ICreateBlogPostDto = getCreateDto(0, EPostType.PERSONAL);
    console.log("Saving Draft:", dto);
    // TODO: Call API to save draft
  };

  const handlePublish = () => {
    const dto: ICreateBlogPostDto = getCreateDto(0, EPostType.PERSONAL);
    console.log("Publishing Post:", dto);
    // TODO: Call API to publish post
  };

  return (
    <EditPostForm
      mode="create"
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
      onSaveDraft={handleSaveDraft}
      onPublish={handlePublish}
    />
  );
};

export default CreateBlogPostPage;
