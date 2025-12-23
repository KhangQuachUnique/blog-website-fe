export type SortType = "newest" | "interactions";

export const ECommentType = {
  BLOCK: "BLOCK",
  POST: "POST",
};

export type ECommentType = (typeof ECommentType)[keyof typeof ECommentType];

export interface CommentUser {
  id: number;
  username: string;
  avatarUrl: string;
}

export interface ICommentResponse {
  id: number;
  content: string;
  type: ECommentType;
  createAt: Date;
  commenter: CommentUser;
  replyToUser?: CommentUser;
  childComments?: Omit<ICommentResponse, "childComments">[];
}

export interface ICommentsResponse {
  comments: ICommentResponse[];
  totalCount: number;
  sortBy: SortType;
}

export interface CreateCommentRequest {
  content: string;
  type: ECommentType;
  commenterId: number;
  replyToUserId?: number;
  parentCommentId?: number;
  postId?: number;
  blockId?: number;
}
