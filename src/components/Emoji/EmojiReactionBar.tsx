import React from 'react';

export interface EmojiReactionData {
  emoji: string;
  count: number;
  isReactedByMe: boolean;
  emojiId: number;
}

interface EmojiReactionBarProps {
  reactions: EmojiReactionData[];
  onReactionClick: (emojiId: number) => void;
  compact?: boolean;
}

/**
 * Display emoji reactions as pills with count
 */
export const EmojiReactionBar: React.FC<EmojiReactionBarProps> = React.memo(({
  reactions,
  onReactionClick,
  compact = false,
}) => {
  if (reactions.length === 0) return null;

  return (
    <div
      style={{
        display: 'inline-flex',
        flexWrap: 'wrap',
        gap: compact ? '4px' : '6px',
        alignItems: 'center',
      }}
    >
      {reactions.map((reaction) => (
        <button
          key={reaction.emojiId}
          onClick={() => onReactionClick(reaction.emojiId)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: compact ? '3px' : '4px',
            padding: compact ? '3px 8px' : '4px 10px',
            backgroundColor: reaction.isReactedByMe ? '#FFE7F0' : '#FFF8FA',
            border: `1.5px solid ${reaction.isReactedByMe ? '#F295B6' : '#FFE7F0'}`,
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            fontSize: compact ? '12px' : '14px',
            fontWeight: 600,
            color: '#4A3C42',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#FFE7F0';
            e.currentTarget.style.borderColor = '#F295B6';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = reaction.isReactedByMe
              ? '#FFE7F0'
              : '#FFF8FA';
            e.currentTarget.style.borderColor = reaction.isReactedByMe
              ? '#F295B6'
              : '#FFE7F0';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          title={`${reaction.count} người đã react`}
        >
          {/* All emojis are rendered as images (Twemoji PNG or custom uploads) */}
          <img 
            src={reaction.emoji} 
            alt="emoji" 
            loading="lazy"
            style={{ 
              width: compact ? '16px' : '18px', 
              height: compact ? '16px' : '18px',
              objectFit: 'contain'
            }}
          />
          <span style={{ fontSize: compact ? '12px' : '13px', fontWeight: 600 }}>
            {reaction.count}
          </span>
        </button>
      ))}
    </div>
  );
});

EmojiReactionBar.displayName = 'EmojiReactionBar';
