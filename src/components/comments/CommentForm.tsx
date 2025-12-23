import React, { useState } from "react";
import { useCreateComment } from "../../hooks/useComments";
import { useToast } from "../../contexts/toast";
import { ECommentType } from "../../types/comment";
import { useAuthUser } from "../../hooks/useAuth";

interface CommentFormProps {
  postId?: number;
  blockId?: number;
  placeholder?: string;
}

export const CommentForm: React.FC<CommentFormProps> = ({
  postId,
  blockId,
  placeholder = "Viết bình luận...",
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
      },
      {
        onSuccess: () => {
          setContent("");
          showToast({
            message: "Bình luận đã được đăng thành công!",
            type: "success",
            duration: 3000,
          });
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

  return (
    <div className="comment-form bg-white">
      <div className="flex items-start space-x-3">
        <div className="flex-1">
          <form onSubmit={handleSubmit}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={placeholder}
              className="w-full p-3 border border-gray-300 rounded-lg resize-none hover:border-[#F295B6] focus:border-[#F295B6] focus:ring-3 focus:ring-[#F295B6]/20 transition-all outline-none"
              rows={3}
              disabled={isSubmitting}
            />

            <div className="flex justify-between items-center mt-3">
              <button
                type="submit"
                disabled={!content.trim() || isSubmitting}
                className="px-6 py-2 bg-[#FEB2CD] text-white font-semibold rounded-md 
                  hover:bg-[#F295B6] disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-100"
              >
                {isSubmitting ? "..." : "Gửi"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
