import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Repeat2, Loader2, Hash, Upload } from "lucide-react";
import { Chip, TextField, InputAdornment } from "@mui/material";
import type { IPostResponseDto } from "../../types/post";

// ============================================
// 🎨 THEME - Đồng bộ với ReportModal và design system
// ============================================
const THEME = {
  primary: "#F295B6",
  secondary: "#FFB8D1",
  tertiary: "#FFE7F0",
  cream: "#FFF8FA",
  text: "#4A3C42",
  textMuted: "#8B7B82",
  white: "#FFFFFF",
  danger: "#E57373",
  shadowStrong: "0 8px 32px rgba(242, 149, 182, 0.25)",
};

// ============================================
// 🎯 TYPES
// ============================================
export interface RepostFormData {
  title: string;
  hashtags: string[];
  thumbnailUrl: string | null;
  thumbnailFile: File | null;
}

export interface RepostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RepostFormData) => void;
  isLoading?: boolean;
  originalPost: IPostResponseDto;
}

// ============================================
// 🔄 REPOST MODAL COMPONENT
// ============================================
const RepostModal: React.FC<RepostModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  originalPost,
}) => {
  const [title, setTitle] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle title change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (e.target.value.trim()) {
      setTitleError(null);
    }
  };

  // Handle add hashtag
  const handleAddHashtag = () => {
    const trimmed = hashtagInput.trim().replace(/^#/, "");
    if (trimmed && !hashtags.includes(trimmed)) {
      setHashtags([...hashtags, trimmed]);
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
    setHashtags(hashtags.filter((tag) => tag !== tagToRemove));
  };

  // Handle thumbnail upload
  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setThumbnailUrl(url);
      setThumbnailFile(file);
    }
  };

  const handleRemoveThumbnail = () => {
    if (thumbnailUrl) {
      URL.revokeObjectURL(thumbnailUrl);
    }
    setThumbnailUrl(null);
    setThumbnailFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle submit
  const handleSubmit = () => {
    if (!title.trim()) {
      setTitleError("Vui lòng nhập tiêu đề cho bài đăng lại");
      return;
    }

    onSubmit({
      title: title.trim(),
      hashtags,
      thumbnailUrl,
      thumbnailFile,
    });
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  // Handle close
  const handleClose = () => {
    if (!isLoading) {
      // Cleanup
      if (thumbnailUrl) {
        URL.revokeObjectURL(thumbnailUrl);
      }
      setTitle("");
      setHashtags([]);
      setHashtagInput("");
      setThumbnailUrl(null);
      setThumbnailFile(null);
      setTitleError(null);
      onClose();
    }
  };

  const modal = (
    <>
      <style>{`
        @keyframes repostModalFadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes repostModalSlideIn {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
          100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={handleBackdropClick}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(74, 60, 66, 0.5)",
          backdropFilter: "blur(4px)",
          zIndex: 1000,
          animation: "repostModalFadeIn 0.2s ease",
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          maxWidth: "500px",
          maxHeight: "90vh",
          overflow: "auto",
          background: THEME.white,
          borderRadius: "20px",
          border: `2px solid ${THEME.secondary}`,
          zIndex: 1001,
          animation:
            "repostModalSlideIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
          fontFamily: "'Quicksand', sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: `1px solid ${THEME.tertiary}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Repeat2 size={20} style={{ color: THEME.primary }} />
            <h2
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: 700,
                color: THEME.text,
              }}
            >
              Đăng lại bài viết
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "32px",
              height: "32px",
              border: "none",
              background: "transparent",
              borderRadius: "50%",
              cursor: isLoading ? "not-allowed" : "pointer",
              transition: "background 0.15s ease",
            }}
            onMouseEnter={(e) => {
              if (!isLoading) e.currentTarget.style.background = THEME.tertiary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <X size={18} style={{ color: THEME.textMuted }} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px" }}>
          {/* Original Post Preview */}
          <div
            style={{
              padding: "12px",
              background: THEME.cream,
              borderRadius: "12px",
              marginBottom: "20px",
              border: `1px solid ${THEME.tertiary}`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "8px",
              }}
            >
              <img
                src={originalPost.author.avatarUrl}
                alt={originalPost.author.username}
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
              <span
                style={{ fontSize: "13px", fontWeight: 600, color: THEME.text }}
              >
                {originalPost.author.username}
              </span>
            </div>
            <p
              style={{
                fontSize: "14px",
                color: THEME.text,
                margin: 0,
                fontWeight: 500,
              }}
            >
              {originalPost.title}
            </p>
            {originalPost.shortDescription && (
              <p
                style={{
                  fontSize: "12px",
                  color: THEME.textMuted,
                  margin: "4px 0 0",
                  lineHeight: 1.4,
                }}
              >
                {originalPost.shortDescription.length > 100
                  ? `${originalPost.shortDescription.substring(0, 100)}...`
                  : originalPost.shortDescription}
              </p>
            )}
          </div>

          {/* Title Input (Required) */}
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: 600,
                color: THEME.text,
                marginBottom: "8px",
              }}
            >
              Tiêu đề <span style={{ color: THEME.danger }}>*</span>
            </label>
            <TextField
              fullWidth
              placeholder="Nhập tiêu đề cho bài đăng lại..."
              value={title}
              onChange={handleTitleChange}
              error={!!titleError}
              helperText={titleError}
              disabled={isLoading}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  fontFamily: "'Quicksand', sans-serif",
                  "&:hover fieldset": {
                    borderColor: THEME.secondary,
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: THEME.primary,
                  },
                },
              }}
            />
          </div>

          {/* Hashtags Input (Optional) */}
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: 600,
                color: THEME.text,
                marginBottom: "8px",
              }}
            >
              Hashtags
            </label>
            <TextField
              fullWidth
              placeholder="Nhập hashtag và nhấn Enter..."
              value={hashtagInput}
              onChange={(e) => setHashtagInput(e.target.value)}
              onKeyDown={handleHashtagKeyDown}
              onBlur={handleAddHashtag}
              disabled={isLoading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Hash size={18} style={{ color: THEME.textMuted }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  fontFamily: "'Quicksand', sans-serif",
                  "&:hover fieldset": {
                    borderColor: THEME.secondary,
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: THEME.primary,
                  },
                },
              }}
            />
            {hashtags.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  marginTop: "10px",
                }}
              >
                {hashtags.map((tag) => (
                  <Chip
                    key={tag}
                    label={`#${tag}`}
                    onDelete={
                      isLoading ? undefined : () => handleRemoveHashtag(tag)
                    }
                    sx={{
                      backgroundColor: THEME.tertiary,
                      color: THEME.text,
                      fontWeight: 600,
                      fontFamily: "'Quicksand', sans-serif",
                      "& .MuiChip-deleteIcon": {
                        color: THEME.textMuted,
                        "&:hover": {
                          color: THEME.danger,
                        },
                      },
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Thumbnail Upload (Optional) */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: 600,
                color: THEME.text,
                marginBottom: "8px",
              }}
            >
              Ảnh thumbnail
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleThumbnailUpload}
              style={{ display: "none" }}
              disabled={isLoading}
            />

            {thumbnailUrl ? (
              <div
                style={{
                  position: "relative",
                  borderRadius: "12px",
                  overflow: "hidden",
                }}
              >
                <img
                  src={thumbnailUrl}
                  alt="Thumbnail preview"
                  style={{
                    width: "100%",
                    height: "150px",
                    objectFit: "cover",
                    borderRadius: "12px",
                    border: `1px solid ${THEME.tertiary}`,
                  }}
                />
                <button
                  onClick={handleRemoveThumbnail}
                  disabled={isLoading}
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    border: "none",
                    background: "rgba(255,255,255,0.9)",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  <X size={16} style={{ color: THEME.danger }} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                style={{
                  width: "100%",
                  padding: "24px",
                  border: `2px dashed ${THEME.secondary}`,
                  borderRadius: "12px",
                  background: THEME.cream,
                  cursor: isLoading ? "not-allowed" : "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.borderColor = THEME.primary;
                    e.currentTarget.style.background = THEME.tertiary;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = THEME.secondary;
                  e.currentTarget.style.background = THEME.cream;
                }}
              >
                <Upload size={24} style={{ color: THEME.primary }} />
                <span
                  style={{
                    fontSize: "13px",
                    color: THEME.textMuted,
                    fontWeight: 500,
                  }}
                >
                  Nhấn để tải lên ảnh thumbnail (tùy chọn)
                </span>
              </button>
            )}
            <p
              style={{
                fontSize: "12px",
                color: THEME.textMuted,
                marginTop: "6px",
              }}
            >
              Nếu không chọn, sẽ sử dụng thumbnail của bài viết gốc
            </p>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            padding: "16px 20px",
            borderTop: `1px solid ${THEME.tertiary}`,
          }}
        >
          <button
            onClick={handleClose}
            disabled={isLoading}
            style={{
              padding: "10px 20px",
              border: `1.5px solid ${THEME.secondary}`,
              borderRadius: "12px",
              background: THEME.white,
              color: THEME.text,
              fontSize: "14px",
              fontWeight: 600,
              cursor: isLoading ? "not-allowed" : "pointer",
              fontFamily: "'Quicksand', sans-serif",
              transition: "all 0.2s ease",
              opacity: isLoading ? 0.5 : 1,
            }}
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            style={{
              padding: "10px 24px",
              border: "none",
              borderRadius: "12px",
              background: isLoading ? THEME.secondary : THEME.primary,
              color: THEME.white,
              fontSize: "14px",
              fontWeight: 600,
              cursor: isLoading ? "not-allowed" : "pointer",
              fontFamily: "'Quicksand', sans-serif",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s ease",
            }}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <Repeat2 size={16} />
                Đăng lại
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );

  return createPortal(modal, document.body);
};

export default RepostModal;
