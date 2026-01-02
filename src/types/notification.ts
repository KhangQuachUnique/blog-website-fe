// ============== Notification Types ==============
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

export type ENotificationType =
  (typeof ENotificationType)[keyof typeof ENotificationType];

// ============== Notification Params (matching BE) ==============
export interface UserVotedPostParam {
  postId: number;
}

export interface UserCommentedPostParam {
  postId: number;
  commentId: number;
}

export interface UserReactedPostParam {
  postId: number;
  emojiId: string;
}

export interface UserSharedPostParam {
  postId: number;
}

export interface UserLikedCommentParam {
  commentId: number;
}

export interface UserRepliedCommentParam {
  commentId: number;
}

export interface UserFollowedUserParam {
  followedUserId: number;
}

export interface CustomNotificationParam {
  [key: string]: unknown;
}

// ============== Notification Param Map ==============
export interface NotificationParamMap {
  [ENotificationType.USER_VOTED_POST]: UserVotedPostParam;
  [ENotificationType.USER_COMMENTED_POST]: UserCommentedPostParam;
  [ENotificationType.USER_REACTED_POST]: UserReactedPostParam;
  [ENotificationType.USER_SHARED_POST]: UserSharedPostParam;
  [ENotificationType.USER_LIKED_COMMENT]: UserLikedCommentParam;
  [ENotificationType.USER_REPLIED_COMMENT]: UserRepliedCommentParam;
  [ENotificationType.USER_FOLLOWED_USER]: UserFollowedUserParam;
  [ENotificationType.CUSTOM]: CustomNotificationParam;
}

// Union type for all notification params
export type NotificationParams =
  | UserVotedPostParam
  | UserCommentedPostParam
  | UserReactedPostParam
  | UserSharedPostParam
  | UserLikedCommentParam
  | UserRepliedCommentParam
  | UserFollowedUserParam
  | CustomNotificationParam;

// ============== Related DTOs ==============
export interface NotificationTemplate {
  id: number;
  type: ENotificationType;
  title: string;
  message: string;
}

export interface SenderInfo {
  id: number;
  username: string;
  avatarUrl: string | null;
}

// ============== Main Response DTO ==============
export interface NotificationResponseDto {
  id: number;
  isRead: boolean;
  createdAt: Date;
  type: ENotificationType;
  params: NotificationParams;
  sender: SenderInfo;
  template: NotificationTemplate;
}

// ============== Type Guards ==============
export const isUserVotedPostParam = (
  params: NotificationParams
): params is UserVotedPostParam => {
  return (
    "postId" in params && !("commentId" in params) && !("emojiId" in params)
  );
};

export const isUserCommentedPostParam = (
  params: NotificationParams
): params is UserCommentedPostParam => {
  return "postId" in params && "commentId" in params;
};

export const isUserReactedPostParam = (
  params: NotificationParams
): params is UserReactedPostParam => {
  return "postId" in params && "emojiId" in params;
};

export const isUserSharedPostParam = (
  params: NotificationParams
): params is UserSharedPostParam => {
  return (
    "postId" in params && !("commentId" in params) && !("emojiId" in params)
  );
};

export const isUserLikedCommentParam = (
  params: NotificationParams
): params is UserLikedCommentParam => {
  return "commentId" in params && !("postId" in params);
};

export const isUserRepliedCommentParam = (
  params: NotificationParams
): params is UserRepliedCommentParam => {
  return "commentId" in params && !("postId" in params);
};

export const isUserFollowedUserParam = (
  params: NotificationParams
): params is UserFollowedUserParam => {
  return "followedUserId" in params;
};

// ============== Helper Functions ==============
/**
 * Get the navigation URL for a notification based on its type
 */
export const getNotificationNavigationUrl = (
  notification: NotificationResponseDto
): string | null => {
  const { type, params, sender } = notification;

  switch (type) {
    case ENotificationType.USER_VOTED_POST:
    case ENotificationType.USER_REACTED_POST:
    case ENotificationType.USER_SHARED_POST:
      return "postId" in params ? `/post/${params.postId}` : null;

    case ENotificationType.USER_COMMENTED_POST:
      if ("postId" in params && "commentId" in params) {
        return `/post/${params.postId}?commentId=${params.commentId}`;
      }
      return null;

    case ENotificationType.USER_LIKED_COMMENT:
    case ENotificationType.USER_REPLIED_COMMENT:
      // Comment notifications - could navigate to the comment
      // For now, navigate to the sender's profile or return null
      return null;

    case ENotificationType.USER_FOLLOWED_USER:
      return `/user/profile/${sender.id}`;

    case ENotificationType.CUSTOM:
    default:
      return null;
  }
};
