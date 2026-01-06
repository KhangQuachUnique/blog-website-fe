import React, { useEffect, useState, useRef } from "react";
import { X, Loader2 } from "lucide-react";
import { searchPosts } from "../../services/search/search.service";
import type { IPostSearchResponseDto } from "../../services/search/search.service";
import Card from "../../components/card/Card";
import type { IPostResponseDto } from "../../types/post";
import "../../styles/newsfeed/NewsfeedList.css";
import "../../styles/newsfeed/Card.css";

interface SearchSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  keyword: string;
}

export const SearchSidebar: React.FC<SearchSidebarProps> = ({
  isOpen,
  onClose,
  keyword,
}) => {
  // --- STATE ---
  const [posts, setPosts] = useState<IPostResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const timeoutRef = useRef<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // --- LOGIC GỌI API ---
  const fetchData = async (isNewSearch = false, cursor?: string | null) => {
    if (!keyword) return;

    setLoading(true);
    try {
      const response: IPostSearchResponseDto = await searchPosts(
        keyword,
        cursor || undefined
      );

      if (isNewSearch) {
        setPosts(response.posts);
      } else {
        setPosts((prev) => [...prev, ...response.posts]);
      }

      setNextCursor(response.pagination.nextCursor || null);
      setHasMore(response.pagination.hasMore);
    } catch (error) {
      console.error("Sidebar search error:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- EFFECT 1: RESET & TÌM KIẾM MỚI (DEBOUNCE) ---
  useEffect(() => {
    if (!isOpen) return;

    setPosts([]);
    setNextCursor(null);
    setHasMore(true);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (keyword) {
      timeoutRef.current = setTimeout(() => {
        fetchData(true);
      }, 300);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [keyword, isOpen]);

  // --- SỰ KIỆN CUỘN (INFINITE SCROLL) ---
  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;

    if (loading || !hasMore) return;

    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 50) {
      fetchData(false, nextCursor);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 
          transform transition-transform duration-300 ease-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Kết quả tìm kiếm
            </h2>
            <p className="text-sm text-gray-500">Từ khóa: "{keyword}"</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content List */}
        <div
          ref={scrollRef}
          className="h-[calc(100vh-73px)] overflow-y-auto p-4 bg-gray-100"
          onScroll={onScroll}
        >
          {/* Loading lần đầu */}
          {loading && posts.length === 0 ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-blue-500" />
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map((post, index) => (
                <div key={`${post.id}-${index}`}>
                  <Card post={post} />
                </div>
              ))}

              {/* Loader khi cuộn xuống dưới (Load More) */}
              {loading && (
                <div className="flex justify-center py-4">
                  <Loader2 className="animate-spin text-blue-500 w-6 h-6" />
                </div>
              )}

              {/* Thông báo hết dữ liệu */}
              {!hasMore && posts.length > 0 && (
                <div className="text-center text-xs text-gray-400 py-4 italic">
                  Đã hiển thị hết kết quả
                </div>
              )}
            </div>
          ) : (
            // Không tìm thấy kết quả
            !loading && (
              <div className="text-center py-10 text-gray-500">
                <p>Không tìm thấy kết quả nào cho "{keyword}".</p>
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
};