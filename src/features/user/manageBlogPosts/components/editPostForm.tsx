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
import type { LayoutItem, BlockData, ObjectFitType } from "../usePostForm";

export interface EditPostFormProps {
  mode: "create" | "update";

  // Title
  title: string;
  onTitleChange: (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => void;

  // Short Description
  shortDescription: string;
  onShortDescriptionChange: (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => void;

  // Layout & Blocks
  layout: LayoutItem[];
  blocks: BlockData[];
  onLayoutChange: (layout: LayoutItem[]) => void;
  onBlockContentChange: (id: string, content: string) => void;
  onBlockCaptionChange: (id: string, caption: string) => void;
  onBlockObjectFitChange: (id: string, objectFit: ObjectFitType) => void;
  onDeleteBlock: (id: string) => void;
  onAddBlock: (type: EBlockType, x?: number, y?: number) => void;
  onGridDrop: (
    newLayout: LayoutItem[],
    layoutItem: LayoutItem,
    event: DragEvent
  ) => void;

  // Config (for ConfigDialog)
  thumbnailUrl: string | null;
  isPublic: boolean;
  hashtags: string[];
  onThumbnailChange: (url: string | null) => void;
  onIsPublicChange: (value: boolean) => void;
  onAddHashtag: (tag: string) => void;
  onRemoveHashtag: (tag: string) => void;

  // Actions
  onSaveDraft?: () => void;
  onPublish?: () => void;
}

const EditPostForm = ({
  mode,
  title,
  onTitleChange,
  shortDescription,
  onShortDescriptionChange,
  layout,
  blocks,
  onLayoutChange,
  onBlockContentChange,
  onBlockCaptionChange,
  onBlockObjectFitChange,
  onDeleteBlock,
  onAddBlock,
  onGridDrop,
  // Config
  thumbnailUrl,
  isPublic,
  hashtags,
  onThumbnailChange,
  onIsPublicChange,
  onAddHashtag,
  onRemoveHashtag,
  // Actions
  onSaveDraft,
  onPublish,
}: EditPostFormProps) => {
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
      onPublish();
    }
    setIsConfigDialogOpen(false);
  };

  return (
    <div className="w-full relative p-9 flex flex-col gap-4 items-center justify-center">
      <BlockSidebar onAddBlock={onAddBlock} />
      <div className="w-[900px] p-3">
        <InputBase
          placeholder="Nhập tiêu đề bài viết..."
          className="w-full"
          multiline
          value={title}
          onChange={onTitleChange}
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
          onChange={onShortDescriptionChange}
          sx={{
            fontSize: "18px",
            fontStyle: "italic",
            marginTop: "12px",
            color: "#8c1d35",
            fontFamily: "Quicksand, Mona Sans, Open Sans, Outfit, sans-serif",
          }}
        />
      </div>
      <div className="w-[900px]">
        <GridLayout
          layout={layout}
          onLayoutChange={(newLayout) =>
            onLayoutChange(newLayout as LayoutItem[])
          }
          cols={16}
          rowHeight={30}
          width={900}
          isDraggable={isCtrlPressed}
          isResizable={true}
          draggableCancel={".rgl-no-drag"}
          isDroppable={true}
          onDrop={onGridDrop}
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
                    onBlockContentChange(block.id, newContent)
                  }
                  style={isCtrlPressed ? { pointerEvents: "none" } : {}}
                />
              ) : (
                <ImageBlock
                  id={block.id}
                  imageUrl={block.content}
                  caption={block.caption}
                  objectFit={block.objectFit}
                  onImageChange={(id, url) => onBlockContentChange(id, url)}
                  onCaptionChange={(id, caption) =>
                    onBlockCaptionChange(id, caption)
                  }
                  onObjectFitChange={(id, objectFit) =>
                    onBlockObjectFitChange(id, objectFit)
                  }
                  style={isCtrlPressed ? { pointerEvents: "none" } : {}}
                />
              )}
              {isCtrlPressed && (
                <div className="absolute top-2 right-2 z-10 rgl-no-drag transition-all">
                  <DeleteConfirmButton
                    className="rgl-no-drag"
                    onConfirm={() => onDeleteBlock(block.id)}
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
            onClick={onSaveDraft}
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
        onThumbnailChange={onThumbnailChange}
        onIsPublicChange={onIsPublicChange}
        onAddHashtag={onAddHashtag}
        onRemoveHashtag={onRemoveHashtag}
        confirmButtonText={mode === "create" ? "Đăng bài" : "Cập nhật"}
      />
    </div>
  );
};

export default EditPostForm;
