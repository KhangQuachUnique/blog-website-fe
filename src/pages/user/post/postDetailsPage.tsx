import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom"; // [CHANGE] thêm useLocation
import GridLayout from "react-grid-layout";
import { Search } from "lucide-react";

import { useGetPostById } from "../../../hooks/usePost";
import TextBlock from "../../../components/block/textBlock";
import ImageBlock from "../../../components/block/imageBlock";
import { CommentsSection } from "../../../components/comments/CommentsSection";
import { BlockCommentsSidebar } from "../../../components/comments/BlockCommentsSidebar";
import { SearchSidebar } from "../../../components/searchBar/SearchSidebar";
import { useAuthUser } from "../../../hooks/useAuth";

import { EBlockType, ObjectFitType } from "../../../types/block";
import type { IBlockResponseDto } from "../../../types/block";
import type {
  IPostResponseDto,
  IReactionSummaryDto,
  IEmojiSummaryDto,
} from "../../../types/post";

import {
  GRID_SETTINGS,
  BLOCK_WRAPPER,
} from "../../../features/user/manageBlogPosts/layoutConstants";

// ============================================
// Types
// ============================================
interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

// ============================================
// Helper Functions
// ============================================
const formatDate = (dateInput: string | Date): string => {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return "vừa xong";
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
  return date.toLocaleDateString("vi-VN");
};

const parseObjectFit = (value: unknown): ObjectFitType => {
  if (!value) return ObjectFitType.COVER;
  const normalized = String(value).toUpperCase();
  if (normalized === "CONTAIN") return ObjectFitType.CONTAIN;
  if (normalized === "FILL") return ObjectFitType.FILL;
  return ObjectFitType.COVER;
};

