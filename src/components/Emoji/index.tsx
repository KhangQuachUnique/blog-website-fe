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
}

const ReactionSection = ({
  type = "post",
  postId,
  blockId,
  commentId,
  reactions,
}: ReactionSectionProps) => {
  const { user, isAuthenticated } = useAuthUser();
  const { recent, add } = useRecentEmojis();
  const emojisData = useEmojiData();
  const postMutation = useTogglePostReact();
  const commentMutation = useToggleCommentReact();
  const { showToast } = useToast();

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
        emojisData={emojisData ?? []}
        onToggleReact={handleToggleReact}
        recentCodepoints={recent}
        onRecentUpdate={add}
      />
    </div>
  );
};

export default ReactionSection;
