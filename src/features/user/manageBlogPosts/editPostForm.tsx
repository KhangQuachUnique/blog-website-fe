import { useState, useEffect, useCallback } from "react";
import GridLayout from "react-grid-layout";
import { InputBase } from "@mui/material";
import {
  GRID_SETTINGS,
  BLOCK_WRAPPER,
  BUTTON_STYLE_OUTLINE,
  BUTTON_STYLE_PRIMARY,
} from "./layoutConstants";

import TextBlock from "../../../components/block/textBlockEdit";
import ImageBlock from "../../../components/block/imageBlockEdit";
import DeleteConfirmButton from "../../../components/deleteConfirmButton";
import CustomButton from "../../../components/button";
import BlockSidebar from "./components/blockSidebar";
import ConfigDialog from "./components/configDialog";
import { EBlockType, type ICreateBlockDto } from "../../../types/block";
import { usePostForm, type LayoutItem } from "./usePostForm";
import type {
  IPostResponseDto,
  EPostType,
  ICreateBlogPostDto,
  IUpdateBlogPostDto,
} from "../../../types/post";
import { uploadMultipleFiles } from "../../../services/upload/uploadImageService";
import { isBlobUrl } from "../../../utils/url";

/**
 * Props
 */
export interface EditPostFormProps {
  mode: "create" | "update";
  post?: IPostResponseDto;
  onSaveDraft?: (dto: ICreateBlogPostDto) => void;
  onPublish?: (dto: ICreateBlogPostDto | IUpdateBlogPostDto) => void;
  authorId: number;
  postType: EPostType;
  communityId?: number;
  originalPostId?: number;
}

