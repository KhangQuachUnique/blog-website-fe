import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { EmojiPicker } from './EmojiPicker';
import type { EmojiCategoryData, EmojiItem } from './types';
import { useClickOutside } from './hooks/useClickOutside';
import { getRecentEmojis } from './utils';
import { useAuth } from '../../contexts/AuthContext';
import { useCustomEmojis } from '../../hooks/useCustomEmojis';
import { convertCustomEmojisToCategories, mergeEmojiCategories } from './utils/customEmojiConverter';

interface EmojiSelectorProps {
  data: EmojiCategoryData;
  recentCodepoints?: string[];
  quickAccess?: EmojiItem[];
  onSelect: (codepoint: string) => void;
  onRecentUpdate?: (codepoints: string[]) => void;
  position?: 'top' | 'bottom';
  compact?: boolean;
}

/**
 * Complete emoji selector system with picker and quick bar
 */
export const EmojiSelector: React.FC<EmojiSelectorProps> = ({
  data,
  recentCodepoints = [],
  quickAccess,
  onSelect,
  onRecentUpdate,
  position = 'bottom',
  compact = false,
}) => {
  const { user } = useAuth();
  const { emojis: customEmojis, isLoading: loadingCustomEmojis } = useCustomEmojis(user?.id);
  
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [recentEmojis, setRecentEmojis] = useState<EmojiItem[]>([]);
  const [pickerPosition, setPickerPosition] = useState<{ top: number; left: number } | null>(null);
  const [isPositionReady, setIsPositionReady] = useState(false);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Merge unicode emojis with custom community emojis
  const allEmojiData = useMemo(() => {
    if (!customEmojis || customEmojis.length === 0) {
      return data;
    }

    const customCategories = convertCustomEmojisToCategories(customEmojis);
    const merged = mergeEmojiCategories(data, customCategories);
    
    return merged;
  }, [data, customEmojis]);

  // Load recent emojis
  useEffect(() => {
    if (recentCodepoints.length > 0) {
      const emojis = getRecentEmojis(recentCodepoints, allEmojiData);
      setRecentEmojis(emojis);
    }
  }, [recentCodepoints, allEmojiData]);

  // Close picker on outside click
  useClickOutside([buttonRef, pickerRef], () => {
    if (isPickerOpen) {
      setIsPickerOpen(false);
      setIsPositionReady(false);
    }
  });

  const handleSelect = (codepoint: string) => {
    onSelect(codepoint);

    // Update recent emojis
    const updatedRecent = [
      codepoint,
      ...recentCodepoints.filter((c) => c !== codepoint),
    ].slice(0, 20);

    onRecentUpdate?.(updatedRecent);

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
    const hasSpaceOnRight = left + pickerWidth + sidePadding <= window.innerWidth;

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
    if (!isPickerOpen) {
      setPickerPosition(null);
      setIsPositionReady(false);
      return;
    }

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

    window.addEventListener('scroll', updatePosition, true); // Use capture phase
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isPickerOpen, updatePickerPosition]);

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 100,
      }}
    >

      {/* Open Picker Button */}
      <button
        ref={buttonRef}
        onClick={handleTogglePicker}
        style={{
          width: compact ? '28px' : '40px',
          height: compact ? '28px' : '40px',
          backgroundColor: isPickerOpen ? '#FFE7F0' : 'transparent',
          border: '1.5px solid #FFE7F0',
          borderRadius: '8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: compact ? '18px' : '24px',
          transition: 'all 0.15s ease',
          filter: isPickerOpen ? 'grayscale(0%)' : 'grayscale(100%)',
          opacity: isPickerOpen ? 1 : 0.5,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#FFE7F0';
          e.currentTarget.style.borderColor = '#F295B6';
          e.currentTarget.style.filter = 'grayscale(0%)';
          e.currentTarget.style.opacity = '1';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = isPickerOpen ? '#FFE7F0' : 'transparent';
          e.currentTarget.style.borderColor = '#FFE7F0';
          if (!isPickerOpen) {
            e.currentTarget.style.filter = 'grayscale(100%)';
            e.currentTarget.style.opacity = '0.5';
          }
        }}
        title="Chọn emoji 💕"
      >
        👻
      </button>

      {/* Emoji Picker Popup */}
      {isPickerOpen && pickerPosition && (
        <div
          ref={pickerRef}
          style={{
            position: 'fixed',
            zIndex: 999999,
            top: pickerPosition.top,
            left: pickerPosition.left,
            opacity: isPositionReady ? 1 : 0,
            transition: 'opacity 0.1s ease',
          }}
        >
          <EmojiPicker
            data={allEmojiData}
            recent={recentEmojis}
            onSelect={handleSelect}
            onClose={() => setIsPickerOpen(false)}
          />
          {loadingCustomEmojis && (
            <div style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              fontSize: '12px',
              color: '#8B7B82',
              backgroundColor: '#FFF8FA',
              padding: '4px 8px',
              borderRadius: '4px',
              pointerEvents: 'none',
            }}>
              Loading custom emojis...
            </div>
          )}
        </div>
      )}
    </div>
  );
};
