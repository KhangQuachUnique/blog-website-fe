import { useRef, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useSearch } from "../../hooks/useSearch";
import type {
  IUserSearchDto,
  ICommunitySearchDto,
  ISearchResponseDto,
} from "../../services/search.service";
import { Loader2 } from "lucide-react";
import Masonry from "react-masonry-css";
import Card from "../../components/card/Card";
import type { IPostResponseDto } from "../../types/post";
import "../../styles/newsfeed/NewsfeedList.css";
import "../../styles/newsfeed/Card.css";

export const SearchResultPage = () => {
  const [searchParams] = useSearchParams();

  // Lấy params từ URL (ví dụ: /search?q=abc&type=post)
  const q = searchParams.get("q") || "";
  const type = searchParams.get("type") || "";

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useSearch({ keyword: q, type, enabled: !!q && !!type });

  // Flatten all pages into a single array based on type and deduplicate
  const getResults = () => {
    if (!data?.pages) return { posts: [], users: [], communities: [] };

    const allPosts: IPostResponseDto[] = [];
    const allUsers: IUserSearchDto[] = [];
    const allCommunities: ICommunitySearchDto[] = [];

    data.pages.forEach((page: ISearchResponseDto) => {
      page.items.forEach((item) => {
        // Check what type of item this is based on its properties
        if ("title" in item && "author" in item) {
          // This is a post
          const post = item as IPostResponseDto;
          if (!allPosts.find((p) => p.id === post.id)) {
            allPosts.push(post);
          }
        } else if ("username" in item && !("name" in item)) {
          // This is a user
          const user = item as IUserSearchDto;
          if (!allUsers.find((u) => u.id === user.id)) {
            allUsers.push(user);
          }
        } else if ("name" in item) {
          // This is a community
          const community = item as ICommunitySearchDto;
          if (!allCommunities.find((c) => c.id === community.id)) {
            allCommunities.push(community);
          }
        }
      });
    });

    return { posts: allPosts, users: allUsers, communities: allCommunities };
  };

  const { posts, users, communities } = getResults();

  // Infinite scroll observer
  const observer = useRef<IntersectionObserver | null>(null);
  const lastItemRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isFetchingNextPage) return;
      if (observer.current) observer.current.disconnect();

      if (node) {
        observer.current = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting && hasNextPage) {
            fetchNextPage();
          }
        });
        observer.current.observe(node);
      }
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return "vừa xong";
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  const breakpointCols = {
    default: 1,
  };

  // Render User Card
  const renderUserCard = (user: IUserSearchDto) => (
    <Link to={`/profile/${user.id}`} className="block">
      <article className="newsfeed-card hover:shadow-lg transition-shadow cursor-pointer">
        {user.avatarUrl && (
          <div className="newsfeed-card__thumbnail">
            <img
              src={user.avatarUrl}
              alt={user.username}
              className="newsfeed-card__image"
              loading="lazy"
            />
          </div>
        )}
        <div className="newsfeed-card__right">
          <div className="newsfeed-card__content">
            <h2 className="newsfeed-card__title">{user.username}</h2>
            <div className="newsfeed-card__header">
              <div className="newsfeed-card__author">
                <img
                  src={user.avatarUrl || "https://via.placeholder.com/40"}
                  alt={user.username}
                  className="newsfeed-card__avatar"
                />
                <div className="newsfeed-card__author-info">
                  <span className="newsfeed-card__username">
                    @{user.username}
                  </span>
                </div>
              </div>
            </div>
            {user.bio && (
              <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                {user.bio}
              </p>
            )}
            <span className="text-blue-500 text-sm hover:underline mt-2">
              Xem trang cá nhân
            </span>
          </div>
        </div>
      </article>
    </Link>
  );

  // Render Community Card
  const renderCommunityCard = (community: ICommunitySearchDto) => (
    <Link to={`/community/${community.id}`} className="block">
      <article className="newsfeed-card hover:shadow-lg transition-shadow cursor-pointer">
        {community.thumbnailUrl && (
          <div className="newsfeed-card__thumbnail">
            <img
              src={community.thumbnailUrl}
              alt={community.name}
              className="newsfeed-card__image"
              loading="lazy"
            />
          </div>
        )}
        <div className="newsfeed-card__right">
          <div className="newsfeed-card__content">
            <h2 className="newsfeed-card__title">{community.name}</h2>
            <div className="newsfeed-card__header">
              <div className="newsfeed-card__author">
                <img
                  src={
                    community.thumbnailUrl || "https://via.placeholder.com/40"
                  }
                  alt={community.name}
                  className="newsfeed-card__avatar"
                />
                <div className="newsfeed-card__author-info">
                  <span className="newsfeed-card__username">
                    Cộng đồng · {community.memberCount} thành viên
                  </span>
                </div>
              </div>
              {community.createdAt && (
                <time className="newsfeed-card__time">
                  {formatDate(community.createdAt)}
                </time>
              )}
            </div>
            {community.description && (
              <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                {community.description}
              </p>
            )}
            <span className="text-blue-500 text-sm hover:underline mt-2">
              Tham gia ngay
            </span>
          </div>
        </div>
      </article>
    </Link>
  );

  // Render Post Card
  const renderPostCard = (post: IPostResponseDto) => <Card post={post} />;

  const getTypeLabel = () => {
    switch (type) {
      case "post":
        return "Bài viết";
      case "user":
        return "Người dùng";
      case "community":
        return "Cộng đồng";
      case "hashtag":
        return "Hashtag";
      default:
        return type;
    }
  };

  // Get total results count based on search type
  const getTotalResults = () => {
    switch (type) {
      case "user":
        return users.length;
      case "community":
        return communities.length;
      case "post":
      case "hashtag":
      default:
        return posts.length;
    }
  };

  const totalResults = getTotalResults();

  // Render content based on search type
  const renderResults = () => {
    switch (type) {
      case "user":
        return users.map((user, idx) => {
          const isLast = idx === users.length - 1;
          return (
            <div
              key={user.id}
              className="newsfeed-masonry-item"
              ref={isLast ? lastItemRef : undefined}
            >
              {renderUserCard(user)}
            </div>
          );
        });
      case "community":
        return communities.map((community, idx) => {
          const isLast = idx === communities.length - 1;
          return (
            <div
              key={community.id}
              className="newsfeed-masonry-item"
              ref={isLast ? lastItemRef : undefined}
            >
              {renderCommunityCard(community)}
            </div>
          );
        });
      case "post":
      case "hashtag":
      default:
        return posts.map((post, idx) => {
          const isLast = idx === posts.length - 1;
          return (
            <div
              key={post.id}
              className="newsfeed-masonry-item"
              ref={isLast ? lastItemRef : undefined}
            >
              {renderPostCard(post)}
            </div>
          );
        });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-20 text-red-500">
        <p className="text-xl">Có lỗi xảy ra khi tìm kiếm.</p>
        <p className="mt-2">Vui lòng thử lại sau</p>
      </div>
    );
  }

  return (
    <div className="mx-auto px-[90px] py-8">
      <h1 className="text-3xl text-[#F295B6] font-bold mb-8">
        Kết quả tìm kiếm cho "{q}"
        <span className="text-lg font-normal text-gray-500 ml-3">
          ({getTypeLabel()})
        </span>
      </h1>

      {totalResults > 0 ? (
        <div className="newsfeed-list-wrapper">
          <Masonry
            breakpointCols={breakpointCols}
            className="newsfeed-masonry-grid"
            columnClassName="newsfeed-masonry-grid_column"
          >
            {renderResults()}
          </Masonry>

          {isFetchingNextPage && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}

          {!hasNextPage && totalResults > 0 && (
            <p className="text-center text-muted-foreground py-12">
              Đã hết kết quả tìm kiếm
            </p>
          )}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-500">
          <p className="text-xl">Không tìm thấy kết quả nào.</p>
          <p className="mt-2">Thử tìm kiếm với từ khóa khác</p>
        </div>
      )}
    </div>
  );
};
