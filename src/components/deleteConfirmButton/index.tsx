import { useState } from "react";
import { Dialog, DialogActions, DialogTitle } from "@mui/material";
import { IoMdTrash } from "react-icons/io";
import CustomButton from "../button";

interface DeleteConfirmButtonProps {
  title?: string;
  onConfirm: () => void;
  style?: React.CSSProperties;
  buttonIcon?: boolean;
  buttonText?: string;
  className?: string;
}

const DeleteConfirmButton = ({
  title,
  onConfirm,
  style,
  buttonIcon = true,
  buttonText,
  className,
}: DeleteConfirmButtonProps) => {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div style={style} className={className}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleClickOpen();
        }}
        className={
          "flex gap-2 items-center p-2 bg-[#BA2243]/80 rounded-md hover:bg-[#BA2243] transition-all duration-50" +
          (className ? ` ${className}` : "")
        }
      >
        {buttonText && <span>{buttonText}</span>}
        {buttonIcon && <IoMdTrash fontSize="24px" color="white" />}
      </button>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            p: 0,
            overflow: "hidden",
            width: 380,
            bgcolor: "white",
          },
        }}
        sx={{
          fontFamily: "Quicksand, Mona Sans, Open Sans, Outfit, sans-serif",
        }}
      >
        <div className="py-5 bg-white">
          <DialogTitle
            sx={{
              fontFamily: "Quicksand, Mona Sans, Open Sans, Outfit, sans-serif",
              fontWeight: "800",
              fontSize: 23,
              textAlign: "center",
              color: "#4A3C42",
              py: 3,
            }}
          >
            {title ? title : "Xác nhận xóa?"}
          </DialogTitle>
          <DialogActions
            sx={{
              px: 0,
              py: 1,
              gap: 2,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <CustomButton onClick={handleClose} variant="outline" title="Hủy" />
            <CustomButton
              onClick={() => {
                onConfirm();
                handleClose();
              }}
              variant="default"
              title="Xóa"
              className="flex items-center justify-center gap-2"
              style={{ width: "100px" }}
            />
          </DialogActions>
        </div>
      </Dialog>
    </div>
  );
};

export default DeleteConfirmButton;
