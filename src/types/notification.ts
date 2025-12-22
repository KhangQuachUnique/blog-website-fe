export const ENotificationType = {
  USER_VOTED_POST: "USER_VOTED_POST",
  USER_COMMENTED_POST: "USER_COMMENTED_POST",
  USER_REACTED_POST: "USER_REACTED_POST",
  USER_SHARED_POST: "USER_SHARED_POST",

  USER_LIKED_COMMENT: "USER_LIKED_COMMENT",
  USER_REPLIED_COMMENT: "USER_REPLIED_COMMENT",

  USER_FOLLOWED_USER: "USER_FOLLOWED_USER",

  CUSTOM: "CUSTOM",
} as const;

export interface NotificationTemplate {
  id: number;
  type: ENotificationType;
  title: string;
  message: string;
}

export type ENotificationType =
  (typeof ENotificationType)[keyof typeof ENotificationType];

export interface SenderInfo {
  id: number;
  username: string;
  avatarUrl: string | null;
}

export interface NotificationResponseDto {
  id: number;
  isRead: boolean;
  createdAt: Date;
  type: ENotificationType;
  params: Record<string, string | number>;
  sender: SenderInfo;
  template: NotificationTemplate;
}
