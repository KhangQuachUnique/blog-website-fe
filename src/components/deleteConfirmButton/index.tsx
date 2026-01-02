import {
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import { Trash2, AlertTriangle } from "lucide-react";
import CustomButton from "../button";

interface DeleteConfirmDialogProps {
  /** Control dialog visibility from parent */
  open: boolean;
  /** Callback when dialog should close */
  onClose: () => void;
  /** Callback when user confirms deletion */
  onConfirm: () => void;
  /** Dialog title */
  title?: string;
  /** Dialog description/warning message */
  description?: string;
}

/**
 * Delete Confirmation Dialog Component
 * Hiển thị dialog xác nhận xóa với UI đẹp
 * Sử dụng controlled mode (phải truyền open và onClose)
 */
const DeleteConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = "Xác nhận xóa?",
  description,
}: DeleteConfirmDialogProps) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: "hidden",
          maxWidth: 420,
          width: "90%",
          bgcolor: "white",
          border: "3px solid #F295B6",
        },
      }}
      sx={{
        fontFamily: "Quicksand, Mona Sans, Open Sans, Outfit, sans-serif",
      }}
    >
      <div className="bg-white">
        {/* Icon Header */}
        <div className="flex justify-center pt-6 pb-3">
          <div className="w-14 h-14 rounded-full border-2 border-red-500 flex items-center justify-center">
            <AlertTriangle
              size={28}
              className="text-red-500"
              strokeWidth={2.5}
            />
          </div>
        </div>

        {/* Title */}
        <DialogTitle
          sx={{
            fontFamily: "Quicksand, Mona Sans, Open Sans, Outfit, sans-serif",
            fontWeight: "700",
            fontSize: 22,
            textAlign: "center",
            color: "#dc2626",
            py: 1,
            px: 3,
          }}
        >
          {title}
        </DialogTitle>

        {/* Description */}
        {description && (
          <DialogContent sx={{ px: 3, py: 1.5 }}>
            <p className="text-center text-gray-600 text-sm leading-relaxed">
              {description}
            </p>
          </DialogContent>
        )}

        {/* Actions */}
        <DialogActions
          sx={{
            px: 3,
            pb: 3,
            pt: 2.5,
            gap: 2,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <CustomButton
            onClick={onClose}
            variant="outline"
            style={{
              minWidth: "110px",
              borderColor: "#ef4444",
              color: "#ef4444",
            }}
          >
            Hủy
          </CustomButton>
          <CustomButton
            onClick={handleConfirm}
            variant="default"
            className="flex items-center justify-center gap-2"
            style={{
              minWidth: "110px",
              backgroundColor: "#ef4444",
            }}
          >
            <Trash2 size={16} strokeWidth={2.5} />
            Xóa
          </CustomButton>
        </DialogActions>
      </div>
    </Dialog>
  );
};

export default DeleteConfirmDialog;
