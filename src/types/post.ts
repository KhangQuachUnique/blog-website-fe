// types/post.ts
export interface PostAuthor {
  username: string;
  avatarUrl: string;
}

export interface PostItem {
  id: string;
  title: string;
  thumbnailUrl: string;
  upVotes: number;
  downVotes: number;
  createdAt: string;
  author: PostAuthor;
  community: string | null;
  score: number;
  totalReacts: number;
  totalComments: number;
}

export interface NewsfeedResponse {
  status: string;
  statusCode: number;
  data: {
    items: PostItem[];
    pagination: {
      hasMore: boolean;
      nextCursor: string | null;
    };
  };
}