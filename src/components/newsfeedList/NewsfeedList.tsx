// src/components/NewsfeedList.tsx
import Card from "../card/Card";
import type { INewsfeedItemDto } from "../../types/newsfeed";
import Masonry from "react-masonry-css";
import "../../styles/newsfeed/NewsfeedList.css";

interface Props {
  posts: INewsfeedItemDto[];
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  loadMoreRef?: (node: HTMLDivElement | null) => void;
}

// NewsfeedList.tsx using react-masonry-css
const NewsfeedList = ({ posts, loadMoreRef }: Props) => {
  const breakpointCols = {
    default: 1,
  };

  return (
    <div className="newsfeed-list-wrapper">
      <Masonry
        breakpointCols={breakpointCols}
        className="newsfeed-masonry-grid"
        columnClassName="newsfeed-masonry-grid_column"
      >
        {posts.map((post, idx) => {
          const isLast = idx === posts.length - 1;
          return (
            <div
              key={`${post.id}-${idx}`}
              className="newsfeed-masonry-item"
              ref={isLast ? loadMoreRef : undefined}
            >
              <Card post={post} />
            </div>
          );
        })}
      </Masonry>

      {/* sentinel is attached to the last item via ref in the map above */}
    </div>
  );
};

export default NewsfeedList;
