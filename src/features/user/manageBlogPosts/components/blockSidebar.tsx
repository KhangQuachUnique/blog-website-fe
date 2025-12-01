import { type FC } from "react";
import { TextFields, Image } from "@mui/icons-material";

interface BlockType {
  type: "text" | "image";
  label: string;
  icon: React.ReactNode;
}

const BLOCK_TYPES: BlockType[] = [
  { type: "text", label: "Text", icon: <TextFields /> },
  { type: "image", label: "Image", icon: <Image /> },
];

interface BlockSidebarProps {
  onAddBlock: (type: "text" | "image") => void;
}

const BlockSidebar: FC<BlockSidebarProps> = ({ onAddBlock }) => {
  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    type: "text" | "image"
  ) => {
    e.dataTransfer.setData("blockType", type);
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-xl p-3 flex flex-col gap-3 z-50 border border-gray-200">
      <p className="text-xs text-gray-800 text-center font-semibold">Blocks</p>
      {BLOCK_TYPES.map((block) => (
        <div
          key={block.type}
          draggable
          onDragStart={(e) => handleDragStart(e, block.type)}
          onClick={() => onAddBlock(block.type)}
          className="flex flex-col items-center justify-center p-3 rounded-lg bg-gray-50 hover:bg-pink-50 hover:border-[#F295B6] border-2 border-transparent cursor-grab active:cursor-grabbing transition-all hover:shadow-md"
          title={`Kéo hoặc click để thêm ${block.label}`}
        >
          <span className="text-[#F295B6]">{block.icon}</span>
          <span className="text-xs mt-1 text-gray-600">{block.label}</span>
        </div>
      ))}
    </div>
  );
};

export default BlockSidebar;
