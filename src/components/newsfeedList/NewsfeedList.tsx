// src/components/NewsfeedList.tsx
import Card from '../card/Card';
import type  { PostItem } from '../../types/post';
import { Loader2 } from 'lucide-react';
import Masonry from 'react-masonry-css';
import '../../styles/newsfeed/NewsfeedList.css';

interface Props {
  posts: PostItem[];
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  loadMoreRef?: (node: HTMLDivElement | null) => void;
}

// NewsfeedList.tsx using react-masonry-css
const NewsfeedList = ({ posts, loadMoreRef }: Props) => {
  const breakpointCols = {
    default:1
  };

  return (
    <div className="newsfeed-list-wrapper">
      <Masonry
        breakpointCols={breakpointCols}
        className="newsfeed-masonry-grid"
        columnClassName="newsfeed-masonry-grid_column"
      >
        {posts.map((post) => (
          <div key={post.id} className="newsfeed-masonry-item">
            <Card post={post} />
          </div>
        ))}
      </Masonry>

      {/* sentinel for infinite scroll */}
      <div ref={loadMoreRef as any} />
    </div>
  );
};

export default NewsfeedList;