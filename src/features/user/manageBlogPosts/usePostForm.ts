import { useState, useCallback, useRef } from "react";
import { EBlockType } from "../../../types/block";
import type { ICreateBlockDto } from "../../../types/block";
import type {
  IPostResponseDto,
  ICreateBlogPostDto,
  IUpdateBlogPostDto,
  EPostType,
} from "../../../types/post";

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

export type ObjectFitType = "contain" | "cover" | "fill";

export interface BlockData {
  id: string;
  type: EBlockType;
  content?: string;
  caption?: string;
  objectFit?: ObjectFitType;
}

export interface UsePostFormOptions {
  post?: IPostResponseDto;
}

const DEFAULT_LAYOUT: LayoutItem[] = [
  { i: "1", x: 0, y: 0, w: 8, h: 6, minW: 3, minH: 4 },
  { i: "2", x: 8, y: 0, w: 8, h: 6, minW: 3, minH: 4 },
];

const DEFAULT_BLOCKS: BlockData[] = [
  {
    id: "1",
    type: EBlockType.TEXT,
    content: "<p>Nhập nội dung...</p>",
  },
  {
    id: "2",
    type: EBlockType.IMAGE,
    content: undefined,
    caption: "",
    objectFit: "cover",
  },
];

/**
 * Map post response to layout items
 * @param post
 * @returns
 */
