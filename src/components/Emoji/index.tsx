import type { EmojiReactSummaryDto } from "../../types/userReact";
import { EmojiReactionBar } from "./components/EmojiReactionBar";
import { EmojiSelector } from "./components/EmojiSelector";
import { useEmojiData } from "./hooks/useEmojiData";
import { useRecentEmojis } from "./hooks/useRecentEmoji";

export interface ReactionSectionProps {
  reactions: EmojiReactSummaryDto[];
  handleToggleReact: ({
    emojiId,
    codepoint,
  }: {
    emojiId?: number;
    codepoint?: string;
  }) => void;
}

const ReactionSection = ({
  reactions,
  handleToggleReact,
}: ReactionSectionProps) => {
  const { recent, add } = useRecentEmojis();
  const emojisData = useEmojiData();

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
