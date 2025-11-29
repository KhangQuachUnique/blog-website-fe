import { useState, useEffect } from "react";
import GridLayout from "react-grid-layout";
import { InputBase } from "@mui/material";

import TextBlock from "../../../components/block/textBlockEdit";
import ImageBlock from "../../../components/block/imageBlockEdit";
import DeleteConfirmButton from "../../../components/deleteConfirmButton";
import CustomButton from "../../../components/button";

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

const CreatePost = () => {
  const [postTitle, setPostTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");

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
    { id: "1", type: "text", content: "<p>Sample Text Block 1</p>" },
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
            fontSize: "20px",
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
              <div
                className={`absolute top-2 right-2 z-10 opacity-0 rgl-no-drag ${
                  isCtrlPressed ? "opacity-100" : "opacity-0"
                } transition-all`}
              >
                <DeleteConfirmButton
                  className="rgl-no-drag"
                  onConfirm={() => handleDeleteBlock(block.id)}
                />
              </div>
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
          style={{
            backgroundColor: "#F295B6",
            color: "white",
            fontWeight: "600",
          }}
        >
          Đăng bài
        </CustomButton>
      </div>
    </div>
  );
};

export default CreatePost;