const mapPostToLayout = (post: IPostResponseDto): LayoutItem[] => {
  if (!post.blocks || post.blocks.length === 0) {
    return DEFAULT_LAYOUT;
  }
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
 * @param post
 * @returns
 */
const mapPostToBlocks = (post: IPostResponseDto): BlockData[] => {
  if (!post.blocks || post.blocks.length === 0) {
    return DEFAULT_BLOCKS;
  }
  return post.blocks.map((block, index) => ({
    id: String(index + 1),
    type: block.type,
    content: block.content,
    caption: block.type === EBlockType.IMAGE ? "" : undefined,
    objectFit: block.type === EBlockType.IMAGE ? "cover" : undefined,
  }));
};

/**
 * Hook quản lý trạng thái của form bài viết
 * @param options
 * @returns
 */
export const usePostForm = (options: UsePostFormOptions = {}) => {
  const { post } = options;

  /**
   * Title
   */
  const [title, setTitle] = useState(post?.title || "");

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      setTitle(e.target.value);
    },
    []
  );

  /**
   * Short Description
   */
  const [shortDescription, setShortDescription] = useState(
    post?.shortDescription || ""
  );

  const handleShortDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      setShortDescription(e.target.value);
    },
    []
  );

  /**
   * Thumbnail URL
   */
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(
    post?.thumbnailUrl || null
  );

  const handleThumbnailChange = useCallback((url: string | null) => {
    setThumbnailUrl(url);
  }, []);

  /**
   * Is Public
   */
  const [isPublic, setIsPublic] = useState(post?.isPublic ?? true);

  const handleIsPublicChange = useCallback((value: boolean) => {
    setIsPublic(value);
  }, []);

  /**
   * Hashtags
   */
  const [hashtags, setHashtags] = useState<string[]>(
    post?.hashtags?.map((h) => h.name) || []
  );

  const addHashtag = useCallback(
    (hashtag: string) => {
      const trimmed = hashtag.trim().replace(/^#/, "");
      if (trimmed && !hashtags.includes(trimmed)) {
        setHashtags((prev) => [...prev, trimmed]);
      }
    },
    [hashtags]
  );

  const removeHashtag = useCallback((hashtag: string) => {
    setHashtags((prev) => prev.filter((h) => h !== hashtag));
  }, []);

  /**
   * Layout & Blocks
   */
  const [layout, setLayout] = useState<LayoutItem[]>(() =>
    post ? mapPostToLayout(post) : DEFAULT_LAYOUT
  );

  const [blocks, setBlocks] = useState<BlockData[]>(() =>
    post ? mapPostToBlocks(post) : DEFAULT_BLOCKS
  );

  const handleLayoutChange = useCallback((newLayout: LayoutItem[]) => {
    setLayout(newLayout);
  }, []);

  const handleBlockContentChange = useCallback(
    (id: string, newContent: string) => {
      setBlocks((prevBlocks) =>
        prevBlocks.map((block) =>
          block.id === id ? { ...block, content: newContent } : block
        )
      );
    },
    []
  );

  const handleBlockCaptionChange = useCallback(
    (id: string, newCaption: string) => {
      setBlocks((prevBlocks) =>
        prevBlocks.map((block) =>
          block.id === id ? { ...block, caption: newCaption } : block
        )
      );
    },
    []
  );

  const handleBlockObjectFitChange = useCallback(
    (id: string, objectFit: ObjectFitType) => {
      setBlocks((prevBlocks) =>
        prevBlocks.map((block) =>
          block.id === id ? { ...block, objectFit } : block
        )
      );
    },
    []
  );

  const handleDeleteBlock = useCallback((id: string) => {
    setBlocks((prevBlocks) => prevBlocks.filter((block) => block.id !== id));
    setLayout((prevLayout) => prevLayout.filter((item) => item.i !== id));
  }, []);

  const handleAddBlock = useCallback(
    (type: EBlockType, x?: number, y?: number) => {
      const newId = String(Date.now());
      const maxY = layout.reduce(
        (max, item) => Math.max(max, item.y + item.h),
        0
      );

      const newLayoutItem: LayoutItem = {
        i: newId,
        x: x ?? 0,
        y: y ?? maxY,
        w: 8,
        h: 6,
        minW: 3,
        minH: 4,
      };

      const newBlock: BlockData = {
        id: newId,
        type,
        content:
          type === EBlockType.TEXT ? "<p>Nhập nội dung...</p>" : undefined,
        caption: type === EBlockType.IMAGE ? "" : undefined,
        objectFit: type === EBlockType.IMAGE ? "cover" : undefined,
      };

      setLayout((prev) => [...prev, newLayoutItem]);
      setBlocks((prev) => [...prev, newBlock]);
    },
    [layout]
  );

  const handleGridDrop = useCallback(
    (newLayout: LayoutItem[], layoutItem: LayoutItem, event: DragEvent) => {
      const blockType = event.dataTransfer?.getData("blockType") as EBlockType;
      if (blockType) {
        const newId = String(Date.now());

        const updatedLayout = newLayout
          .filter((item) => item.i !== "__dropping-elem__")
          .concat({
            i: newId,
            x: layoutItem.x,
            y: layoutItem.y,
            w: layoutItem.w,
            h: layoutItem.h,
            minW: 3,
            minH: 4,
          });

        const newBlock: BlockData = {
          id: newId,
          type: blockType,
          content:
            blockType === EBlockType.TEXT
              ? "<p>Nhập nội dung...</p>"
              : undefined,
          caption: blockType === EBlockType.IMAGE ? "" : undefined,
          objectFit: blockType === EBlockType.IMAGE ? "cover" : undefined,
        };

        setLayout(updatedLayout);
        setBlocks((prev) => [...prev, newBlock]);
      }
    },
    []
  );

  /**
   * FormData để upload ảnh (nếu có)
   * Sử dụng useRef để giữ FormData và mảng keys qua các lần render
   * - imageFormRef: chứa các file với field name là "files"
   * - imageKeysRef: mảng các key tương ứng ("thumbnail" hoặc block id)
   */
  const imageFormRef = useRef(new FormData());
  const imageKeysRef = useRef<string[]>([]);

  const handleAppendImageForm = useCallback((key: string, file: File) => {
    // Tìm index của key cũ nếu có
    const existingIndex = imageKeysRef.current.indexOf(key);

    if (existingIndex !== -1) {
      // Nếu key đã tồn tại, cần rebuild FormData vì không thể update file tại index cụ thể
      const files = imageFormRef.current.getAll("files") as File[];
      files[existingIndex] = file;

      // Rebuild FormData
      imageFormRef.current = new FormData();
      files.forEach((f) => imageFormRef.current.append("files", f));
    } else {
      // Thêm file mới
      imageFormRef.current.append("files", file);
      imageKeysRef.current.push(key);
    }
  }, []);

  const handleRemoveImageForm = useCallback((key: string) => {
    const index = imageKeysRef.current.indexOf(key);
    if (index !== -1) {
      // Rebuild FormData mà không có file bị xóa
      const files = imageFormRef.current.getAll("files") as File[];
      files.splice(index, 1);
      imageKeysRef.current.splice(index, 1);

      imageFormRef.current = new FormData();
      files.forEach((f) => imageFormRef.current.append("files", f));
    }
  }, []);

  const getImageForm = useCallback(() => {
    return imageFormRef.current;
  }, []);

  const getImageKeys = useCallback(() => {
    return imageKeysRef.current;
  }, []);

  /**
   * Reset FormData sau khi upload thành công
   * Gọi hàm này sau khi publish/update thành công để tránh upload trùng
   */
  const clearImageForm = useCallback(() => {
    imageFormRef.current = new FormData();
    imageKeysRef.current = [];
  }, []);

  /**
   * Map blocks và layout thành ICreateBlockDto[]
   */
  const mapBlocksToDto = useCallback((): ICreateBlockDto[] => {
    return blocks.map((block) => {
      const layoutItem = layout.find((item) => item.i === block.id);
      return {
        x: layoutItem?.x ?? 0,
        y: layoutItem?.y ?? 0,
        width: layoutItem?.w ?? 8,
        height: layoutItem?.h ?? 6,
        type: block.type,
        content: block.content || "",
      };
    });
  }, [blocks, layout]);

  /**
   * Lấy data theo format ICreateBlogPostDto
   */
  const getCreateDto = useCallback(
    (
      authorId: number,
      type: EPostType,
      communityId?: number,
      originalPostId?: number
    ): ICreateBlogPostDto => {
      return {
        title,
        shortDescription,
        thumbnailUrl: thumbnailUrl || undefined,
        isPublic,
        type,
        authorId,
        communityId,
        originalPostId,
        blocks: mapBlocksToDto(),
        hashtags,
      };
    },
    [title, shortDescription, thumbnailUrl, isPublic, hashtags, mapBlocksToDto]
  );

  /**
   * Lấy data theo format IUpdateBlogPostDto
   */
  const getUpdateDto = useCallback(
    (
      postId: number,
      type?: EPostType,
      communityId?: number,
      originalPostId?: number
    ): IUpdateBlogPostDto => {
      return {
        id: postId,
        title,
        shortDescription,
        thumbnailUrl: thumbnailUrl || undefined,
        isPublic,
        type,
        communityId,
        originalPostId,
        blocks: mapBlocksToDto(),
        hashtags,
      };
    },
    [title, shortDescription, thumbnailUrl, isPublic, hashtags, mapBlocksToDto]
  );

  return {
    // Title
    title,
    setTitle,
    handleTitleChange,

    // Short Description
    shortDescription,
    setShortDescription,
    handleShortDescriptionChange,

    // Thumbnail
    thumbnailUrl,
    setThumbnailUrl,
    handleThumbnailChange,

    // Is Public
    isPublic,
    setIsPublic,
    handleIsPublicChange,

    // Hashtags
    hashtags,
    setHashtags,
    addHashtag,
    removeHashtag,

    // Layout
    layout,
    setLayout,
    handleLayoutChange,

    // Blocks
    blocks,
    setBlocks,
    handleBlockContentChange,
    handleBlockCaptionChange,
    handleBlockObjectFitChange,
    handleDeleteBlock,
    handleAddBlock,
    handleGridDrop,

    // Image FormData
    getImageForm,
    getImageKeys,
    handleAppendImageForm,
    handleRemoveImageForm,
    clearImageForm,

    // DTO Getters
    getCreateDto,
    getUpdateDto,
  };
};

export default usePostForm;
