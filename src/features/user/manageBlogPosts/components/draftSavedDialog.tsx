import { Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import { Close, CheckCircle } from "@mui/icons-material";
import { useEffect } from "react";

interface DraftSavedDialogProps {
  open: boolean;
  onClose: () => void;
  /** Auto close after this many milliseconds (default: 2500) */
  autoCloseMs?: number;
}

// Theme colors matching the website
const THEME = {
  primary: "#f295b6",
  primaryLight: "#fce4ec",
  text: "#4A3C42",
  textMuted: "#6b7280",
  success: "#22c55e",
  successLight: "#dcfce7",
  fontFamily: "Quicksand, Mona Sans, Open Sans, Outfit, sans-serif",
};

const DraftSavedDialog = ({
  open,
  onClose,
  autoCloseMs = 2500,
}: DraftSavedDialogProps) => {
  // Auto close after specified time
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseMs);
      return () => clearTimeout(timer);
    }
  }, [open, onClose, autoCloseMs]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 0,
          overflow: "hidden",
          width: 380,
          bgcolor: "white",
          boxShadow: "0 25px 50px -12px rgba(34, 197, 94, 0.2)",
        },
      }}
      sx={{
        fontFamily: THEME.fontFamily,
        "& .MuiBackdrop-root": {
          backgroundColor: "rgba(74, 60, 66, 0.3)",
        },
      }}
    >
      {/* Header with gradient */}
      <div
        className="relative px-6 pt-5 pb-4"
        style={{
          background: `linear-gradient(135deg, ${THEME.successLight} 0%, white 100%)`,
          borderBottom: `1px solid ${THEME.success}20`,
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 12,
            top: 12,
            color: THEME.textMuted,
            "&:hover": {
              backgroundColor: `${THEME.primary}15`,
              color: THEME.primary,
            },
          }}
        >
          <Close fontSize="small" />
        </IconButton>

        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-12 h-12 rounded-full"
            style={{ backgroundColor: `${THEME.success}15` }}
          >
            <CheckCircle sx={{ color: THEME.success, fontSize: 28 }} />
          </div>
          <DialogTitle
            sx={{
              fontFamily: THEME.fontFamily,
              fontWeight: 700,
              fontSize: 20,
              color: THEME.text,
              p: 0,
            }}
          >
            Đã lưu nháp!
          </DialogTitle>
        </div>
      </div>

      {/* Content */}
      <DialogContent sx={{ px: 3, py: 3 }}>
        <p
          className="text-center text-sm leading-relaxed"
          style={{ color: THEME.textMuted, fontFamily: THEME.fontFamily }}
        >
          Bài viết của bạn đã được lưu vào bộ nhớ tạm.
          <br />
          <span style={{ color: THEME.primary, fontWeight: 600 }}>
            Nháp sẽ tự động hết hạn sau 10 phút.
          </span>
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default DraftSavedDialog;
