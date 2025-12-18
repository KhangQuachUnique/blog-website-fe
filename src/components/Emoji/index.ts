/**
 * Emoji System - Discord-style emoji picker and bar
 * 
 * Usage:
 * ```tsx
 * import { EmojiSelector } from '@/components/Emoji';
 * import emojiData from '@/assets/twemoji_valid_by_category.json';
 * 
 * function MyComponent() {
 *   const [recent, setRecent] = useState<string[]>([]);
 *   
 *   const handleEmojiSelect = (codepoint: string) => {
 *     console.log('Selected emoji:', codepoint);
 *   };
 *   
 *   return (
 *     <EmojiSelector
 *       data={emojiData}
 *       recentCodepoints={recent}
 *       onSelect={handleEmojiSelect}
 *       onRecentUpdate={setRecent}
 *     />
 *   );
 * }
 * ```
 */

export { EmojiSelector } from './EmojiSelector';
export { EmojiPicker } from './EmojiPicker';
export { EmojiBar } from './EmojiBar';
export { EmojiReactionBar } from './EmojiReactionBar';
export type { EmojiReactionData } from './EmojiReactionBar';
export * from './types';
export * from './utils';
