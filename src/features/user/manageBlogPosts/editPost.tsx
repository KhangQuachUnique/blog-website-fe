import { useState, useEffect } from "react";
import GridLayout from "react-grid-layout";
import { InputBase } from "@mui/material";

import TextBlock from "../../../components/block/textBlockEdit";
import ImageBlock from "../../../components/block/imageBlockEdit";
import DeleteConfirmButton from "../../../components/deleteConfirmButton";
import CustomButton from "../../../components/button";
import BlockSidebar from "./components/blockSidebar";
import ConfigDialog from "./components/configDialog";
import type { PublishConfig } from "./components/configDialog";

interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}

const BASE_LAYOUT: LayoutItem[] = [
  { i: "1", x: 0, y: 0, w: 8, h: 6, minW: 3, minH: 4 },
  { i: "2", x: 8, y: 0, w: 8, h: 6, minW: 3, minH: 4 },
];

type ObjectFitType = "contain" | "cover" | "fill";

interface BlockData {
  id: string;
  type: "text" | "image";
  content?: string;
  caption?: string;
  objectFit?: ObjectFitType;
}

const EditPost = () => {
  const [postTitle, setPostTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);

  const handlePostTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPostTitle(e.target.value);
  };

  const handleShortDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setShortDescription(e.target.value);
  };

  const [layout, setLayout] = useState<LayoutItem[]>(BASE_LAYOUT);

  const [blocks, setBlocks] = useState<BlockData[]>([
    { id: "1", type: "text", content: "<p>Nhập nội dung...</p>" },
    {
      id: "2",
      type: "image",
      caption: "Sample Image Caption",
      objectFit: "cover",
    },
  ]);

  const handleBlockContentChange = (id: string, newContent: string) => {
    setBlocks((prevBlocks) =>
      prevBlocks.map((block) =>
        block.id === id ? { ...block, content: newContent } : block
      )
    );
  };

  const handleBlockCaptionChange = (id: string, newCaption: string) => {
    setBlocks((prevBlocks) =>
      prevBlocks.map((block) =>
        block.id === id ? { ...block, caption: newCaption } : block
      )
    );
  };

  const handleDeleteBlock = (id: string) => {
    setBlocks((prevBlocks) => prevBlocks.filter((block) => block.id !== id));
    setLayout((prevLayout) => prevLayout.filter((item) => item.i !== id));
  };

  const handleBlockObjectFitChange = (id: string, objectFit: ObjectFitType) => {
    setBlocks((prevBlocks) =>
      prevBlocks.map((block) =>
        block.id === id ? { ...block, objectFit } : block
      )
    );
  };

  const handleAddBlock = (type: "text" | "image", x?: number, y?: number) => {
    const newId = String(Date.now());
    const maxY = layout.reduce(
      (max, item) => Math.max(max, item.y + item.h),
      0
    );

    const newLayoutItem: LayoutItem = {
      i: newId,
      x: x ?? 0,
      y: y ?? maxY,
      w: 8,
      h: 6,
      minW: 3,
      minH: 4,
    };

    const newBlock: BlockData = {
      id: newId,
      type,
      content: type === "text" ? "<p>Nhập nội dung...</p>" : undefined,
      caption: type === "image" ? "" : undefined,
      objectFit: type === "image" ? "cover" : undefined,
    };

    setLayout((prev) => [...prev, newLayoutItem]);
    setBlocks((prev) => [...prev, newBlock]);
  };

  // Handle drop from external source (BlockSidebar)
  const handleGridDrop = (
    newLayout: LayoutItem[],
    layoutItem: LayoutItem,
    event: DragEvent
  ) => {
    const blockType = event.dataTransfer?.getData("blockType") as
      | "text"
      | "image";
    if (blockType) {
      const newId = String(Date.now());

      // Replace the dropping placeholder with actual block in the layout
      const updatedLayout = newLayout
        .filter((item) => item.i !== "__dropping-elem__")
        .concat({
          i: newId,
          x: layoutItem.x,
          y: layoutItem.y,
          w: layoutItem.w,
          h: layoutItem.h,
          minW: 3,
          minH: 4,
        });

      const newBlock: BlockData = {
        id: newId,
        type: blockType,
        content: blockType === "text" ? "<p>Nhập nội dung...</p>" : undefined,
        caption: blockType === "image" ? "" : undefined,
        objectFit: blockType === "image" ? "cover" : undefined,
      };

      setLayout(updatedLayout);
      setBlocks((prev) => [...prev, newBlock]);
    }
  };

  const [isCtrlPressed, setIsCtrlPressed] = useState(false);

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

  return (
    <div className="w-full relative p-9 flex flex-col gap-4 items-center justify-center">
      <BlockSidebar onAddBlock={handleAddBlock} />
      <div className="w-[900px] p-3">
        <InputBase
          placeholder="Nhập tiêu đề bài viết..."
          className="w-full"
          multiline
          value={postTitle}
          onChange={handlePostTitleChange}
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
      <div className="w-[900px]">
        <GridLayout
          layout={layout}
          onLayoutChange={(newLayout) => setLayout(newLayout as LayoutItem[])}
          cols={16}
          rowHeight={30}
          width={900}
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
              {block.type === "text" ? (
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
      <div className="flex w-[900px] justify-center gap-4 items-center p-4">
        <CustomButton
          variant="outline"
          style={{
            color: "#F295B6",
            border: "2px solid #F295B6",
            fontWeight: "600",
          }}
        >
          Lưu nháp
        </CustomButton>
        <CustomButton
          onClick={() => setIsConfigDialogOpen(true)}
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

      <ConfigDialog
        open={isConfigDialogOpen}
        onClose={() => setIsConfigDialogOpen(false)}
        postTitle={postTitle}
        onPublish={(config: PublishConfig) => {
          console.log("Publishing with config:", config);
          console.log("Post data:", {
            postTitle,
            shortDescription,
            blocks,
            layout,
          });
          setIsConfigDialogOpen(false);
          // TODO: Call API to publish post
        }}
      />
    </div>
  );
};

export default EditPost;
