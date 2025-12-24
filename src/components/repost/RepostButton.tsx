import React, { useState } from "react";
import { Repeat2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import RepostModal from "./RepostModal";
import type { RepostFormData } from "./RepostModal";
import { useCreateRepost } from "../../hooks/useRepost";
import { useToast } from "../../contexts/toast";
import type { IPostResponseDto } from "../../types/post";
import { EPostType as PostTypeEnum } from "../../types/post";

// ============================================
// 🎨 THEME - Đồng bộ với design system
// ============================================
const THEME = {
  primary: "#999999",
  secondary: "#FFB8D1",
  tertiary: "#FFE7F0",
  text: "#4A3C42",
  textMuted: "#8B7B82",
  white: "#FFFFFF",
  shadowSoft: "0 2px 12px rgba(242, 149, 182, 0.15)",
};

// ============================================
// 🎯 TYPES
// ============================================
export interface RepostButtonProps {
  /** Post data để repost */
  post: IPostResponseDto;
  /** ID của user hiện tại */
  userId: number;
  /** Kích thước nút: 'sm' | 'md' | 'lg' */
  size?: "sm" | "md" | "lg";
  /** Hiển thị label text bên cạnh icon */
  showLabel?: boolean;
  /** Custom className */
  className?: string;
  /** Callback khi repost thành công */
  onSuccess?: (newPost: IPostResponseDto) => void;
  /** Callback khi repost thất bại */
  onError?: (error: Error) => void;
  /** Custom render button (cho phép tùy chỉnh hoàn toàn) */
  renderButton?: (props: {
    onClick: () => void;
    disabled: boolean;
  }) => React.ReactNode;
}

// Size configurations
const SIZE_CONFIG = {
  sm: { iconSize: 16, padding: "4px 8px", fontSize: "11px" },
  md: { iconSize: 20, padding: "6px 10px", fontSize: "12px" },
  lg: { iconSize: 24, padding: "8px 14px", fontSize: "14px" },
};

// ============================================
// 🔄 REPOST BUTTON COMPONENT
// ============================================
const RepostButton: React.FC<RepostButtonProps> = ({
  post,
  userId,
  size = "md",
  showLabel = false,
  className,
  onSuccess,
  onError,
  renderButton,
}) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [showModal, setShowModal] = useState(false);

  // Repost mutation hook
  const { mutate: createRepost, isPending: isReposting } = useCreateRepost();

  const isLoggedIn = userId > 0;

  // Không cho phép repost bài repost (chỉ repost bài gốc PERSONAL hoặc COMMUNITY)
  const canRepost = post.type !== PostTypeEnum.REPOST;

  // Handle click
  const handleClick = () => {
    if (!canRepost) {
      showToast({
        type: "info",
        message: "Không thể đăng lại bài viết này",
        duration: 2000,
      });
      return;
    }

    if (!isLoggedIn) {
      showToast({
        type: "error",
        message: "Vui lòng đăng nhập để đăng lại bài viết",
        duration: 3000,
      });
      return;
    }

    setShowModal(true);
  };

  // Handle submit
  const handleSubmit = (formData: RepostFormData) => {
    createRepost(
      {
        formData,
        originalPostId: post.id,
        authorId: userId,
      },
      {
        onSuccess: (newPost) => {
          setShowModal(false);
          showToast({
            type: "success",
            message: "Đăng lại bài viết thành công!",
            duration: 3000,
          });

          if (onSuccess) {
            onSuccess(newPost);
          } else {
            // Default behavior: navigate to new post
            if (newPost?.id) {
              navigate(`/post/${newPost.id}`);
            }
          }
        },
        onError: (error) => {
          showToast({
            type: "error",
            message: `Lỗi khi đăng lại: ${error.message}`,
            duration: 3000,
          });

          if (onError) {
            onError(error);
          }
        },
      }
    );
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const sizeConfig = SIZE_CONFIG[size];
  const isDisabled = !canRepost || isReposting;

  // Custom render support
  if (renderButton) {
    return (
      <>
        {renderButton({ onClick: handleClick, disabled: isDisabled })}
        <RepostModal
          isOpen={showModal}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          isLoading={isReposting}
          originalPost={post}
        />
      </>
    );
  }

  // Không render nút nếu không thể repost
  if (!canRepost) {
    return null;
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isDisabled}
        className={`${
          className || ""
        } flex items-center gap-4 rounded-lg transition-all duration-200 group ${
          isDisabled
            ? "cursor-not-allowed opacity-50"
            : "cursor-pointer bg-white"
        }`}
      >
        <Repeat2
          size={sizeConfig.iconSize}
          strokeWidth={2.5}
          style={{
            color: THEME.primary,
            transition: "all 0.2s ease",
          }}
          className="group-hover:translate-y-[-2px]"
        />
        {showLabel && (
          <span
            style={{
              fontSize: sizeConfig.fontSize,
              fontWeight: 600,
              color: THEME.text,
            }}
          >
            Đăng lại
          </span>
        )}
      </button>

      <RepostModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        isLoading={isReposting}
        originalPost={post}
      />
    </>
  );
};

export default RepostButton;
