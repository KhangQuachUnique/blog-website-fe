import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
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

    const [hoveredReaction, setHoveredReaction] = useState<EmojiReactSummaryDto | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
    const buttonRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

    useEffect(() => {
      if (hoveredReaction) {
        const button = buttonRefs.current.get(hoveredReaction.emojiId!);
        if (button) {
          const rect = button.getBoundingClientRect();
          setTooltipPosition({
            top: rect.top - 8, // 8px above button
            left: rect.left + rect.width / 2, // center of button
          });
        }
      }
    }, [hoveredReaction]);

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
            ref={(el) => {
              if (el && reaction.emojiId) {
                buttonRefs.current.set(reaction.emojiId, el);
              }
            }}
            onMouseEnter={() => setHoveredReaction(reaction)}
            onMouseLeave={() => setHoveredReaction(null)}
            onClick={() => {
              onReactionClick({
                emojiId: reaction.emojiId,
                codepoint: reaction.codepoint,
              });
            }}
            className={`
              inline-flex items-center rounded-lg font-semibold cursor-pointer transition-all duration-150
              px-2 py-1 gap-[7px] border-1 border-transparent relative
              ${reaction.reactedByCurrentUser ? "bg-[#FFECF7]" : "bg-[#F2F2F2]"}
              text-[#4A3C42]
              hover:bg-[#FFE7F0] hover:border-1 hover:border-[#F295B6] hover:translate-y-[-2px]
            `}
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
        
        {/* Tooltip rendered via Portal at document body */}
        {hoveredReaction && createPortal(
          <div
            style={{
              position: "fixed",
              top: `${tooltipPosition.top}px`,
              left: `${tooltipPosition.left}px`,
              transform: "translate(-50%, -100%)",
              zIndex: 9999,
              pointerEvents: "none",
            }}
          >
            <div
              className="px-3 py-2 bg-[#4A3C42] text-white text-xs font-bold rounded-lg whitespace-nowrap transition-opacity duration-200"
              style={{
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              }}
            >
              <span className="text-[#F295B6]">{hoveredReaction.name}</span>
              
              {/* Arrow */}
              <div
                className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
                style={{
                  borderLeft: "6px solid transparent",
                  borderRight: "6px solid transparent",
                  borderTop: "6px solid #4A3C42",
                }}
              />
            </div>
          </div>,
          document.body
        )}
      </div>
    );
  }
);
