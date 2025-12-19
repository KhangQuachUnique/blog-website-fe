import NewsfeedList from "../../../components/newsfeedList/NewsfeedList";
import { useRef } from "react";
import { Loader2 } from "lucide-react";
import { useCallback } from "react";
import { useGetNewsFeed } from "../../../hooks/useNewsFeed";

export default function Newsfeed() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error, // ← thêm dòng này
    isError, // ← thêm dòng này
  } = useGetNewsFeed();

  // Deduplicate posts by id to avoid duplicate key errors
  const allPosts = data?.pages.flatMap((page) => page.items) ?? [];
  const posts = allPosts.filter(
    (post, index, self) => self.findIndex((p) => p.id === post.id) === index
  );

  // ← Sửa lỗi useRef
  const observer = useRef<IntersectionObserver | null>(null);

  const lastPostRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isFetchingNextPage) return;
      if (observer.current) observer.current.disconnect();

      if (node) {
        observer.current = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting) {
            console.debug("Newsfeed: sentinel intersecting", { hasNextPage });
            if (hasNextPage ?? true) {
              console.debug("Newsfeed: fetchNextPage() called");
              fetchNextPage();
            } else {
              console.debug("Newsfeed: hasNextPage is false, not fetching");
            }
          }
        });
        observer.current.observe(node);
      }
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  // ← HIỂN THỊ LỖI CHI TIẾT
  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  if (isError) {
    console.error("Lỗi chi tiết:", error);
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-red-500 text-xl mb-4">Không tải được dữ liệu</p>
        <details className="bg-red-50 p-4 rounded-lg text-left">
          <summary className="cursor-pointer font-bold">
            Chi tiết lỗi (click để xem)
          </summary>
          <pre className="text-sm mt-2 whitespace-pre-wrap">
            {error instanceof Error
              ? error.message
              : JSON.stringify(error, null, 2)}
          </pre>
        </details>
      </div>
    );
  }

  return (
    <div className="newsfeed-page">
  
     

      {/* Main Content - Posts */}
      <main className="newsfeed-page__main">
        <h1 className="text-3xl text-[#F295B6] font-bold mb-8 text-center">
          Newsfeed
        </h1>

        <NewsfeedList posts={posts} loadMoreRef={lastPostRef} isFetchingNextPage={isFetchingNextPage} hasNextPage={hasNextPage} />

        {isFetchingNextPage && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}

        {!hasNextPage && posts.length > 0 && (
          <p className="text-center text-muted-foreground py-12">
            Đã hết bài viết rồi nha
          </p>
        )}
      </main>

    
     
    </div>
  );
}
