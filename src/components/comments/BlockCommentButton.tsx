import { BiSolidCommentDetail } from "react-icons/bi";
import { BlockCommentsSidebar } from "./BlockCommentsSidebar";
import { useState } from "react";
import { Tooltip } from "@mui/material";

interface BlockCommentButtonProps {
  blockId: number;
}

export const BlockCommentButton: React.FC<BlockCommentButtonProps> = ({
  blockId,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <>
      <Tooltip title="Bình luận cho khối này">
        <button onClick={() => setIsSidebarOpen(true)}>
          <BiSolidCommentDetail size={30} color="#FEB2CD" />
        </button>
      </Tooltip>
      <BlockCommentsSidebar
        blockId={blockId}
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
      />
    </>
  );
};
