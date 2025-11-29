import { useState } from "react";
import { Dialog, DialogActions, DialogTitle, Button } from "@mui/material";
import { IoMdTrash } from "react-icons/io";

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
            <Button
              onClick={handleClose}
              variant="outlined"
              sx={{
                fontFamily:
                  "Quicksand, Mona Sans, Open Sans, Outfit, sans-serif",
                fontWeight: "700",
                fontSize: 16,
                color: "#8c1d35",
                display: "flex",
                width: "100px",
                alignItems: "center",
                justifyItems: "center",
                borderRadius: 2,
                textTransform: "none",
                py: 1,
                border: "2px solid",
                borderColor: "#8c1d35",
                bgcolor: "#fff",
                transition: "all 0.1s ease-in-out",
                "&:hover": {
                  borderColor: "rgba(140, 29, 53, 0.9)",
                  color: "rgba(140, 29, 53, 0.9)",
                  transform: "translateY(-1px)",
                },
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={() => {
                onConfirm();
                handleClose();
              }}
              variant="contained"
              sx={{
                fontFamily:
                  "Quicksand, Mona Sans, Open Sans, Outfit, sans-serif",
                fontWeight: "600",
                fontSize: 16,
                display: "flex",
                alignItems: "center",
                justifyItems: "center",
                borderRadius: 2,
                textTransform: "none",
                width: "100px",
                py: 1,
                bgcolor: "#8c1d35",
                boxShadow: "none",
                transition: "all 0.1s ease-in-out",
                "&:hover": {
                  bgcolor: "rgba(140, 29, 53, 0.9)",
                  boxShadow: "none",
                  transform: "translateY(-1px)",
                },
              }}
              startIcon={<IoMdTrash />}
            >
              Xóa
            </Button>
          </DialogActions>
        </div>
      </Dialog>
    </div>
  );
};

export default DeleteConfirmButton;
