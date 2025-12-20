import {
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
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
          border: `1px solid rgba(242, 149, 182, 0.5)`,
          boxShadow: "0 25px 50px -12px rgba(242, 149, 182, 0.39)",
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
      <div className="relative px-6 pt-3 pb-2 bg-red-50 border-b border-red-200 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100">
            <ErrorOutline sx={{ color: THEME.error, fontSize: 20 }} />
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

        <IconButton onClick={onClose} className="hover:bg-[#FFECF7]">
          <Close fontSize="small" />
        </IconButton>
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
              className="flex items-center gap-3 p-3 rounded-lg"
              style={{
                backgroundColor: `${THEME.error}08`,
                border: `1px solid ${THEME.error}20`,
              }}
            >
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
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
          py: 2,
          px: 3,
          borderTop: `1px solid ${THEME.primary}15`,
        }}
      >
        <CustomButton
          onClick={onClose}
          variant="default"
          style={{
            backgroundColor: THEME.primary,
            color: "white",
            width: "fit-content",
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
