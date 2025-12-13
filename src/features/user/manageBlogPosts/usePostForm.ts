import { useState, useCallback } from "react";
import { EBlockType, ObjectFitType } from "../../../types/block";
import type { IPostResponseDto } from "../../../types/post";
import { useImageForm } from "../../../hooks/useImage";

/**
 * Types
 */
export interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}

export interface BlockData {
  id: string;
  type: EBlockType;
  content?: string;
  imageCaption?: string;
  objectFit?: ObjectFitType;
}

export interface UsePostFormOptions {
  post?: IPostResponseDto;
}

// Default values
const DEFAULT_LAYOUT: LayoutItem[] = [
  { i: "1", x: 0, y: 0, w: 8, h: 6, minW: 3, minH: 4 },
  { i: "2", x: 8, y: 0, w: 8, h: 6, minW: 3, minH: 4 },
];

const DEFAULT_BLOCKS: BlockData[] = [
  { id: "1", type: EBlockType.TEXT, content: "<p>Nhập nội dung...</p>" },
  {
    id: "2",
    type: EBlockType.IMAGE,
    content: undefined,
    imageCaption: "",
    objectFit: ObjectFitType.COVER,
  },
];

/**
 * Tạo block mới theo type
 */
const createNewBlock = (id: string, type: EBlockType): BlockData => ({
  id,
  type,
  content: type === EBlockType.TEXT ? "" : undefined,
  imageCaption: type === EBlockType.IMAGE ? "" : undefined,
  objectFit: type === EBlockType.IMAGE ? ObjectFitType.COVER : undefined,
});

/**
 * Tạo layout item mới
 */
const createNewLayoutItem = (id: string, x: number, y: number): LayoutItem => ({
  i: id,
  x,
  y,
  w: 8,
  h: 6,
  minW: 3,
  minH: 4,
});

/**
 * Map post response to layout items
 */
const mapPostToLayout = (post: IPostResponseDto): LayoutItem[] => {
  if (!post.blocks?.length) return DEFAULT_LAYOUT;

  return post.blocks.map((block, index) => ({
    i: String(index + 1),
    x: block.x,
    y: block.y,
    w: block.width,
    h: block.height,
    minW: 3,
    minH: 4,
  }));
};

/**
 * Map post response to block data
 */
const mapPostToBlocks = (post: IPostResponseDto): BlockData[] => {
  if (!post.blocks?.length) return DEFAULT_BLOCKS;

  return post.blocks.map((block, index) => ({
    id: String(index + 1),
    type: block.type,
    content: block.content,
    imageCaption:
      block.type === EBlockType.IMAGE ? block.imageCaption : undefined,
    objectFit: block.type === EBlockType.IMAGE ? block.objectFit : undefined,
  }));
};

/**
 * Hook quản lý trạng thái của form bài viết
 */
