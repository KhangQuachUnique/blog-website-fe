import { EEmojiType } from "./emoji";

export interface EmojiReactSummaryDto {
  emojiId?: number;
  type: EEmojiType;
  codepoint?: string;
  emojiUrl?: string;
  totalCount: number;
  reactedByCurrentUser: boolean;
}

export interface UserReactSummaryDto {
  targetId: number;
  targetType: "post" | "comment";
  emojis: EmojiReactSummaryDto[];
  totalReactions: number;
}

export interface IToggleReactDto {
  userId: number;
  emojiId?: number;
  codepoint?: string;
  emojiUrl?: string;
  postId?: number;
  commentId?: number;
}
