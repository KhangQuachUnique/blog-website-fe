
import { useInfiniteQuery } from '@tanstack/react-query';
import NewsfeedList from '../../components/newsfeedList/NewsfeedList';
import { getNewsfeed } from '../../config/api';
import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { useCallback } from 'react';
export default function Newsfeed() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,           // ← thêm dòng này
    isError,         // ← thêm dòng này
  } = useInfiniteQuery({
    queryKey: ['newsfeed'],
    queryFn: ({ pageParam }) => getNewsfeed(pageParam),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.pagination?.nextCursor || undefined,
  });

  const posts = data?.pages.flatMap(page => page.items) ?? [];

  // ← Sửa lỗi useRef
  const observer = useRef<IntersectionObserver | null>(null);

  const lastPostRef = useCallback((node: HTMLDivElement | null) => {
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
  }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

  // ← HIỂN THỊ LỖI CHI TIẾT
  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-12 w-12 animate-spin" /></div>;
  }

  if (isError) {
    console.error('Lỗi chi tiết:', error); // ← xem trong DevTools Console
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-red-500 text-xl mb-4">Không tải được dữ liệu</p>
        <details className="bg-red-50 p-4 rounded-lg text-left">
          <summary className="cursor-pointer font-bold">Chi tiết lỗi (click để xem)</summary>
          <pre className="text-sm mt-2 whitespace-pre-wrap">
            {error instanceof Error ? error.message : JSON.stringify(error, null, 2)}
          </pre>
        </details>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Newsfeed</h1>
      
      <NewsfeedList posts={posts} loadMoreRef={lastPostRef} />
      
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
    </div>
  );
}