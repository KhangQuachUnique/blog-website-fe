import type { EmojiReactSummaryDto } from "../../types/userReact";
import { EmojiReactionBar } from "./components/EmojiReactionBar";
import { EmojiSelector } from "./components/EmojiSelector";
import { useEmojiData } from "./hooks/useEmojiData";
import { useRecentEmojis } from "./hooks/useRecentEmoji";

export interface ReactionSectionProps {
  reactions: EmojiReactSummaryDto[];
}

const ReactionSection = ({ reactions }: ReactionSectionProps) => {
  const { recent, add } = useRecentEmojis();
  const emojisData = useEmojiData();
  console.log("emojisData", emojisData);

  return (
    <div>
      <EmojiReactionBar
        reactions={reactions}
        onReactionClick={(emojiId: number) => {}}
      />
      <EmojiSelector
        emojisData={emojisData ?? []}
        onSelect={(codepoint: string) => {
          add(codepoint);
        }}
        recentCodepoints={recent}
      />
    </div>
  );
};

export default ReactionSection;
