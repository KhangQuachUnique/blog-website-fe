import React, { useState } from "react";
import { MessageCircle } from "lucide-react";
import { ReplyForm } from "./ReplyForm";
import type { ICommentResponse } from "../../types/comment";
import { useDeleteComment } from "../../hooks/useComments";
import { useAuthUser } from "../../hooks/useAuth";
import { useToast } from "../../contexts/toast";

interface CommentItemProps {
  comment: ICommentResponse;
  postId?: number;
  blockId?: number;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  postId,
  blockId,
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replyingToChildId, setReplyingToChildId] = useState<number | null>(
    null
  );
  const { showToast } = useToast();
  const { user: currentUser } = useAuthUser();
  const { mutate: deleteComment } = useDeleteComment();
  const handleDeleteComment = () => {
    deleteComment(comment.id, {
      onSuccess: () => {
        showToast({
          message: "Bình luận đã được xóa thành công!",
          type: "success",
          duration: 3000,
        });
      },
      onError: () => {
        showToast({
          message: "Đã xảy ra lỗi khi xóa bình luận. Vui lòng thử lại.",
          type: "error",
          duration: 3000,
        });
      },
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatShortDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="comment-item border-b border-gray-200 py-4">
      {/* Comment Header */}
      <div className="flex items-start space-x-3">
        <img
          src={comment.commenter.avatarUrl || "/default-avatar.png"}
          alt={comment.commenter.username}
          className="w-10 h-10 rounded-full object-cover"
        />

        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-gray-900">
              {comment.commenter.username}
            </span>
            <span className="text-sm text-gray-500">
              {formatDate(String(comment.createAt))}
            </span>

            {/* Delete button for comment owner */}
            {currentUser?.id === comment.commenter.id && (
              <button
                className="text-red-500 hover:text-red-700 text-sm"
                onClick={handleDeleteComment}
              >
                Xóa
              </button>
            )}
          </div>

          {/* Comment Content */}
          <p className="mt-2 text-gray-700">{comment.content}</p>

          {/* Comment Actions */}
          <div className="mt-3 flex items-center space-x-4">
            {currentUser?.id && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Trả lời
              </button>
            )}

            {/* Reply count with icon */}
            {comment.childComments && comment.childComments.length > 0 && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="flex items-center gap-1 text-gray-600 hover:text-gray-800 text-sm"
              >
                <MessageCircle size={16} />
                <span>{comment.childComments?.length || 0}</span>
              </button>
            )}
          </div>

          {/* Reply Form for parent comment */}
          {showReplyForm && currentUser && currentUser.id && (
            <div className="mt-3 ml-0">
              <div className="flex items-start space-x-2">
                <img
                  src={currentUser.avatarUrl || "/default-avatar.png"}
                  alt={currentUser.username}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-1">
                  <ReplyForm
                    postId={postId}
                    blockId={blockId}
                    replyToUserId={comment.commenter.id}
                    parentCommentId={comment.id}
                    onCancel={() => setShowReplyForm(false)}
                    placeholder={`Trả lời ${comment.commenter.username}...`}
                    size="small"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Child Comments */}
          {showReplies &&
            comment.childComments &&
            comment.childComments.length > 0 && (
              <div className="mt-4 space-y-3">
                {comment.childComments.map((childComment) => {
                  const commenter = childComment.commenter ??
                    childComment.commenter ?? {
                      id: 0,
                      username: "Người dùng",
                      avatarUrl: "/default-avatar.png",
                    };
                  const repliedTo = childComment.replyToUser;

                  return (
                    <div
                      key={childComment.id}
                      className="child-comment-item ml-8"
                    >
                      <div className="flex items-start space-x-2">
                        <img
                          src={commenter.avatarUrl || "/default-avatar.png"}
                          alt={commenter.username}
                          className="w-8 h-8 rounded-full object-cover"
                        />

                        <div className="flex-1">
                          <div className="flex items-center space-x-2 flex-wrap">
                            <span className="font-medium text-gray-900 text-sm">
                              {commenter.username}
                            </span>

                            {repliedTo && (
                              <>
                                <span className="text-gray-500 text-sm">→</span>
                                <span className="font-medium text-blue-600 text-sm">
                                  {repliedTo.username}
                                </span>
                              </>
                            )}

                            <span className="text-xs text-gray-500">
                              {formatShortDate(String(childComment.createAt))}
                            </span>

                            {currentUser?.id === commenter.id && (
                              <button
                                onClick={handleDeleteComment}
                                className="text-red-500 hover:text-red-700 text-xs"
                              >
                                Xóa
                              </button>
                            )}
                          </div>

                          <p className="mt-1 text-sm text-gray-700">
                            {childComment.content}
                          </p>

                          {/* Reply button for child comments */}
                          {currentUser?.id && (
                            <div className="mt-2">
                              {replyingToChildId === childComment.id ? (
                                <div className="flex items-start space-x-2">
                                  <img
                                    src={
                                      currentUser?.avatarUrl ||
                                      "/default-avatar.png"
                                    }
                                    alt={currentUser?.username || "User"}
                                    className="w-7 h-7 rounded-full object-cover"
                                  />
                                  <div className="flex-1">
                                    <ReplyForm
                                      postId={postId}
                                      blockId={blockId}
                                      replyToUserId={childComment.commenter.id}
                                      parentCommentId={comment.id}
                                      onCancel={() =>
                                        setReplyingToChildId(null)
                                      }
                                      placeholder={`Trả lời ${commenter.username}...`}
                                      size="small"
                                    />
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={() =>
                                    setReplyingToChildId(childComment.id)
                                  }
                                  className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                                >
                                  Trả lời
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
        </div>
      </div>
    </div>
  );
};
