import React, { useState } from "react";
import { useAuthUser } from "../../hooks/useAuth";
import { useToast } from "../../contexts/toast";
import { useCreateComment } from "../../hooks/useComments";
import { ECommentType } from "../../types/comment";

interface ReplyFormProps {
  replyToUserId?: number;
  parentCommentId?: number;
  postId?: number;
  blockId?: number;
  onCancel: () => void;
  placeholder?: string;
  size?: "normal" | "small";
}

export const ReplyForm: React.FC<ReplyFormProps> = ({
  replyToUserId,
  parentCommentId,
  postId,
  blockId,
  onCancel,
  placeholder = "Viết phản hồi...",
  size = "normal",
}) => {
  const [content, setContent] = useState("");

  const { user } = useAuthUser();
  const { showToast } = useToast();
  const { mutate: createComment, isPending: isSubmitting } = useCreateComment();

  const handleSubmit = async (e: React.FormEvent) => {
    if (!user) {
      showToast({
        message: "Vui lòng đăng nhập để bình luận.",
        type: "info",
        duration: 3000,
      });
      return;
    }
    const type = postId ? ECommentType.POST : ECommentType.BLOCK;
    e.preventDefault();

    const contentTrimmed = content.trim();

    createComment(
      {
        content: contentTrimmed,
        type,
        commenterId: Number(user.id),
        postId,
        blockId,
        replyToUserId,
        parentCommentId,
      },
      {
        onSuccess: () => {
          setContent("");
          showToast({
            message: "Bình luận đã được đăng thành công!",
            type: "success",
            duration: 3000,
          });
          try {
            onCancel();
          } catch (e) {
            // ignore if onCancel not provided or throws
          }
        },
        onError: () => {
          showToast({
            message: "Đã xảy ra lỗi khi đăng bình luận. Vui lòng thử lại.",
            type: "error",
            duration: 3000,
          });
        },
      }
    );
  };

  const textareaClass =
    size === "small"
      ? "w-full p-2 text-sm border border-gray-300 rounded-lg resize-none hover:border-[#F295B6] focus:border-[#F295B6] focus:ring-3 focus:ring-[#F295B6]/20 transition-all outline-none"
      : "w-full p-3 border border-gray-300 rounded-lg resize-none hover:border-[#F295B6] focus:border-[#F295B6] focus:ring-3 focus:ring-[#F295B6]/20 transition-all outline-none";

  return (
    <form onSubmit={handleSubmit} className="reply-form">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        className={textareaClass}
        rows={size === "small" ? 2 : 3}
        disabled={isSubmitting}
      />

      <div className="flex justify-end space-x-2 mt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
          disabled={isSubmitting}
        >
          Hủy
        </button>

        <button
          type="submit"
          disabled={!content.trim() || isSubmitting}
          className="px-4 py-1 text-sm bg-[#FEB2CD] text-white rounded-md hover:bg-[#F295B6] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-100"
        >
          {isSubmitting ? "Đang gửi..." : "Gửi"}
        </button>
      </div>
    </form>
  );
};
