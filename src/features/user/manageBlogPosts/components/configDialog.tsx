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
  Chip,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  Close,
  CloudUpload,
  Image as ImageIcon,
  Tag,
} from "@mui/icons-material";
import CustomButton from "../../../../components/button";

export interface PublishConfig {
  thumbnail: string | null;
  isPublic: boolean;
  hashtags: string[];
}

interface ConfigDialogProps {
  open: boolean;
  onClose: () => void;
  onPublish: () => void;
  confirmButtonText?: string;
  isLoading?: boolean;
  // Config values
  thumbnail: string | null;
  isPublic: boolean;
  hashtags: string[];
  imageForm?: FormData;
  // Config handlers
  onAppendImageForm?: (key: string, file: File) => void;
  onRemoveImageForm?: (key: string) => void;
  onThumbnailChange: (url: string | null) => void;
  onIsPublicChange: (value: boolean) => void;
  onAddHashtag: (tag: string) => void;
  onRemoveHashtag: (tag: string) => void;
}

const ConfigDialog: FC<ConfigDialogProps> = ({
  open,
  onClose,
  onPublish,
  confirmButtonText,
  isLoading = false,
  thumbnail,
  isPublic,
  hashtags,
  onThumbnailChange,
  onIsPublicChange,
  onAddHashtag,
  onRemoveHashtag,
  onAppendImageForm,
  onRemoveImageForm,
}) => {
  const [hashtagInput, setHashtagInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddHashtag = () => {
    const trimmed = hashtagInput.trim().replace(/^#/, "");
    if (trimmed && !hashtags.includes(trimmed)) {
      onAddHashtag(trimmed);
    }
    setHashtagInput("");
  };

  const handleHashtagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddHashtag();
    }
  };

  const handleRemoveHashtag = (tagToRemove: string) => {
    onRemoveHashtag(tagToRemove);
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onThumbnailChange(url);
      if (onAppendImageForm) {
        onAppendImageForm("thumbnail", file);
      }
    }
  };

  const handleRemoveThumbnail = () => {
    onThumbnailChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      if (onRemoveImageForm) {
        onRemoveImageForm("thumbnail");
      }
    }
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
            onChange={handleThumbnailUpload}
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
                onChange={(e) => onIsPublicChange(e.target.checked)}
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
                <p
                  className="font-medium text-gray-800"
                  style={{ fontFamily: "Quicksand, sans-serif" }}
                >
                  {isPublic ? "Công khai" : "Riêng tư"}
                </p>
                <p
                  className="text-xs text-gray-500"
                  style={{ fontFamily: "Quicksand, sans-serif" }}
                >
                  {isPublic
                    ? "Mọi người đều có thể xem bài viết này"
                    : "Chỉ bạn mới có thể xem bài viết này"}
                </p>
              </div>
            }
            sx={{
              margin: 0,
              width: "100%",
              fontFamily: "Quicksand, sans-serif",
            }}
          />
        </div>

        {/* Hashtags */}
        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-2">Hashtags</p>
          <TextField
            fullWidth
            size="small"
            placeholder="Nhập hashtag và nhấn Enter"
            value={hashtagInput}
            onChange={(e) => setHashtagInput(e.target.value)}
            onKeyDown={handleHashtagKeyDown}
            onBlur={handleAddHashtag}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Tag sx={{ color: "#9CA3AF" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                fontFamily: "Quicksand, sans-serif",
                "&:hover fieldset": {
                  borderColor: "#F295B6",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#F295B6",
                },
              },
              "& .MuiInputBase-input": {
                fontFamily: "Quicksand, sans-serif",
              },
              "& .MuiInputBase-input::placeholder": {
                fontFamily: "Quicksand, sans-serif",
              },
            }}
          />
          {hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {hashtags.map((tag) => (
                <Chip
                  key={tag}
                  label={`#${tag}`}
                  onDelete={() => handleRemoveHashtag(tag)}
                  size="small"
                  sx={{
                    backgroundColor: "#FDF2F8",
                    color: "#EC4899",
                    fontWeight: 500,
                    fontFamily: "Quicksand, sans-serif",
                    "& .MuiChip-deleteIcon": {
                      color: "#F472B6",
                      "&:hover": {
                        color: "#EC4899",
                      },
                    },
                  }}
                />
              ))}
            </div>
          )}
          <p className="text-xs text-gray-400 mt-2">
            Thêm hashtag để bài viết dễ tìm kiếm hơn
          </p>
        </div>
      </DialogContent>

      <DialogActions sx={{ padding: "16px 24px", gap: "12px" }}>
        <CustomButton
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
          style={{
            color: "#6B7280",
            border: "2px solid #E5E7EB",
            fontWeight: "600",
          }}
        >
          Hủy
        </CustomButton>
        <CustomButton
          onClick={onPublish}
          disabled={isLoading}
          style={{
            backgroundColor: isLoading ? "#D1D5DB" : "#F295B6",
            color: "white",
            fontWeight: "600",
          }}
        >
          {isLoading ? "..." : confirmButtonText || "Đăng bài"}
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};

export default ConfigDialog;
