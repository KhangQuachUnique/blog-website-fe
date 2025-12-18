import { Dialog, DialogActions, DialogTitle, DialogContent, IconButton } from "@mui/material";
import { Close, WarningAmber, Save, ExitToApp, Edit } from "@mui/icons-material";
import CustomButton from "../../../../components/button";

interface UnsavedChangesDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirmLeave: () => void;
  onSaveDraft: () => void;
}

// Theme colors matching the website
const THEME = {
  primary: "#f295b6",
  primaryDark: "#e07a9e",
  primaryLight: "#fce4ec",
  text: "#4A3C42",
  textMuted: "#6b7280",
  warning: "#f59e0b",
  warningLight: "#fef3c7",
  success: "#22c55e",
  danger: "#ef4444",
  fontFamily: "Quicksand, Mona Sans, Open Sans, Outfit, sans-serif",
};

const UnsavedChangesDialog = ({
  open,
  onClose,
  onConfirmLeave,
  onSaveDraft,
}: UnsavedChangesDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 0,
          overflow: "hidden",
          width: 480,
          bgcolor: "white",
          boxShadow: "0 25px 50px -12px rgba(242, 149, 182, 0.25)",
        },
      }}
      sx={{
        fontFamily: THEME.fontFamily,
        "& .MuiBackdrop-root": {
          backgroundColor: "rgba(74, 60, 66, 0.4)",
        },
      }}
    >
      {/* Header with gradient */}
      <div
        className="relative px-6 pt-5 pb-4"
        style={{
          background: `linear-gradient(135deg, ${THEME.warningLight} 0%, white 100%)`,
          borderBottom: `1px solid ${THEME.warning}20`,
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
            style={{ backgroundColor: `${THEME.warning}15` }}
          >
            <WarningAmber sx={{ color: THEME.warning, fontSize: 28 }} />
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
            Bạn có thay đổi chưa lưu
          </DialogTitle>
        </div>
      </div>

      {/* Content */}
      <DialogContent sx={{ px: 3, py: 3 }}>
        <p
          className="text-center text-sm leading-relaxed"
          style={{ color: THEME.textMuted, fontFamily: THEME.fontFamily }}
        >
          Nếu bạn rời đi, những thay đổi chưa lưu sẽ bị mất.
          <br />
          Bạn có muốn lưu nháp trước khi rời đi không?
        </p>
      </DialogContent>

      {/* Actions */}
      <DialogActions
        sx={{
          px: 3,
          py: 2.5,
          gap: 1.5,
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          borderTop: `1px solid ${THEME.primary}15`,
          backgroundColor: "#fafafa",
        }}
      >
        <CustomButton
          onClick={onClose}
          variant="outline"
          style={{
            borderColor: THEME.primary,
            color: THEME.primary,
            fontWeight: 600,
            padding: "10px 20px",
            borderRadius: 8,
            fontFamily: THEME.fontFamily,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Edit sx={{ fontSize: 18 }} />
          Tiếp tục chỉnh sửa
        </CustomButton>
        <CustomButton
          onClick={onSaveDraft}
          variant="outline"
          style={{
            borderColor: THEME.success,
            color: THEME.success,
            fontWeight: 600,
            padding: "10px 20px",
            borderRadius: 8,
            fontFamily: THEME.fontFamily,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Save sx={{ fontSize: 18 }} />
          Lưu nháp
        </CustomButton>
        <CustomButton
          onClick={onConfirmLeave}
          variant="default"
          style={{
            backgroundColor: THEME.danger,
            color: "white",
            fontWeight: 600,
            padding: "10px 20px",
            borderRadius: 8,
            fontFamily: THEME.fontFamily,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <ExitToApp sx={{ fontSize: 18 }} />
          Rời đi
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};

export default UnsavedChangesDialog;