export const usePostForm = (options: UsePostFormOptions = {}) => {
  const { post } = options;

  // Basic Info
  const [title, setTitle] = useState(post?.title || "");
  const [shortDescription, setShortDescription] = useState(
    post?.shortDescription || ""
  );
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(
    post?.thumbnailUrl || null
  );
  const [isPublic, setIsPublic] = useState(post?.isPublic ?? true);
  const [hashtags, setHashtags] = useState<string[]>(
    post?.hashtags?.map((h) => h.name) || []
  );

  // Layout & Blocks
  const [layout, setLayout] = useState<LayoutItem[]>(() =>
    post ? mapPostToLayout(post) : DEFAULT_LAYOUT
  );
  const [blocks, setBlocks] = useState<BlockData[]>(() =>
    post ? mapPostToBlocks(post) : DEFAULT_BLOCKS
  );

  // Image Form
  const imageForm = useImageForm();

  // Handlers: Basic Info
  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      setTitle(e.target.value);
    },
    []
  );

  const handleShortDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      setShortDescription(e.target.value);
    },
    []
  );

  const handleThumbnailChange = useCallback((url: string | null) => {
    setThumbnailUrl(url);
  }, []);

  const handleIsPublicChange = useCallback((value: boolean) => {
    setIsPublic(value);
  }, []);

  // Handlers: Hashtags
  const addHashtag = useCallback((hashtag: string) => {
    const trimmed = hashtag.trim().replace(/^#/, "");
    if (trimmed) {
      setHashtags((prev) =>
        prev.includes(trimmed) ? prev : [...prev, trimmed]
      );
    }
  }, []);

  const removeHashtag = useCallback((hashtag: string) => {
    setHashtags((prev) => prev.filter((h) => h !== hashtag));
  }, []);

  // Handlers: Layout
  const handleLayoutChange = useCallback((newLayout: LayoutItem[]) => {
    setLayout(newLayout);
  }, []);

  // Handlers: Blocks
  const handleBlockContentChange = useCallback(
    (id: string, content: string) => {
      setBlocks((prev) =>
        prev.map((block) => (block.id === id ? { ...block, content } : block))
      );
    },
    []
  );

  const handleBlockCaptionChange = useCallback(
    (id: string, imageCaption: string) => {
      setBlocks((prev) =>
        prev.map((block) =>
          block.id === id ? { ...block, imageCaption } : block
        )
      );
      console.log("Caption changed");
    },
    []
  );

  const handleBlockObjectFitChange = useCallback(
    (id: string, objectFit: ObjectFitType) => {
      setBlocks((prev) =>
        prev.map((block) => (block.id === id ? { ...block, objectFit } : block))
      );
    },
    []
  );

  const handleDeleteBlock = useCallback(
    (id: string) => {
      setBlocks((prev) => prev.filter((block) => block.id !== id));
      setLayout((prev) => prev.filter((item) => item.i !== id));
      imageForm.removeFile(id);
    },
    [imageForm]
  );

  const handleAddBlock = useCallback(
    (type: EBlockType, x?: number, y?: number) => {
      const newId = String(Date.now());
      const maxY = layout.reduce(
        (max, item) => Math.max(max, item.y + item.h),
        0
      );

      setLayout((prev) => [
        ...prev,
        createNewLayoutItem(newId, x ?? 0, y ?? maxY),
      ]);
      setBlocks((prev) => [...prev, createNewBlock(newId, type)]);
    },
    [layout]
  );

  const handleGridDrop = useCallback(
    (newLayout: LayoutItem[], layoutItem: LayoutItem, event: DragEvent) => {
      const blockType = event.dataTransfer?.getData("blockType") as EBlockType;
      if (!blockType) return;

      const newId = String(Date.now());
      const updatedLayout = newLayout
        .filter((item) => item.i !== "__dropping-elem__")
        .concat(createNewLayoutItem(newId, layoutItem.x, layoutItem.y));

      setLayout(updatedLayout);
      setBlocks((prev) => [...prev, createNewBlock(newId, blockType)]);
    },
    []
  );

  return {
    // Basic Info
    title,
    handleTitleChange,
    shortDescription,
    handleShortDescriptionChange,
    thumbnailUrl,
    handleThumbnailChange,
    isPublic,
    handleIsPublicChange,

    // Hashtags
    hashtags,
    addHashtag,
    removeHashtag,

    // Layout
    layout,
    handleLayoutChange,

    // Blocks
    blocks,
    handleBlockContentChange,
    handleBlockCaptionChange,
    handleBlockObjectFitChange,
    handleDeleteBlock,
    handleAddBlock,
    handleGridDrop,

    // Image Form (delegated)
    getImageForm: imageForm.getFormData,
    getImageKeys: imageForm.getKeys,
    handleAppendImageForm: imageForm.appendFile,
    handleRemoveImageForm: imageForm.removeFile,
    clearImageForm: imageForm.clear,
    hasImageFiles: imageForm.hasFiles,
  };
};

export default usePostForm;
