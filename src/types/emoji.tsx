import { MdEmojiEmotions } from "react-icons/md";
import { FaPerson, FaFlag, FaBowlFood, FaDog } from "react-icons/fa6";
import { FaFootballBall } from "react-icons/fa";
import { SiSymbolab } from "react-icons/si";

export const EEmojiType = {
  CUSTOM: "CUSTOM",
  UNICODE: "UNICODE",
};
export type EEmojiType = (typeof EEmojiType)[keyof typeof EEmojiType];

interface ICommunityDTO {
  id: number;
  name: string;
  thumbnailUrl?: string;
}

export interface IEmojiResponseDto {
  id?: number;
  type?: EEmojiType;
  codepoint?: string;
  emojiUrl?: string;
  twemoji_url?: string;
  communityId?: number;
  /** Flag để đánh dấu emoji bị disabled (không thuộc community của post) */
  disabled?: boolean;
}

export interface IEmojiCommunityResponseDto {
  community: ICommunityDTO;
  emojis: IEmojiResponseDto[];
}

export interface IEmojiCategoryData {
  category: string | ICommunityDTO;
  emojis: IEmojiResponseDto[];
}

export interface CategoryTab {
  key: string;
  label: string;
  icon: React.ReactNode;
}

// ============================================
// 🎨 COMMUNITY EMOJI MANAGEMENT TYPES
// ============================================

/** Request DTO để tạo emoji mới cho community */
export interface ICreateCommunityEmojiDto {
  name: string;
  emojiUrl: string;
}

/** Response DTO khi lấy danh sách emoji của một community */
export interface ICommunityEmojiResponseDto {
  id: number;
  name: string;
  emojiUrl: string;
  communityId: number;
  createdAt: string;
}

/**
 * Default category tabs (Discord-like)
 */
export const DEFAULT_CATEGORY_TABS: CategoryTab[] = [
  { key: "Smileys & Emotion", label: "Smileys", icon: <MdEmojiEmotions /> },
  { key: "People & Body", label: "People", icon: <FaPerson /> },
  { key: "Animals & Nature", label: "Nature", icon: <FaDog /> },
  { key: "Food & Drink", label: "Food", icon: <FaBowlFood /> },
  { key: "Activities", label: "Activities", icon: <FaFootballBall /> },
  { key: "Symbols", label: "Symbols", icon: <SiSymbolab /> },
  { key: "Flags", label: "Flags", icon: <FaFlag /> },
];
