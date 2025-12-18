import { Dialog, DialogActions, DialogTitle, DialogContent, IconButton } from "@mui/material";
import { Close, ErrorOutline } from "@mui/icons-material";
import CustomButton from "../../../../components/button";

export interface ValidationError {
  field: string;
  message: string;
}

interface ValidationDialogProps {
  open: boolean;
  onClose: () => void;
  errors: ValidationError[];
  title?: string;
}

// Theme colors matching the website
const THEME = {
  primary: "#f295b6",
  primaryDark: "#e07a9e",
  primaryLight: "#fce4ec",
  text: "#4A3C42",
  textMuted: "#6b7280",
  error: "#ef4444",
  fontFamily: "Quicksand, Mona Sans, Open Sans, Outfit, sans-serif",
};

const ValidationDialog = ({
  open,
  onClose,
  errors,
  title = "Thiếu thông tin bắt buộc",
}: ValidationDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 0,
          overflow: "hidden",
          width: 440,
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
          background: `linear-gradient(135deg, ${THEME.primaryLight} 0%, white 100%)`,
          borderBottom: `1px solid ${THEME.primary}20`,
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
            style={{ backgroundColor: `${THEME.error}15` }}
          >
            <ErrorOutline sx={{ color: THEME.error, fontSize: 28 }} />
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
            {title}
          </DialogTitle>
        </div>
      </div>

      {/* Content */}
      <DialogContent sx={{ px: 3, py: 3 }}>
        <p
          className="text-sm mb-4"
          style={{ color: THEME.textMuted, fontFamily: THEME.fontFamily }}
        >
          Vui lòng điền đầy đủ các thông tin sau trước khi tiếp tục:
        </p>
        <ul className="space-y-3">
          {errors.map((error, index) => (
            <li
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg"
              style={{
                backgroundColor: `${THEME.error}08`,
                border: `1px solid ${THEME.error}20`,
              }}
            >
              <div
                className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                style={{ backgroundColor: THEME.error }}
              />
              <div>
                <span
                  className="font-semibold text-sm"
                  style={{ color: THEME.text }}
                >
                  {error.field}
                </span>
                <p
                  className="text-sm mt-0.5"
                  style={{ color: THEME.textMuted }}
                >
                  {error.message}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </DialogContent>

      {/* Actions */}
      <DialogActions
        sx={{
          px: 3,
          py: 2.5,
          borderTop: `1px solid ${THEME.primary}15`,
          backgroundColor: "#fafafa",
        }}
      >
        <CustomButton
          onClick={onClose}
          variant="default"
          style={{
            backgroundColor: THEME.primary,
            color: "white",
            fontWeight: 600,
            padding: "10px 28px",
            borderRadius: 8,
            fontFamily: THEME.fontFamily,
          }}
        >
          Đã hiểu
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};

export default ValidationDialog;
