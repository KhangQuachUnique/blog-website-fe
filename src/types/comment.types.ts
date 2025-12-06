export interface User {
  id: number;
  username: string;
  avatarUrl?: string;
}

export interface ChildComment {
  id: number;
  content: string;
  createAt: string;
  commentUser: User;
  replyToUser?: User;
}

export interface Comment {
  id: number;
  content: string;
  type: 'POST' | 'BLOCK';
  createAt: string;
  commenter: User;
  childComments: ChildComment[];
  childCommentsCount: number;
}

export interface CommentsResponse {
  comments: Comment[];
  totalCount: number;
  sortBy: 'newest' | 'interactions';
}

export interface CreateCommentRequest {
  content: string;
  postId?: number;
  blockId?: number;
  type: 'POST' | 'BLOCK';
  commenterId: number;
}

export interface CreateChildCommentRequest {
  content: string;
  parentCommentId: number;
  commentUserId: number;
  replyToUserId?: number;
}

export type SortType = 'newest' | 'interactions';