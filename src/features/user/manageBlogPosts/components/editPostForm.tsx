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
    getUpdateDto,
  } = usePostForm({ post });

  const [isCtrlPressed, setIsCtrlPressed] = useState(false);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);

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

  const handlePublish = () => {
    if (onPublish) {
      if (mode === "create") {
        const dto = getCreateDto(
          authorId,
          postType,
          communityId,
          originalPostId
        );
        onPublish(dto);
      } else {
        const dto = getUpdateDto(
          post?.id ?? 0,
          postType,
          communityId,
          originalPostId
        );
        onPublish(dto);
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
        onClose={() => setIsConfigDialogOpen(false)}
        onPublish={handlePublish}
        thumbnail={thumbnailUrl}
        isPublic={isPublic}
        hashtags={hashtags}
        onThumbnailChange={handleThumbnailChange}
        onIsPublicChange={handleIsPublicChange}
        onAddHashtag={addHashtag}
        onRemoveHashtag={removeHashtag}
        confirmButtonText={mode === "create" ? "Đăng bài" : "Cập nhật"}
      />
    </div>
  );
};

export default EditPostForm;
