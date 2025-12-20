import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { createPortal } from "react-dom";

import { EmojiPicker } from "../../Emoji/components/EmojiPicker";
import type { IEmojiCategoryData } from "../../../types/emoji";
import { useClickOutside } from "../../Emoji/hooks/useClickOutside";
import { BsEmojiWinkFill } from "react-icons/bs";

interface EmojiSelectorProps {
  emojisData: IEmojiCategoryData[];
  recentCodepoints?: string[];
  onToggleReact: ({
    emojiId,
    codepoint,
  }: {
    emojiId?: number;
    codepoint?: string;
  }) => void;
  onRecentUpdate?: (codepoint: string) => void;
}

/**
 * Complete emoji selector system with picker and quick bar
 */
export const EmojiSelector: React.FC<EmojiSelectorProps> = ({
  emojisData,
  recentCodepoints,
  onToggleReact,
  onRecentUpdate,
}) => {
  const recentEmojis = useMemo(() => {
    if (recentCodepoints && recentCodepoints.length > 0) {
      return emojisData
        .flatMap((category) => category.emojis)
        .filter((emoji) => {
          return (
            emoji.type === "UNICODE" &&
            !!emoji.codepoint &&
            recentCodepoints.includes(emoji.codepoint)
          );
        });
    }
    return [];
  }, [recentCodepoints, emojisData]);

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerPosition, setPickerPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [isPositionReady, setIsPositionReady] = useState(false);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  const closePicker = useCallback(() => {
    setIsPickerOpen(false);
    setPickerPosition(null);
    setIsPositionReady(false);
  }, []);

  // Close picker on outside click
  useClickOutside([buttonRef, pickerRef], closePicker);

  const handleSelect = ({
    emojiId,
    codepoint,
  }: {
    emojiId?: number;
    codepoint?: string;
  }) => {
    onToggleReact({ emojiId, codepoint });

    if (codepoint) {
      onRecentUpdate?.(codepoint);
    }

    // Close picker
    setIsPickerOpen(false);
    setIsPositionReady(false);
  };

  const handleTogglePicker = () => {
    if (isPickerOpen) {
      setIsPickerOpen(false);
      setIsPositionReady(false);
    } else {
      // Calculate position BEFORE opening
      const pos = updatePickerPosition();
      if (pos) {
        setPickerPosition(pos);
        setIsPositionReady(true);
        setIsPickerOpen(true);
      }
    }
  };

  const updatePickerPosition = useCallback(() => {
    if (!buttonRef.current) return null;

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const pickerWidth = 428; // EmojiPicker width
    const pickerHeight = 444; // EmojiPicker height

    const horizontalGap = 12;
    const sidePadding = 16;

    let top: number;
    let left: number;

    // Try to position on the right first
    left = buttonRect.right + horizontalGap;
    const hasSpaceOnRight =
      left + pickerWidth + sidePadding <= window.innerWidth;

    if (!hasSpaceOnRight) {
      // If not enough space on right, try left
      left = buttonRect.left - pickerWidth - horizontalGap;
      const hasSpaceOnLeft = left >= sidePadding;

      if (!hasSpaceOnLeft) {
        // If neither side works, center below
        left = buttonRect.left + buttonRect.width / 2 - pickerWidth / 2;
        if (left < sidePadding) left = sidePadding;
        const maxLeft = window.innerWidth - pickerWidth - sidePadding;
        if (left > maxLeft) left = Math.max(sidePadding, maxLeft);
      }
    }

    // Vertical alignment - align top with button
    top = buttonRect.top;
    const maxTop = window.innerHeight - pickerHeight - sidePadding;
    if (top > maxTop) top = Math.max(sidePadding, maxTop);
    if (top < sidePadding) top = sidePadding;

    return { top, left };
  }, []);

  useEffect(() => {
    let animationFrameId: number | null = null;

    // Update position on scroll and resize
    const updatePosition = () => {
      if (animationFrameId !== null) return;

      animationFrameId = requestAnimationFrame(() => {
        const newPos = updatePickerPosition();
        if (newPos) setPickerPosition(newPos);
        animationFrameId = null;
      });
    };

    window.addEventListener("scroll", updatePosition, true); // Use capture phase
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isPickerOpen, updatePickerPosition]);

  return (
    <div
      style={{
        position: "relative",
        display: "inline-flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      {/* Open Picker Button */}
      <button
        ref={buttonRef}
        onClick={handleTogglePicker}
        className={`
          group flex items-center justify-center rounded-lg border transition-all duration-150 cursor-pointer
          px-2 py-1 
          ${
            isPickerOpen
              ? "bg-[#FFE7F0] border-[#FEB2CD] scale-105"
              : "bg-transparent border-gray-300"
          }
          hover:bg-[#FFE7F0] hover:border-[#FEB2CD] hover:filter-none hover:opacity-100
          hover:scale-105
        `}
      >
        <BsEmojiWinkFill
          size={20}
          className={`
            transition-all duration-150
            ${
              isPickerOpen
                ? "text-[#D24463] scale-150 translate-y-[-8px]"
                : "text-gray-400"
            }
            group-hover:text-[#D24463] group-hover:scale-150 group-hover:translate-y-[-5px]
          `}
        />
      </button>

      {/* Emoji Picker Popup */}
      {isPickerOpen &&
        pickerPosition &&
        createPortal(
          <div
            ref={pickerRef}
            style={{
              position: "fixed",
              zIndex: 999999,
              top: pickerPosition.top,
              left: pickerPosition.left,
              opacity: isPositionReady ? 1 : 0,
              transition: "opacity 0.1s ease",
            }}
          >
            <EmojiPicker
              emojisData={emojisData}
              recent={recentEmojis}
              onSelect={handleSelect}
              onClose={() => setIsPickerOpen(false)}
            />
          </div>,
          document.body
        )}
    </div>
  );
};
