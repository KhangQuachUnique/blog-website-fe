// src/components/NewsfeedList.tsx
import Card from '../card/Card';
import type  { PostItem } from '../../types/post';
import { Loader2 } from 'lucide-react';


interface Props {
  posts: PostItem[];
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  loadMoreRef?: (node: HTMLDivElement) => void;
}

const NewsfeedList = ({ posts, isFetchingNextPage, loadMoreRef }: Props) => {
  return (
    <div className="space-y-6">
      {posts.map((post, index) => (
        <div key={post.id} ref={index === posts.length - 1 ? loadMoreRef : null}>
          <Card post={post} />
        </div>
      ))}
      {isFetchingNextPage && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}
    </div>
  );
};

export default NewsfeedList;