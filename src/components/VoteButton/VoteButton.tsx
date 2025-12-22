import React, { useState } from "react";
import { useVote } from "../../hooks/useVote";
import type { VoteButtonProps, VoteType } from "../../types/vote.types";
import UpvoteIcon from "./UpvoteIcon";
import DownvoteIcon from "./DownvoteIcon";

// ============================================
// THEME
// ============================================
const THEME = {
  primary: "#F295B6",
  secondary: "#E8BCC8",
  tertiary: "#FFF0F5",
  white: "#FFFFFF",
  text: "#4A4A4A",
  upvoteActive: "#E8779F",
  downvoteActive: "#9B8A90",
  shadowSoft: "0 2px 12px rgba(242, 149, 182, 0.15)",
};

// ============================================
// SIZE CONFIGURATIONS
// ============================================
const SIZE_CONFIG = {
  sm: {
    iconSize: 16,
    fontSize: "11px",
    padding: "2px 4px",
    buttonSize: "24px",
    minWidth: "24px",
  },
  md: {
    iconSize: 18,
    fontSize: "13px",
    padding: "3px 5px",
    buttonSize: "28px",
    minWidth: "28px",
  },
  lg: {
    iconSize: 20,
    fontSize: "14px",
    padding: "4px 6px",
    buttonSize: "32px",
    minWidth: "32px",
  },
};

// ============================================
// VOTE BUTTON COMPONENT
// ============================================
interface VoteButtonInternalProps {
  direction: "up" | "down";
  active: boolean;
  disabled: boolean;
  onClick: () => void;
  size: "sm" | "md" | "lg";
}

const VoteButtonInternal: React.FC<VoteButtonInternalProps> = ({
  direction,
  active,
  disabled,
  onClick,
  size,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const config = SIZE_CONFIG[size];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50px",
        background: "transparent",
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      {direction === "up" ? (
        <div className="hover:scale-110 transition-transform">
          <UpvoteIcon active={active} size={25} />
        </div>
      ) : (
        <div className="hover:scale-110 transition-transform">
          <DownvoteIcon active={active} size={25} />
        </div>
      )}
    </button>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
/**
 * VoteButton Component - Reusable vote button with optimistic updates
 *
 * @example
 * // Using vote from post response (recommended)
 * <VoteButton
 *   postId={1}
 *   userId={123}
 *   vote={post.vote}
 * />
 *
 * @example
 * // With fallback values
 * <VoteButton
 *   postId={1}
 *   userId={123}
 *   initialUpVotes={10}
 *   initialDownVotes={2}
 * />
 */
const VoteButton: React.FC<VoteButtonProps> = ({
  postId,
  userId,
  votes,
  size = "md",
  showCount = true,
}) => {
  const config = SIZE_CONFIG[size];

  // React Query mutation hook
  const voteMutation = useVote(userId, postId);

  const handleVote = (voteType: VoteType) => {
    if (voteMutation.isPending) return;
    voteMutation.mutate(voteType, {});
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "1px",
        background: "transparent",
      }}
    >
      <VoteButtonInternal
        direction="up"
        active={votes?.userVote === "upvote"}
        disabled={voteMutation.isPending}
        onClick={() => handleVote("upvote")}
        size={size}
      />

      {showCount && (
        <span
          style={{
            minWidth: config.minWidth,
            textAlign: "center",
            fontSize: 16,
            fontWeight: 600,
            color:
              votes?.userVote === "upvote"
                ? THEME.upvoteActive
                : votes?.userVote === "downvote"
                ? "#64585cff"
                : THEME.text,
            fontFamily: "'Quicksand', sans-serif",
            userSelect: "none",
            transition: "color 0.2s ease",
          }}
        >
          {votes ? votes.upvotes - votes.downvotes : 0}
        </span>
      )}

      <VoteButtonInternal
        direction="down"
        active={votes?.userVote === "downvote"}
        disabled={voteMutation.isPending}
        onClick={() => handleVote("downvote")}
        size={size}
      />
    </div>
  );
};

export default VoteButton;
