import React, { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import GridLayout from "react-grid-layout";

import { useGetPostById } from "../../../hooks/usePost";
import TextBlock from "../../../components/block/textBlock";
import ImageBlock from "../../../components/block/imageBlock";
import { CommentsSection } from "../../../components/comments/CommentsSection";
import { BlockCommentsSidebar } from "../../../components/comments/BlockCommentsSidebar"; // [NEW] Import Sidebar
import { useAuthUser } from '../../../hooks/useAuth';

import { EBlockType, ObjectFitType } from "../../../types/block";
import type { IBlockResponseDto } from "../../../types/block";
import type { IPostResponseDto } from "../../../types/post";

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

  // Fetch post data
  const { data: postData, isLoading, isError, error } = useGetPostById(postId);
  const post = postData as IPostResponseDto | undefined;

  // Container width for GridLayout
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(
    GRID_SETTINGS.width
  );
  
  // [NEW] State quản lý block ảnh đang được chọn để bình luận
  const [selectedBlock, setSelectedBlock] = useState<{ id: number; url: string } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    setContainerWidth(containerRef.current.clientWidth || GRID_SETTINGS.width);

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

  // Current logged in user (for comments)
  const { user: currentUser } = useAuthUser();
  
  // Normalize user object for comments components
  const normalizedUser = currentUser ? { 
    id: currentUser.id, 
    username: currentUser.username, 
    avatarUrl: currentUser.avatarUrl 
  } : undefined;

  // [NEW] Handler click vào ảnh
  const handleImageClick = (blockId: number, imageUrl: string) => {
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

  // ============================================
  // Render
  // ============================================
  return (
    <div className="w-full relative p-9 flex flex-col gap-4 items-center justify-center">
      {/* Title & Short Description */}
      <div style={{ width: GRID_SETTINGS.width, padding: 12 }}>
        {/* Title */}
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

        {/* Short Description */}
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

        {/* Author Info */}
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

        {/* Hashtags */}
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.hashtags.map((h) => (
              <span
                key={h.id}
                className="text-sm text-[#F295B6] bg-[#FFF0F5] px-2 py-1 rounded-full"
              >
                #{h.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Grid Layout */}
      <div style={{ width: GRID_SETTINGS.width }}>
        {blocks.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            Không có nội dung.
          </div>
        ) : (
          <div ref={containerRef} style={{ width: GRID_SETTINGS.width }}>
            <GridLayout
              layout={layout}
              cols={GRID_SETTINGS.cols}
              rowHeight={GRID_SETTINGS.rowHeight}
              width={containerWidth}
              isDraggable={false}
              isResizable={false}
              draggableCancel=".rgl-no-drag"
              isDroppable={false}
            >
              {blocks.map((block) => {
                const isImage = block.type === EBlockType.IMAGE;
                
                return (
                  <div
                    key={block.id}
                    className={`
                      ${BLOCK_WRAPPER.readMode} 
                      ${BLOCK_WRAPPER.default}
                      ${isImage ? 'cursor-pointer group hover:ring-2 hover:ring-blue-300 transition-all' : ''}
                    `}
                    // [NEW] Sự kiện click mở Sidebar cho ảnh
                    onClick={(e) => {
                      if (isImage) {
                        e.stopPropagation();
                        handleImageClick(block.id, block.content);
                      }
                    }}
                  >
                    {block.type === EBlockType.TEXT ? (
                      <TextBlock
                        id={String(block.id)}
                        content={block.content || ""}
                      />
                    ) : (
                      <>
                        <ImageBlock
                          id={String(block.id)}
                          imageUrl={block.content}
                          imageCaption={block.imageCaption}
                          objectFit={parseObjectFit(block.objectFit)}
                        />
                        {/* [NEW] Overlay hint khi hover vào ảnh */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white text-xs px-2 py-1 rounded-full pointer-events-none z-10 flex items-center gap-1">
                          <span>💬 Bình luận</span>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </GridLayout>
          </div>
        )}
      </div>

      {/* Post Comments Section */}
      <div style={{ width: GRID_SETTINGS.width, marginTop: 32 }}>
        <CommentsSection
          postId={post.id}
          currentUser={normalizedUser}
        />
      </div>

      {/* [NEW] Sidebar Comments cho từng Block */}
      <BlockCommentsSidebar
        isOpen={!!selectedBlock}
        onClose={() => setSelectedBlock(null)}
        blockId={selectedBlock?.id || 0}
        imageUrl={selectedBlock?.url}
        currentUser={normalizedUser}
      />
    </div>
  );
};

export default PostDetailsPage;