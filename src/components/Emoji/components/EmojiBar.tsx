import React from "react";
import { type EmojiItem } from "../types";

interface EmojiBarProps {
  emojis: EmojiItem[];
  onSelect: (codepoint: string) => void;
}

/**
 * Horizontal emoji bar for quick selection (Discord-style)
 */
export const EmojiBar: React.FC<EmojiBarProps> = ({ emojis, onSelect }) => {
  if (emojis.length === 0) return null;

  return (
    <div
      style={{
        display: "inline-flex",
        gap: "4px",
        padding: "6px",
        backgroundColor: "#FFF8FA",
        borderRadius: "12px",
        border: "1.5px solid #FFE7F0",
        overflowX: "auto",
        scrollbarWidth: "thin",
        scrollbarColor: "#FFB8D1 #FFF8FA",
        maxWidth: "100%",
        boxShadow: "0 2px 8px rgba(242, 149, 182, 0.08)",
      }}
      className="emoji-bar"
    >
      {emojis.map((emoji) => (
        <button
          key={emoji.codepoint}
          onClick={() => onSelect(emoji.codepoint)}
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: "40px",
            height: "40px",
            padding: "6px",
            backgroundColor: "transparent",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "all 0.15s ease",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#FFE7F0";
            e.currentTarget.style.transform = "scale(1.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.transform = "scale(1)";
          }}
          title={emoji.name}
        >
          <img
            src={emoji.twemoji_url}
            alt={emoji.emoji}
            style={{
              width: "28px",
              height: "28px",
              pointerEvents: "none",
            }}
          />
        </button>
      ))}
    </div>
  );
};
