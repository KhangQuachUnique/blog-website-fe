import React, { useState } from "react";
import { MessageCircle } from "lucide-react";
import { ReplyForm } from "./ReplyForm";
import type { ICommentResponse } from "../../types/comment";
import { useDeleteComment } from "../../hooks/useComments";
import { useAuthUser } from "../../hooks/useAuth";
import { useToast } from "../../contexts/toast";
import { stringAvatar } from "../../utils/avatarHelper";
import { Avatar } from "@mui/material";
import { useNavigate } from "react-router-dom";

import { FaArrowRightLong } from "react-icons/fa6";
import ReactionSection from "../Emoji";

interface CommentItemProps {
  comment: ICommentResponse;
  postId?: number;
  blockId?: number;
  /** Community ID để lọc emoji reaction */
  communityId?: number;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  postId,
  blockId,
  communityId,
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replyingToChildId, setReplyingToChildId] = useState<number | null>(
    null
  );
  const navigate = useNavigate();
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
    const now = new Date();

    // same calendar day -> show time only
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    // same year -> show day and month
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString("vi-VN", {
        day: "numeric",
        month: "short",
      });
    }

    // different year -> show day month year
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatShortDate = (dateStr: string) => {
    // Short variant: same as formatDate but prefer time when same day
    return formatDate(dateStr);
  };

  return (
    <div className="border-b border-gray-200 py-4">
      {/* Comment Header */}
      <div className="flex items-start space-x-3">
        {comment.commenter.avatarUrl ? (
          <img
            src={comment.commenter.avatarUrl}
            alt={comment.commenter.username}
            className="w-10 h-10 rounded-full object-cover"
            onClick={() => navigate(`/profile/${comment.commenter.id}`)}
            style={{ cursor: "pointer" }}
          />
        ) : (
          <div
            onClick={() => navigate(`/profile/${comment.commenter.id}`)}
            style={{ cursor: "pointer" }}
          >
            <Avatar
              {...stringAvatar(
                comment.commenter.username,
                40,
                "1rem",
                "",
                "none"
              )}
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 min-w-0">
            <span className="font-medium text-gray-800 pr-3 truncate max-w-[180px]">
              {comment.commenter.username}
            </span>
            <span className="text-xs text-gray-400 flex-shrink-0">
              {formatDate(String(comment.createAt))}
            </span>

            {/* Delete button for comment owner */}
            {currentUser?.id === comment.commenter.id && (
              <button
                className="ml-auto inline-flex items-center gap-2 px-3 py-1 text-sm font-semibold text-[#BA2243] border border-[#FEC6D1] bg-transparent rounded-full hover:bg-[#BA2243] hover:text-white transition-transform duration-150 transform hover:-translate-y-0.5"
                onClick={handleDeleteComment}
                aria-label="Xóa bình luận"
              >
                Xóa
              </button>
            )}
          </div>

          {/* Comment Content */}
          <p className="mt-2 text-sm text-gray-800">{comment.content}</p>

          <ReactionSection
            type="comment"
            commentId={comment.id}
            postId={postId}
            blockId={blockId}
            reactions={comment.reacts?.emojis || []}
            communityId={communityId}
          />

          {/* Comment Actions */}
          <div className="mt-3 flex items-center space-x-4">
            {currentUser?.id && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="text-[#BA2243] hover:-translate-y-0.5 text-sm font-semibold transition-all duration-100"
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
            <div className="mt-3">
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
                      className="p-[16px] rounded-md border-l-3 bg-[#FAFAFA] border-gray-200"
                    >
                      <div className="flex items-start space-x-1">
                        {childComment.commenter.avatarUrl ? (
                          <img
                            src={childComment.commenter.avatarUrl}
                            alt={childComment.commenter.username}
                            className="w-10 h-10 rounded-full object-cover"
                            onClick={() =>
                              navigate(`/profile/${childComment.commenter.id}`)
                            }
                            style={{ cursor: "pointer" }}
                          />
                        ) : (
                          <div
                            onClick={() =>
                              navigate(`/profile/${childComment.commenter.id}`)
                            }
                            style={{ cursor: "pointer" }}
                          >
                            <Avatar
                              {...stringAvatar(
                                childComment.commenter.username,
                                40,
                                "1rem",
                                "",
                                "none"
                              )}
                            />
                          </div>
                        )}

                        <div className="flex-1 pl-2 min-w-0">
                          <div className="flex items-center space-x-3 min-w-0">
                            <span className="font-medium text-gray-700 text-sm truncate max-w-[140px]">
                              {commenter.username}
                            </span>

                            {repliedTo && (
                              <>
                                <span className="text-gray-500 text-md">
                                  <FaArrowRightLong size={12} color="#6B7280" />
                                </span>
                                <span className="font-medium text-gray-700 text-sm truncate max-w-[140px]">
                                  {repliedTo.username}
                                </span>
                              </>
                            )}

                            <span className="text-xs text-gray-400 flex-shrink-0">
                              {formatShortDate(String(childComment.createAt))}
                            </span>

                            {currentUser?.id === commenter.id && (
                              <button
                                className="ml-auto inline-flex items-center gap-2 px-3 py-1 text-sm font-semibold text-[#BA2243] border border-[#FEC6D1] bg-transparent rounded-full hover:bg-[#BA2243] hover:text-white transition-transform duration-150 transform hover:-translate-y-0.5"
                                onClick={handleDeleteComment}
                                aria-label="Xóa bình luận"
                              >
                                Xóa
                              </button>
                            )}
                          </div>

                          <p className="mt-1 text-md text-gray-800">
                            {childComment.content}
                          </p>

                          {/* Reply button for child comments */}
                          {currentUser?.id && (
                            <div className="mt-2">
                              {replyingToChildId === childComment.id ? (
                                <div>
                                  <ReplyForm
                                    postId={postId}
                                    blockId={blockId}
                                    replyToUserId={childComment.commenter.id}
                                    parentCommentId={comment.id}
                                    onCancel={() => setReplyingToChildId(null)}
                                    placeholder={`Trả lời ${commenter.username}...`}
                                    size="small"
                                  />
                                </div>
                              ) : (
                                <button
                                  onClick={() =>
                                    setReplyingToChildId(childComment.id)
                                  }
                                  className="text-[#BA2243] hover:-translate-y-0.5 text-sm font-semibold transition-all duration-100"
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
