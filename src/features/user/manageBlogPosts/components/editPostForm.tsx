import { useState, useEffect } from "react";
import GridLayout from "react-grid-layout";
import { InputBase } from "@mui/material";

import TextBlock from "../../../../components/block/textBlockEdit";
import ImageBlock from "../../../../components/block/imageBlockEdit";
import DeleteConfirmButton from "../../../../components/deleteConfirmButton";
import CustomButton from "../../../../components/button";
import BlockSidebar from "./blockSidebar";
import ConfigDialog from "./configDialog";
import { EBlockType } from "../../../../types/block";
import { usePostForm, type LayoutItem } from "../usePostForm";
import type { IPostResponseDto, EPostType } from "../../../../types/post";
import { uploadMultipleFiles } from "../../../../services/upload/uploadImageService";

export interface EditPostFormProps {
  mode: "create" | "update";
  post?: IPostResponseDto;
  onSaveDraft?: (
    dto: ReturnType<ReturnType<typeof usePostForm>["getCreateDto"]>
  ) => void;
  onPublish?: (
    dto:
      | ReturnType<ReturnType<typeof usePostForm>["getCreateDto"]>
      | ReturnType<ReturnType<typeof usePostForm>["getUpdateDto"]>
  ) => void;
  authorId: number;
  postType: EPostType;
  communityId?: number;
  originalPostId?: number;
}

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
    // Image FormData
    getImageForm,
    getImageKeys,
    handleAppendImageForm,
    handleRemoveImageForm,
    clearImageForm,
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
  } = usePostForm({ post });

  const [isCtrlPressed, setIsCtrlPressed] = useState(false);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Track Ctrl key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey) {
        setIsCtrlPressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.ctrlKey) {
        setIsCtrlPressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const handleNextStepClick = () => {
    setIsConfigDialogOpen(true);
  };

  /**
   * Kiểm tra URL có phải là blob URL (ảnh local chưa upload) hay không
   */
  const isBlobUrl = (url: string | undefined): boolean => {
    return !!url && url.startsWith("blob:");
  };

  const handlePublish = async () => {
    // Tránh click nhiều lần
    if (isPublishing) return;

    if (onPublish) {
      setIsPublishing(true);

      try {
        // Upload images và lấy URLs từ S3
        const imageKeys = getImageKeys();
        let imageUrls: Record<string, string> = {};

        if (imageKeys.length > 0) {
          imageUrls = await uploadMultipleFiles(getImageForm(), imageKeys);
          // Clear FormData sau khi upload thành công để tránh upload trùng
          clearImageForm();
        }

        // Lấy thumbnail URL:
        // - Nếu có URL mới upload -> dùng URL mới
        // - Nếu thumbnail hiện tại là blob URL -> undefined (không gửi blob lên server)
        // - Nếu thumbnail hiện tại là S3 URL -> giữ nguyên
        let finalThumbnailUrl: string | undefined;
        if (imageUrls["thumbnail"]) {
          finalThumbnailUrl = imageUrls["thumbnail"];
        } else if (thumbnailUrl && !isBlobUrl(thumbnailUrl)) {
          finalThumbnailUrl = thumbnailUrl;
        } else {
          finalThumbnailUrl = undefined;
        }

        // Tạo blocks DTO với URL đã được cập nhật
        // - Nếu block có URL mới upload -> dùng URL mới
        // - Nếu block content là S3 URL (không phải blob) -> giữ nguyên
        // - Nếu block content là blob URL nhưng không có trong imageUrls -> bỏ qua (content = "")
        const blocksDto = blocks.map((block) => {
          const layoutItem = layout.find((item) => item.i === block.id);

          let content = block.content || "";
          if (block.type === EBlockType.IMAGE) {
            if (imageUrls[block.id]) {
              // Có URL mới upload
              content = imageUrls[block.id];
            } else if (isBlobUrl(block.content)) {
              // Blob URL nhưng chưa upload -> không gửi blob lên server
              content = "";
            }
            // Nếu không phải blob URL -> giữ nguyên S3 URL cũ
          }

          return {
            x: layoutItem?.x ?? 0,
            y: layoutItem?.y ?? 0,
            width: layoutItem?.w ?? 8,
            height: layoutItem?.h ?? 6,
            type: block.type,
            content,
          };
        });

        if (mode === "create") {
          const dto = {
            title,
            shortDescription,
            thumbnailUrl: finalThumbnailUrl,
            isPublic,
            type: postType,
            authorId,
            communityId,
            originalPostId,
            blocks: blocksDto,
            hashtags,
          };
          onPublish(dto);
        } else {
          // Update không cần gửi type, communityId, originalPostId
          const dto = {
            id: post?.id ?? 0,
            title,
            shortDescription,
            thumbnailUrl: finalThumbnailUrl,
            isPublic,
            blocks: blocksDto,
            hashtags,
          };
          onPublish(dto);
        }
      } catch (error) {
        console.error("Error uploading images:", error);
      } finally {
        setIsPublishing(false);
      }
    }
    setIsConfigDialogOpen(false);
  };

  const handleSaveDraft = () => {
    if (onSaveDraft) {
      const dto = getCreateDto(authorId, postType, communityId, originalPostId);
      onSaveDraft(dto);
    }
  };

  return (
    <div className="w-full relative p-9 flex flex-col gap-4 items-center justify-center">
      <BlockSidebar onAddBlock={handleAddBlock} />
      <div className="w-[800px] p-3">
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
        />
      </div>
      <div className="w-[800px]">
        <GridLayout
          layout={layout}
          onLayoutChange={(newLayout) =>
            handleLayoutChange(newLayout as LayoutItem[])
          }
          cols={16}
          rowHeight={30}
          width={800}
          isDraggable={isCtrlPressed}
          isResizable={true}
          draggableCancel={".rgl-no-drag"}
          isDroppable={true}
          onDrop={handleGridDrop}
          droppingItem={{ i: "__dropping-elem__", w: 8, h: 6 }}
        >
          {blocks.map((block) => (
            <div
              key={block.id}
              className={`border-dashed border-2 rounded-lg border-gray-300 relative   ${
                isCtrlPressed
                  ? "cursor-move border-pink-400 select-none"
                  : "cursor-default"
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
                  caption={block.caption}
                  objectFit={block.objectFit}
                  handleAppendImageForm={handleAppendImageForm}
                  handleRemoveImageForm={handleRemoveImageForm}
                  onImageChange={(id, url) => handleBlockContentChange(id, url)}
                  onCaptionChange={(id, caption) =>
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
      {mode === "create" ? (
        <div className="flex w-[900px] justify-center gap-4 items-center p-4">
          <CustomButton
            variant="outline"
            onClick={handleSaveDraft}
            style={{
              color: "#F295B6",
              border: "2px solid #F295B6",
              fontWeight: "600",
            }}
          >
            Lưu nháp
          </CustomButton>
          <CustomButton
            onClick={handleNextStepClick}
            style={{
              width: "auto",
              backgroundColor: "#F295B6",
              color: "white",
              fontWeight: "600",
            }}
          >
            Bước tiếp theo
          </CustomButton>
        </div>
      ) : (
        <CustomButton
          onClick={handleNextStepClick}
          style={{
            width: "auto",
            backgroundColor: "#F295B6",
            color: "white",
            fontWeight: "600",
          }}
        >
          Bước tiếp theo
        </CustomButton>
      )}

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