// ============ Component ============
const EditPostForm = ({
  mode,
  post,
  onSaveDraft,
  onPublish,
  authorId,
  postType,
  communityId,
  originalPostId,
}: EditPostFormProps) => {
  /**
   * Use Post Form Hook
   */
  const {
    // Basic Info
    title,
    handleTitleChange,
    shortDescription,
    handleShortDescriptionChange,
    thumbnailUrl,
    handleThumbnailChange,
    isPublic,
    handleIsPublicChange,

    // Hashtags
    hashtags,
    addHashtag,
    removeHashtag,

    // Layout & Blocks
    layout,
    handleLayoutChange,
    blocks,
    handleBlockContentChange,
    handleBlockCaptionChange,
    handleBlockObjectFitChange,
    handleDeleteBlock,
    handleAddBlock,
    handleGridDrop,

    // Image Form
    getImageForm,
    getImageKeys,
    handleAppendImageForm,
    handleRemoveImageForm,
    clearImageForm,
  } = usePostForm({ post });

  /**
   * UI States
   */
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  /**
   * Keyboard Events
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) =>
      e.ctrlKey && setIsCtrlPressed(true);
    const handleKeyUp = (e: KeyboardEvent) =>
      !e.ctrlKey && setIsCtrlPressed(false);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  /**
   * Build DTOs
   */
  const buildBlocksDto = useCallback(
    (imageUrls: Record<string, string>): ICreateBlockDto[] => {
      return blocks.map((block) => {
        const layoutItem = layout.find((item) => item.i === block.id);

        let content = block.content || "";
        if (block.type === EBlockType.IMAGE) {
          if (imageUrls[block.id]) {
            content = imageUrls[block.id];
          } else if (isBlobUrl(block.content)) {
            content = ""; // Don't send blob URL to server
          }
        }

        return {
          x: layoutItem?.x ?? 0,
          y: layoutItem?.y ?? 0,
          width: layoutItem?.w ?? 8,
          height: layoutItem?.h ?? 6,
          type: block.type,
          content,
          imageCaption: block.imageCaption,
          objectFit: block.objectFit,
        };
      });
    },
    [blocks, layout]
  );

  const buildThumbnailUrl = useCallback(
    (imageUrls: Record<string, string>): string | undefined => {
      if (imageUrls["thumbnail"]) return imageUrls["thumbnail"];
      if (thumbnailUrl && !isBlobUrl(thumbnailUrl)) return thumbnailUrl;
      return undefined;
    },
    [thumbnailUrl]
  );

  const buildCreateDto = useCallback(
    (imageUrls: Record<string, string>): ICreateBlogPostDto => ({
      title,
      shortDescription,
      thumbnailUrl: buildThumbnailUrl(imageUrls),
      isPublic,
      type: postType,
      authorId,
      communityId,
      originalPostId,
      blocks: buildBlocksDto(imageUrls),
      hashtags,
    }),
    [
      title,
      shortDescription,
      isPublic,
      postType,
      authorId,
      communityId,
      originalPostId,
      hashtags,
      buildBlocksDto,
      buildThumbnailUrl,
    ]
  );

  const buildUpdateDto = useCallback(
    (imageUrls: Record<string, string>): IUpdateBlogPostDto => ({
      id: post?.id ?? 0,
      title,
      shortDescription,
      thumbnailUrl: buildThumbnailUrl(imageUrls),
      isPublic,
      blocks: buildBlocksDto(imageUrls),
      hashtags,
    }),
    [
      post?.id,
      title,
      shortDescription,
      isPublic,
      hashtags,
      buildBlocksDto,
      buildThumbnailUrl,
    ]
  );

  /**
   * Action Handlers
   * @returns
   */
  const handleNextStepClick = () => setIsConfigDialogOpen(true);

  const handlePublish = async () => {
    if (isPublishing || !onPublish) return;

    setIsPublishing(true);
    try {
      // Upload images
      const imageKeys = getImageKeys();
      let imageUrls: Record<string, string> = {};

      if (imageKeys.length > 0) {
        imageUrls = await uploadMultipleFiles(getImageForm(), imageKeys);
        clearImageForm();
      }

      // Build and send DTO
      const dto =
        mode === "create"
          ? buildCreateDto(imageUrls)
          : buildUpdateDto(imageUrls);

      onPublish(dto);
    } catch (error) {
      console.error("Error publishing:", error);
    } finally {
      setIsPublishing(false);
      setIsConfigDialogOpen(false);
    }
  };

  const handleSaveDraft = () => {
    if (!onSaveDraft) return;
    onSaveDraft(buildCreateDto({}));
  };

  return (
    <div className="w-full relative p-9 flex flex-col gap-4 items-center justify-center">
      <BlockSidebar onAddBlock={handleAddBlock} />

      {/* Title & Description */}
      <div className={`w-[${GRID_SETTINGS.width}px] p-3`}>
        <InputBase
          placeholder="Nhập tiêu đề bài viết..."
          className="w-full"
          multiline
          value={title}
          onChange={handleTitleChange}
          sx={{
            fontSize: "48px",
            fontWeight: "bold",
            fontFamily: "Quicksand, Mona Sans, Open Sans, Outfit, sans-serif",
          }}
          spellCheck={false}
        />
        <InputBase
          placeholder="Nhập mô tả ngắn về bài viết..."
          className="w-full"
          multiline
          value={shortDescription}
          onChange={handleShortDescriptionChange}
          sx={{
            fontSize: "18px",
            fontStyle: "italic",
            marginTop: "12px",
            color: "#8c1d35",
            fontFamily: "Quicksand, Mona Sans, Open Sans, Outfit, sans-serif",
          }}
          spellCheck={false}
        />
      </div>

      {/* Grid Layout */}
      <div className={`w-[${GRID_SETTINGS.width}px]`}>
        <GridLayout
          layout={layout}
          onLayoutChange={(newLayout) =>
            handleLayoutChange(newLayout as LayoutItem[])
          }
          cols={GRID_SETTINGS.cols}
          rowHeight={GRID_SETTINGS.rowHeight}
          width={GRID_SETTINGS.width}
          isDraggable={isCtrlPressed}
          isResizable={true}
          draggableCancel=".rgl-no-drag"
          isDroppable={true}
          onDrop={handleGridDrop}
          droppingItem={{ i: "__dropping-elem__", ...GRID_SETTINGS.defaultItem }}
        >
          {blocks.map((block) => (
            <div
              key={block.id}
              className={`${BLOCK_WRAPPER.base} ${
                isCtrlPressed ? BLOCK_WRAPPER.ctrlPressed : BLOCK_WRAPPER.default
              }`}
            >
              {block.type === EBlockType.TEXT ? (
                <TextBlock
                  id={block.id}
                  content={block.content || ""}
                  onContentChange={(newContent) =>
                    handleBlockContentChange(block.id, newContent)
                  }
                  style={isCtrlPressed ? { pointerEvents: "none" } : {}}
                />
              ) : (
                <ImageBlock
                  id={block.id}
                  imageUrl={block.content}
                  imageCaption={block.imageCaption}
                  objectFit={block.objectFit}
                  handleAppendImageForm={handleAppendImageForm}
                  handleRemoveImageForm={handleRemoveImageForm}
                  onImageChange={(id, url) => handleBlockContentChange(id, url)}
                  onImageCaptionChange={(id, caption) =>
                    handleBlockCaptionChange(id, caption)
                  }
                  onObjectFitChange={(id, objectFit) =>
                    handleBlockObjectFitChange(id, objectFit)
                  }
                  style={isCtrlPressed ? { pointerEvents: "none" } : {}}
                />
              )}

              {isCtrlPressed && (
                <div className="absolute top-2 right-2 z-10 rgl-no-drag transition-all">
                  <DeleteConfirmButton
                    className="rgl-no-drag"
                    onConfirm={() => handleDeleteBlock(block.id)}
                  />
                </div>
              )}
            </div>
          ))}
        </GridLayout>
      </div>

      {/* Action Buttons */}
      {mode === "create" ? (
        <div className="flex w-[900px] justify-center gap-4 items-center p-4">
          <CustomButton
            variant="outline"
            onClick={handleSaveDraft}
            style={BUTTON_STYLE_OUTLINE}
          >
            Lưu nháp
          </CustomButton>
          <CustomButton
            onClick={handleNextStepClick}
            style={{ width: "auto", ...BUTTON_STYLE_PRIMARY }}
          >
            Bước tiếp theo
          </CustomButton>
        </div>
      ) : (
        <CustomButton onClick={handleNextStepClick} style={{ width: "auto", ...BUTTON_STYLE_PRIMARY }}>
          Bước tiếp theo
        </CustomButton>
      )}

      {/* Config Dialog */}
      <ConfigDialog
        open={isConfigDialogOpen}
        onClose={() => !isPublishing && setIsConfigDialogOpen(false)}
        onPublish={handlePublish}
        isLoading={isPublishing}
        thumbnail={thumbnailUrl}
        isPublic={isPublic}
        hashtags={hashtags}
        onThumbnailChange={handleThumbnailChange}
        onIsPublicChange={handleIsPublicChange}
        onAddHashtag={addHashtag}
        onRemoveHashtag={removeHashtag}
        onAppendImageForm={handleAppendImageForm}
        onRemoveImageForm={handleRemoveImageForm}
        confirmButtonText={mode === "create" ? "Đăng bài" : "Cập nhật"}
      />
    </div>
  );
};

export default EditPostForm;