// ============================================
// Component
// ============================================
const PostDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const postId = Number(id ?? 0);

  // [ADD] Review mode: mở bằng /post/:id?review=1 => ẩn bình luận
  const location = useLocation();
  const isReviewMode =
    new URLSearchParams(location.search).get("review") === "1";

  // Fetch post data
  const { data: postData, isLoading, isError, error } = useGetPostById(postId);
  const post = postData as IPostResponseDto | undefined;

  // Container width for GridLayout
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(
    GRID_SETTINGS.width
  );

  // State quản lý block đang được chọn để bình luận (cả Text và Image)
  const [selectedBlock, setSelectedBlock] = useState<{
    id: number;
    url?: string;
  } | null>(null);

  // State cho tính năng tô đen tìm kiếm
  const [selection, setSelection] = useState<{
    text: string;
    x: number;
    y: number;
    show: boolean;
  }>({ text: "", x: 0, y: 0, show: false });

  const [searchKeyword, setSearchKeyword] = useState("");
  const [isSearchSidebarOpen, setIsSearchSidebarOpen] = useState(false);

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const ROCtor = (
      window as unknown as { ResizeObserver?: typeof ResizeObserver }
    ).ResizeObserver;
    if (ROCtor) {
      const ro = new ROCtor((entries) => {
        const w = entries[0]?.contentRect?.width;
        if (w) setContainerWidth(Math.round(w));
      });
      ro.observe(containerRef.current);
      return () => ro.disconnect();
    } else {
      const onResize = () => {
        if (containerRef.current) {
          setContainerWidth(containerRef.current.clientWidth);
        }
      };
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }
  }, []);

  // Initialize container width after first render
  useEffect(() => {
    if (containerRef.current) {
      const initialWidth =
        containerRef.current.clientWidth || GRID_SETTINGS.width;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setContainerWidth(initialWidth);
    }
  }, []);

  // Xử lý sự kiện bôi đen text
  useEffect(() => {
    const handleSelection = () => {
      const selectedText = window.getSelection()?.toString().trim();

      if (selectedText && selectedText.length > 0) {
        const selectionObj = window.getSelection();
        if (!selectionObj || selectionObj.rangeCount === 0) return;

        const selectionRange = selectionObj.getRangeAt(0);
        const rect = selectionRange.getBoundingClientRect();

        if (rect) {
          setSelection({
            text: selectedText,
            x: rect.left + rect.width / 2,
            y: rect.top + window.scrollY - 40,
            show: true,
          });
        }
      } else {
        setSelection((prev) => ({ ...prev, show: false }));
      }
    };

    document.addEventListener("mouseup", handleSelection);
    return () => document.removeEventListener("mouseup", handleSelection);
  }, []);

  const handleQuickSearch = () => {
    setSearchKeyword(selection.text);
    setIsSearchSidebarOpen(true);
    setSelection((prev) => ({ ...prev, show: false }));
    window.getSelection()?.removeAllRanges();
  };

  // Current logged in user (for comments)
  const { user: currentUser } = useAuthUser();

  // [CHANGE] chỉ cần user khi KHÔNG review mode (vì review mode sẽ ẩn comments)
  const normalizedUser = currentUser
    ? {
        id: currentUser.id,
        username: currentUser.username,
        avatarUrl: currentUser.avatarUrl ?? undefined,
      }
    : null;

  // Handler click vào block (cả Text và Image)
  const handleBlockClick = (blockId: number, type: string, content: string) => {
    const imageUrl = type === EBlockType.IMAGE ? content : undefined;
    setSelectedBlock({ id: blockId, url: imageUrl });
  };

  // ============================================
  // Early returns
  // ============================================
  if (!id || Number.isNaN(postId)) {
    return <div className="p-6 text-center text-gray-500">Invalid post id</div>;
  }

  if (isLoading) {
    return <div className="p-6 text-center text-gray-500">Đang tải...</div>;
  }

  if (isError) {
    return (
      <div className="p-6 text-center text-red-500">Lỗi: {String(error)}</div>
    );
  }

  if (!post) {
    return (
      <div className="p-6 text-center text-gray-500">
        Không tìm thấy bài viết
      </div>
    );
  }

  // ============================================
  // Prepare blocks & layout
  // ============================================
  const blocks: IBlockResponseDto[] = post.blocks ?? [];
  const COLS = GRID_SETTINGS.cols;

  const layout: LayoutItem[] = blocks.map((b) => {
    const rawX = Math.floor(b.x);
    const rawW = Math.floor(b.width);

    const x = Math.max(0, Math.min(rawX, COLS - 1));
    const wClamped = Math.max(1, Math.min(rawW, COLS));
    const w = x + wClamped > COLS ? Math.max(1, COLS - x) : wClamped;

    const baseH = Math.max(1, Math.floor(b.height));
    const hasCaption =
      b.type === EBlockType.IMAGE &&
      Boolean(b.imageCaption && String(b.imageCaption).trim().length > 0);
    const h = baseH + (hasCaption ? 1 : 0);

    return {
      i: String(b.id),
      x,
      y: Math.max(0, Math.floor(b.y)),
      w,
      h,
    };
  });

  // Reactions from backend (if present on the post DTO)
  const reactionsData: IReactionSummaryDto | undefined =
    post.reacts ?? post.reactions;
  const reactionEmojis: Array<{ node: React.ReactNode; count: number }> = [];
  if (reactionsData && Array.isArray(reactionsData.emojis)) {
    for (const r of reactionsData.emojis as IEmojiSummaryDto[]) {
      const cnt = r.totalCount ?? 0;
      let node: React.ReactNode;

      if (r.emojiUrl) {
        node = (
          <img src={r.emojiUrl} alt="emoji" style={{ width: 18, height: 18 }} />
        );
      } else if (r.codepoint) {
        try {
          const parts = r.codepoint
            .split("-")
            .map((p: string) => parseInt(p, 16));
          node = String.fromCodePoint(...parts);
        } catch {
          node = "💗";
        }
      } else {
        node = "💗";
      }

      reactionEmojis.push({ node, count: cnt });
    }
  }

  // ============================================
  // Render
  // ============================================
  return (
    <div className="w-full relative p-9 flex flex-col gap-4 items-center justify-center">
      {/* Tooltip Button Tìm Kiếm */}
      {selection.show && (
        <button
          className="fixed z-50 flex items-center gap-2 bg-gray-900 text-white px-3 py-1.5 rounded-full shadow-xl hover:bg-black transition-all animate-in fade-in zoom-in duration-200"
          style={{
            left: selection.x,
            top: selection.y,
            transform: "translateX(-50%)",
          }}
          onClick={handleQuickSearch}
          onMouseDown={(e) => e.preventDefault()}
        >
          <Search size={14} />
          <span className="text-xs font-medium">
            Tìm "
            {selection.text.length > 15
              ? selection.text.substring(0, 15) + "..."
              : selection.text}
            "
          </span>
        </button>
      )}

      {/* Title & Short Description */}
      <div style={{ width: GRID_SETTINGS.width, padding: 12 }}>
        <h1
          className="w-full"
          style={{
            fontSize: "48px",
            fontWeight: "bold",
            fontFamily: "Quicksand, Mona Sans, Open Sans, Outfit, sans-serif",
            overflowWrap: "break-word",
          }}
        >
          {post.title}
        </h1>

        {reactionEmojis.length > 0 && (
          <div className="newsfeed-card__reactions" style={{ marginTop: 8 }}>
            {reactionEmojis.map((r, idx) => (
              <div key={idx} className="newsfeed-card__reaction">
                <span className="newsfeed-card__reaction-emoji">{r.node}</span>
                <span className="newsfeed-card__reaction-count">{r.count}</span>
              </div>
            ))}
          </div>
        )}

        {post.shortDescription && (
          <p
            className="w-full"
            style={{
              fontSize: "18px",
              fontStyle: "italic",
              marginTop: "12px",
              color: "#8c1d35",
              fontFamily: "Quicksand, Mona Sans, Open Sans, Outfit, sans-serif",
            }}
          >
            {post.shortDescription}
          </p>
        )}

        <div className="flex items-center gap-3 text-sm text-gray-500 mt-4">
          <img
            src={post.author?.avatarUrl ?? "/assets/default-avatar.png"}
            alt={post.author?.username ?? "avatar"}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <div>
              Bởi{" "}
              <Link
                to={`/user/${post.author?.id}`}
                className="font-medium text-[#F295B6] hover:underline"
              >
                {post.author?.username ?? "Người dùng"}
              </Link>
            </div>
            <div className="text-xs text-gray-400">
              {formatDate(post.createdAt)}
            </div>
          </div>
        </div>

        {post.hashtags && post.hashtags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.hashtags.map((h) => (
              <Link
                key={h.id}
                to={`/search?q=${encodeURIComponent(h.name)}&type=hashtag`}
                className="text-sm text-[#F295B6] bg-[#FFF0F5] px-2 py-1 rounded-full hover:bg-[#F295B6] hover:text-white transition-colors cursor-pointer"
              >
                #{h.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Grid Layout */}
      <div style={{ width: GRID_SETTINGS.width }}>
        {blocks.length === 0 ? (
          <div className="text-gray-500 text-center py-8">Không có nội dung.</div>
        ) : (
          <div ref={containerRef} style={{ width: GRID_SETTINGS.width }}>
            <GridLayout
              layout={layout}
              cols={GRID_SETTINGS.cols}
              rowHeight={GRID_SETTINGS.rowHeight}
              width={containerWidth}
              margin={GRID_SETTINGS.margin}
              isDraggable={false}
              isResizable={false}
              draggableCancel=".rgl-no-drag"
              isDroppable={false}
            >
              {blocks.map((block) => {
                const isInteractable =
                  block.type === EBlockType.IMAGE ||
                  block.type === EBlockType.TEXT;
                const isImage = block.type === EBlockType.IMAGE;

                // [ADD] Chỉ cho comment block khi KHÔNG review mode và có user
                const canCommentBlock =
                  isInteractable && !isReviewMode && !!normalizedUser;

                return (
                  <div
                    key={block.id}
                    className={`
                      ${BLOCK_WRAPPER.readMode}
                      ${BLOCK_WRAPPER.default}
                      h-full
                      ${
                        canCommentBlock
                          ? "cursor-pointer group hover:ring-2 hover:ring-blue-300 transition-all relative"
                          : ""
                      }
                    `}
                    onClick={(e) => {
                      if (!canCommentBlock) return; // [CHANGE]
                      const selection = window.getSelection();
                      if (selection && selection.toString().length > 0) return;
                      if ((e.target as HTMLElement).closest("a")) return;
                      handleBlockClick(block.id, block.type, block.content);
                    }}
                  >
                    {block.type === EBlockType.TEXT ? (
                      <TextBlock id={String(block.id)} content={block.content || ""} />
                    ) : (
                      <ImageBlock
                        id={String(block.id)}
                        imageUrl={block.content}
                        imageCaption={block.imageCaption}
                        objectFit={parseObjectFit(block.objectFit)}
                      />
                    )}

                    {/* [CHANGE] Ẩn overlay comment khi review mode */}
                    {canCommentBlock && (
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white text-xs px-2 py-1 rounded-full pointer-events-none z-10 flex items-center gap-1">
                        <span>💬 {isImage ? "Bình luận ảnh" : "Bình luận đoạn này"}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </GridLayout>
          </div>
        )}
      </div>

      {/* [CHANGE] Ẩn Post Comments khi review mode */}
      {!isReviewMode && normalizedUser && (
        <div style={{ width: GRID_SETTINGS.width, marginTop: 32 }}>
          <CommentsSection postId={post.id} currentUser={normalizedUser} />
        </div>
      )}

      {/* [CHANGE] Ẩn Block Comments Sidebar khi review mode */}
      {!isReviewMode && normalizedUser && (
        <BlockCommentsSidebar
          isOpen={!!selectedBlock}
          onClose={() => setSelectedBlock(null)}
          blockId={selectedBlock?.id || 0}
          imageUrl={selectedBlock?.url}
          currentUser={normalizedUser}
        />
      )}

      {/* Sidebar Search Text */}
      <SearchSidebar
        isOpen={isSearchSidebarOpen}
        onClose={() => setIsSearchSidebarOpen(false)}
        keyword={searchKeyword}
      />
    </div>
  );
};

export default PostDetailsPage;
