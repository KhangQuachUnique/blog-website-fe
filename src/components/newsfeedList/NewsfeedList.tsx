// src/components/NewsfeedList.tsx
import Card from '../card/Card';
import type  { PostItem } from '../../types/post';
import { Loader2 } from 'lucide-react';
import '../../styles/newsfeed/NewsfeedList.css';

interface Props {
  posts: PostItem[];
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  loadMoreRef?: (node: HTMLDivElement) => void;
}

// NewsfeedList.tsx
const NewsfeedList = ({ posts, loadMoreRef }: Props) => {
  return (
    <div className="newsfeed-list justify-start" ref={loadMoreRef}>
  {posts.map((post) => (
    <Card key={post.id} post={post} />
  ))}
</div>

  );
};


export default NewsfeedList;