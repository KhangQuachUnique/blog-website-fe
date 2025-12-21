import { useRef, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useSearch } from "../../hooks/useSearch";
import type {
  SearchResultItem,
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

  // Flatten all pages into a single array and deduplicate
  const allResults: SearchResultItem[] =
    data?.pages.flatMap((page: ISearchResponseDto) => page.items) ?? [];
  const results: SearchResultItem[] = allResults.filter(
    (item: SearchResultItem, index: number, self: SearchResultItem[]) =>
      self.findIndex((i: SearchResultItem) => i.id === item.id) === index
  );

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

  // Convert SearchResultItem to IPostResponseDto for Card component
  const convertToPost = (item: SearchResultItem): IPostResponseDto => ({
    id: Number(item.id),
    title: item.title || "",
    shortDescription: "",
    thumbnailUrl: item.thumbnailUrl,
    isPublic: true,
    author: {
      id: item.author?.id || 0,
      username: item.author?.username || item.username || "Ẩn danh",
      avatarUrl:
        item.author?.avatarUrl ||
        item.avatarUrl ||
        "https://via.placeholder.com/40",
    },
    status: "ACTIVE" as const,
    type: "PERSONAL" as const,
    hashtags: item.hashtags || [],
    createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
    upVotes: item.upVotes || 0,
    downVotes: item.downVotes || 0,
    totalComments: item.totalComments || 0,
    totalReacts: item.totalReacts || 0,
  });

  // Render User Card (cùng style với newsfeed card)
  const renderUserCard = (item: SearchResultItem) => (
    <Link to={`/profile/${item.id}`} className="block">
      <article className="newsfeed-card hover:shadow-lg transition-shadow cursor-pointer">
        {item.avatarUrl && (
          <div className="newsfeed-card__thumbnail">
            <img
              src={item.avatarUrl}
              alt={item.username}
              className="newsfeed-card__image"
              loading="lazy"
            />
          </div>
        )}
        <div className="newsfeed-card__right">
          <div className="newsfeed-card__content">
            <h2 className="newsfeed-card__title">{item.username}</h2>
            <div className="newsfeed-card__header">
              <div className="newsfeed-card__author">
                <img
                  src={item.avatarUrl || "https://via.placeholder.com/40"}
                  alt={item.username}
                  className="newsfeed-card__avatar"
                />
                <div className="newsfeed-card__author-info">
                  <span className="newsfeed-card__username">
                    @{item.username}
                  </span>
                </div>
              </div>
            </div>
            <span className="text-blue-500 text-sm hover:underline mt-2">
              Xem trang cá nhân
            </span>
          </div>
        </div>
      </article>
    </Link>
  );

  // Render Community Card (cùng style với newsfeed card)
  const renderCommunityCard = (item: SearchResultItem) => (
    <Link to={`/community/${item.id}`} className="block">
      <article className="newsfeed-card hover:shadow-lg transition-shadow cursor-pointer">
        {item.thumbnailUrl && (
          <div className="newsfeed-card__thumbnail">
            <img
              src={item.thumbnailUrl}
              alt={item.name}
              className="newsfeed-card__image"
              loading="lazy"
            />
          </div>
        )}
        <div className="newsfeed-card__right">
          <div className="newsfeed-card__content">
            <h2 className="newsfeed-card__title">{item.name}</h2>
            <div className="newsfeed-card__header">
              <div className="newsfeed-card__author">
                <img
                  src={item.thumbnailUrl || "https://via.placeholder.com/40"}
                  alt={item.name}
                  className="newsfeed-card__avatar"
                />
                <div className="newsfeed-card__author-info">
                  <span className="newsfeed-card__username">Cộng đồng</span>
                </div>
              </div>
              {item.createdAt && (
                <time className="newsfeed-card__time">
                  {formatDate(item.createdAt)}
                </time>
              )}
            </div>
            {item.description && (
              <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                {item.description}
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

  // Chọn render function dựa trên type
  const renderItem = (item: SearchResultItem) => {
    switch (type) {
      case "user":
        return renderUserCard(item);
      case "community":
        return renderCommunityCard(item);
      case "hashtag":
        // Hashtag search trả về bài viết có hashtag đó, hiển thị như post
        return <Card post={convertToPost(item)} />;
      case "post":
      default:
        return <Card post={convertToPost(item)} />;
    }
  };

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

      {results.length > 0 ? (
        <div className="newsfeed-list-wrapper">
          <Masonry
            breakpointCols={breakpointCols}
            className="newsfeed-masonry-grid"
            columnClassName="newsfeed-masonry-grid_column"
          >
            {results.map((item: SearchResultItem, idx: number) => {
              const isLast = idx === results.length - 1;
              return (
                <div
                  key={item.id}
                  className="newsfeed-masonry-item"
                  ref={isLast ? lastItemRef : undefined}
                >
                  {renderItem(item)}
                </div>
              );
            })}
          </Masonry>

          {isFetchingNextPage && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}

          {!hasNextPage && results.length > 0 && (
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
