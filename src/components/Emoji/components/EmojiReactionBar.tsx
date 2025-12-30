import React from "react";
import type { EmojiReactSummaryDto } from "../../../types/userReact";
import { getTwemojiUrl } from "../../Emoji/utils/twemoji";

interface EmojiReactionBarProps {
  reactions: EmojiReactSummaryDto[];
  onReactionClick: ({
    emojiId,
    codepoint,
  }: {
    emojiId?: number;
    codepoint?: string;
  }) => void;
}

/**
 * Display emoji reactions as pills with count
 */
export const EmojiReactionBar: React.FC<EmojiReactionBarProps> = React.memo(
  ({ reactions, onReactionClick }) => {
    if (reactions.length === 0) return null;

    const getEmojiSrc = (reaction: EmojiReactSummaryDto): string => {
      if (reaction.type === "CUSTOM" && reaction.emojiUrl) {
        return reaction.emojiUrl;
      } else if (reaction.type === "UNICODE" && reaction.codepoint) {
        return getTwemojiUrl(reaction.codepoint, "72x72");
      }
      return "";
    };

    return (
      <div
        className="
          inline-flex flex-wrap items-center gap-1.5 py-2
          max-h-[82px] overflow-y-auto
        "
      >
        <style>
          {`
            div::-webkit-scrollbar {
              width: 3px;
              height: 3px;
            }
            div::-webkit-scrollbar-thumb {
              background-color: #FFE4EC;
              border-radius: 6px;
            }
            div::-webkit-scrollbar-track {
              background-color: #FFF8FA;
              border-radius: 6px;
            }
          `}
        </style>
        {reactions.map((reaction) => (
          <button
            key={reaction.emojiId}
            onClick={() => {
              onReactionClick({
                emojiId: reaction.emojiId,
                codepoint: reaction.codepoint,
              });
            }}
            className={`
              inline-flex items-center rounded-lg font-semibold cursor-pointer transition-all duration-150
              px-2 py-1 gap-[7px] border-1 border-transparent
              ${reaction.reactedByCurrentUser ? "bg-[#FFECF7]" : "bg-[#F2F2F2]"}
              text-[#4A3C42]
              hover:bg-[#FFE7F0] hover:border-1 hover:border-[#F295B6] hover:translate-y-[-2px]
            `}
            title={`${reaction.totalCount} người đã react`}
          >
            {/* All emojis are rendered as images (Twemoji PNG or custom uploads) */}
            <img
              src={getEmojiSrc(reaction)}
              alt="emoji"
              style={{
                width: "20px",
                height: "20px",
                objectFit: "contain",
              }}
            />
            <span className="text-sm">{reaction.totalCount}</span>
          </button>
        ))}
      </div>
    );
  }
);
