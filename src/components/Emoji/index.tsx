import { useAuthUser } from "../../hooks/useAuth";
import { useTogglePostReact } from "../../hooks/useReactions";
import type { EmojiReactSummaryDto } from "../../types/userReact";
import { EmojiReactionBar } from "../Emoji/components/EmojiReactionBar";
import { EmojiSelector } from "./components/EmojiSelector";
import { useEmojiData } from "../Emoji/hooks/useEmojiData";
import { useRecentEmojis } from "../Emoji/hooks/useRecentEmoji";

export interface ReactionSectionProps {
  postId: number;
  reactions: EmojiReactSummaryDto[];
}

const ReactionSection = ({ postId, reactions }: ReactionSectionProps) => {
  const { user, isAuthenticated } = useAuthUser();
  const { recent, add } = useRecentEmojis();
  const emojisData = useEmojiData();
  console.log("Emoji data:", emojisData);
  const mutation = useTogglePostReact();

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleToggleReact = ({
    emojiId,
    codepoint,
    emojiUrl,
  }: {
    emojiId?: number;
    codepoint?: string;
    emojiUrl?: string;
  }) => {
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
