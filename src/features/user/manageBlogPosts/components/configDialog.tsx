import { useState, useRef } from "react";
import type { FC } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  IconButton,
} from "@mui/material";
import { Close, CloudUpload, Image as ImageIcon } from "@mui/icons-material";
import CustomButton from "../../../../components/button";

interface ConfigDialogProps {
  open: boolean;
  onClose: () => void;
  onPublish: (config: PublishConfig) => void;
  postTitle: string;
}

export interface PublishConfig {
  thumbnail: string | null;
  isPublic: boolean;
}

const ConfigDialog: FC<ConfigDialogProps> = ({ open, onClose, onPublish }) => {
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnail(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveThumbnail = () => {
    setThumbnail(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePublish = () => {
    onPublish({
      thumbnail,
      isPublic,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          padding: "8px",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "Quicksand, sans-serif",
          fontWeight: 700,
        }}
      >
        Tùy chỉnh bài viết
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {/* Thumbnail Upload */}
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-2">Ảnh bìa (Thumbnail)</p>
          <input
            type="file"
            accept="image/*"
            onChange={handleThumbnailChange}
            ref={fileInputRef}
            className="hidden"
            id="thumbnail-upload"
          />

          {thumbnail ? (
            <div className="relative rounded-lg overflow-hidden border-2 border-dashed border-gray-300">
              <img
                src={thumbnail}
                alt="Thumbnail preview"
                className="w-full h-48 object-cover"
              />
              <button
                onClick={handleRemoveThumbnail}
                className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full p-1 transition-all"
              >
                <Close fontSize="small" />
              </button>
            </div>
          ) : (
            <label
              htmlFor="thumbnail-upload"
              className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-pink-400 hover:bg-pink-50 transition-all"
            >
              <ImageIcon sx={{ fontSize: 48, color: "#9CA3AF" }} />
              <div className="flex items-center gap-2 mt-2 text-gray-500">
                <CloudUpload fontSize="small" />
                <span>Tải ảnh bìa lên</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                PNG, JPG (Tối đa 5MB)
              </p>
            </label>
          )}
        </div>

        {/* Visibility Toggle */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <FormControlLabel
            control={
              <Switch
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": {
                    color: "#F295B6",
                  },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: "#F295B6",
                  },
                }}
              />
            }
            label={
              <div>
                <p className="font-medium text-gray-800">
                  {isPublic ? "Công khai" : "Riêng tư"}
                </p>
                <p className="text-xs text-gray-500">
                  {isPublic
                    ? "Mọi người đều có thể xem bài viết này"
                    : "Chỉ bạn mới có thể xem bài viết này"}
                </p>
              </div>
            }
            sx={{ margin: 0, width: "100%" }}
          />
        </div>
      </DialogContent>

      <DialogActions sx={{ padding: "16px 24px", gap: "12px" }}>
        <CustomButton
          variant="outline"
          onClick={onClose}
          style={{
            color: "#6B7280",
            border: "2px solid #E5E7EB",
            fontWeight: "600",
          }}
        >
          Hủy
        </CustomButton>
        <CustomButton
          onClick={handlePublish}
          style={{
            backgroundColor: "#F295B6",
            color: "white",
            fontWeight: "600",
          }}
        >
          Đăng bài
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};

export default ConfigDialog;
