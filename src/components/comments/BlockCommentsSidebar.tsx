import React from "react";
import { Drawer, Box } from "@mui/material";
import { BlockCommentsSection } from "./BlockCommentSection";

interface BlockCommentsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  blockId: number;
  imageUrl?: string;
  currentUser?: {
    id: number;
    username: string;
    avatarUrl?: string;
  };
  /** Community ID để lọc emoji reaction cho comment */
  communityId?: number;
}

export const BlockCommentsSidebar: React.FC<BlockCommentsSidebarProps> = ({
  isOpen,
  onClose,
  blockId,
  communityId,
}) => {
  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      PaperProps={{
        sx: {
          width: { xs: "100vw", sm: 480 },
          maxWidth: "100vw",
          height: "100vh",
        },
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <Box sx={{ p: 2, overflowY: "auto", flex: 1 }}>
          <BlockCommentsSection blockId={blockId} communityId={communityId} />
        </Box>
      </Box>
    </Drawer>
  );
};
