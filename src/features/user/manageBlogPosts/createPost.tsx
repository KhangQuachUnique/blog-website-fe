import { useState, useEffect } from "react";
import GridLayout from "react-grid-layout";
// import ResponsiveGridLayout from "../../../components/responsiveGridLayout/responsiveGridLayout";
import TextBlock from "../../../components/blocks/textBlock";
import ImageBlock from "../../../components/blocks/imageBlock";

interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface BlockData {
  id: string;
  type: "text" | "image";
  content?: string; // HTML cho text, URL cho image
}

const CreatePost = () => {
  const [layout, setLayout] = useState<LayoutItem[]>([
    { i: "1", x: 0, y: 0, w: 8, h: 6 },
    { i: "2", x: 8, y: 0, w: 8, h: 6 },
  ]);

  const [blocks, setBlocks] = useState<BlockData[]>([
    { id: "1", type: "text", content: "<p>Sample Text Block 1</p>" },
    { id: "2", type: "text", content: "<p>Sample Text Block 2</p>" },
  ]);

  const handleBlockContentChange = (id: string, newContent: string) => {
    setBlocks((prevBlocks) =>
      prevBlocks.map((block) =>
        block.id === id ? { ...block, content: newContent } : block
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

  const printLayout = () => {
    console.log("Current Layout:", layout);
  };

  return (
    <div className="w-full p-4 flex flex-col gap-4 items-center justify-center">
      <div className="w-[900px]">
        <GridLayout
          layout={layout}
          onLayoutChange={setLayout}
          cols={16}
          rowHeight={30}
          width={900}
          isDraggable={isCtrlPressed}
          isResizable={true}
        >
          {blocks.map((block) => (
            <div
              key={block.id}
              className={`border-dashed border-2 p-1 rounded-lg border-gray-300 ${
                isCtrlPressed ? "cursor-move border-pink-400" : "cursor-default"
              }`}
            >
              {block.type === "text" ? (
                <TextBlock
                  id={block.id}
                  content={block.content || ""}
                  onContentChange={(newContent) =>
                    handleBlockContentChange(block.id, newContent)
                  }
                />
              ) : (
                <ImageBlock id={block.id} />
              )}
            </div>
          ))}
        </GridLayout>
      </div>
    </div>
  );
};

export default CreatePost;
