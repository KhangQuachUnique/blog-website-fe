// src/components/NewsfeedList.tsx
import Card from "../card/Card";
import type { IPostResponseDto } from "../../types/post";
import Masonry from "react-masonry-css";
import "../../styles/newsfeed/NewsfeedList.css";

interface Props {
  posts: IPostResponseDto[];
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
              key={post.id}
              className="newsfeed-masonry-item"
              ref={isLast ? (loadMoreRef as any) : undefined}
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
