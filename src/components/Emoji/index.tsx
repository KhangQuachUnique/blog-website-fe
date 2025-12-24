import { useAuthUser } from "../../hooks/useAuth";
import { useTogglePostReact } from "../../hooks/useReactions";
import type { EmojiReactSummaryDto } from "../../types/userReact";
import { EmojiReactionBar } from "../Emoji/components/EmojiReactionBar";
import { EmojiSelector } from "./components/EmojiSelector";
import { useEmojiData } from "../Emoji/hooks/useEmojiData";
import { useRecentEmojis } from "../Emoji/hooks/useRecentEmoji";
import { useToast } from "../../contexts/toast";

export interface ReactionSectionProps {
  postId: number;
  reactions: EmojiReactSummaryDto[];
}

const ReactionSection = ({ postId, reactions }: ReactionSectionProps) => {
  const { user, isAuthenticated } = useAuthUser();
  const { recent, add } = useRecentEmojis();
  const emojisData = useEmojiData();
  const mutation = useTogglePostReact();
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
    mutation.mutate(
      { emojiId, codepoint, emojiUrl, postId, userId: user.id },
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
      className={`flex items-center justify-between w-full gap-[3px] px-2 h-fit overflow-y-auto
      ${reactions.length === 0 ? "justify-end p-2" : ""}
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
