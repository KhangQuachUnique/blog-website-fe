import { useMemo } from "react";
import { useAuthUser } from "../../hooks/useAuth";
import {
  useToggleCommentReact,
  useTogglePostReact,
} from "../../hooks/useReactions";
import type { EmojiReactSummaryDto } from "../../types/userReact";
import { EmojiReactionBar } from "../Emoji/components/EmojiReactionBar";
import { EmojiSelector } from "./components/EmojiSelector";
import { useEmojiData } from "../Emoji/hooks/useEmojiData";
import { useRecentEmojis } from "../Emoji/hooks/useRecentEmoji";
import { useToast } from "../../contexts/toast";

export interface ReactionSectionProps {
  type?: "post" | "comment";
  postId?: number;
  blockId?: number;
  commentId?: number;
  reactions: EmojiReactSummaryDto[];
  /** Community ID để lọc custom emoji (chỉ cho phép dùng emoji của community này) */
  communityId?: number;
}

const ReactionSection = ({
  type = "post",
  postId,
  blockId,
  commentId,
  reactions,
  communityId,
}: ReactionSectionProps) => {
  const { user, isAuthenticated } = useAuthUser();
  const { recent, add } = useRecentEmojis();
  const allEmojisData = useEmojiData();
  const postMutation = useTogglePostReact();
  const commentMutation = useToggleCommentReact();
  const { showToast } = useToast();

  // Lọc emoji data:
  // - Unicode emoji: luôn hiển thị và cho phép click
  // - Custom emoji: chỉ hiển thị của community này (nếu có communityId)
  const filteredEmojisData = useMemo(() => {
    if (!allEmojisData) return [];

    return allEmojisData.map((categoryData) => {
      // Nếu là Unicode category (category là string)
      if (typeof categoryData.category === "string") {
        return categoryData; // Giữ nguyên
      }

      // Nếu là Custom emoji category (category là ICommunityDTO)
      const community = categoryData.category;

      // Nếu không có communityId (bài viết cá nhân), không hiển thị custom emoji
      if (!communityId) {
        return {
          ...categoryData,
          emojis: categoryData.emojis.map((e) => ({
            ...e,
            disabled: true, // Đánh dấu disabled
          })),
        };
      }

      // Nếu có communityId, chỉ enable emoji của community đó
      const isAllowed = community.id === communityId;
      return {
        ...categoryData,
        emojis: categoryData.emojis.map((e) => ({
          ...e,
          disabled: !isAllowed, // Disable nếu không phải community này
        })),
      };
    });
  }, [allEmojisData, communityId]);

  const handleToggleReact = ({
    emojiId,
    codepoint,
    emojiUrl,
  }: {
    emojiId?: number;
    codepoint?: string;
    emojiUrl?: string;
  }) => {
    if (!isAuthenticated || !user) {
      showToast({
        message: "Bạn cần đăng nhập để thả cảm xúc!",
        type: "info",
      });
      return;
    }
    const mutation = type === "post" ? postMutation : commentMutation;
    mutation.mutate(
      {
        emojiId,
        codepoint,
        emojiUrl,
        postId,
        blockId,
        commentId,
        userId: user.id,
      },
      {
        onSuccess: () => {
          // Cập nhật recent nếu là unicode
          if (codepoint) {
            add(codepoint);
          }
        },
      }
    );
  };

  return (
    <div
      className={`flex items-center justify-between w-full gap-[3px] h-fit overflow-y-auto
      ${reactions.length === 0 ? "justify-end" : ""}
    `}
    >
      <EmojiReactionBar
        reactions={reactions}
        onReactionClick={handleToggleReact}
      />
      <EmojiSelector
        emojisData={filteredEmojisData ?? []}
        onToggleReact={handleToggleReact}
        recentCodepoints={recent}
        onRecentUpdate={add}
        communityId={communityId}
      />
    </div>
  );
};

export default ReactionSection;
