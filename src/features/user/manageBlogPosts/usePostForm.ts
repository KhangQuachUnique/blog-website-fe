import { useState, useCallback, useRef } from "react";
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

export interface ValidationError {
  field: string;
  message: string;
}

export interface DraftData {
  title: string;
  shortDescription: string;
  thumbnailUrl: string | null;
  isPublic: boolean;
  hashtags: string[];
  layout: LayoutItem[];
  blocks: BlockData[];
  savedAt: number; // timestamp
}

// Draft expiration time: 10 minutes
const DRAFT_EXPIRATION_MS = 10 * 60 * 1000;

// Fixed draft key - only one draft is saved at a time
const DRAFT_STORAGE_KEY = 'blog-post-draft';

/**
 * Load draft from localStorage if valid (not expired)
 */
const loadDraftFromStorage = (): DraftData | null => {
  try {
    const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!savedDraft) return null;
    
    const draft: DraftData = JSON.parse(savedDraft);
    const now = Date.now();
    
    // Check if draft is still valid (not expired)
    if (now - draft.savedAt < DRAFT_EXPIRATION_MS) {
      return draft;
    } else {
      // Draft expired, remove it
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      return null;
    }
  } catch (error) {
    console.error('Error loading draft:', error);
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    return null;
  }
};

// Default values
const DEFAULT_LAYOUT: LayoutItem[] = [
  { i: "1", x: 0, y: 0, w: 8, h: 6, minW: 3, minH: 4 },
  { i: "2", x: 8, y: 0, w: 8, h: 6, minW: 3, minH: 4 },
];

const DEFAULT_BLOCKS: BlockData[] = [
  { id: "1", type: EBlockType.TEXT },
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

  // Load draft once during initialization (only for create mode)
  const initialDraft = !post ? loadDraftFromStorage() : null;

  // Track if form has unsaved changes
  const hasUnsavedChangesRef = useRef(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Helper to mark form as dirty
  const markAsDirty = useCallback(() => {
    hasUnsavedChangesRef.current = true;
    setHasUnsavedChanges(true);
  }, []);

  // Helper to mark form as clean
  const markAsClean = useCallback(() => {
    hasUnsavedChangesRef.current = false;
    setHasUnsavedChanges(false);
  }, []);

  // Basic Info - use draft if available, then post, then defaults
  const [title, setTitle] = useState(
    initialDraft?.title ?? post?.title ?? ""
  );
  const [shortDescription, setShortDescription] = useState(
    initialDraft?.shortDescription ?? post?.shortDescription ?? ""
  );
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(
    initialDraft?.thumbnailUrl ?? post?.thumbnailUrl ?? null
  );
  const [isPublic, setIsPublic] = useState(
    initialDraft?.isPublic ?? post?.isPublic ?? true
  );
  const [hashtags, setHashtags] = useState<string[]>(
    initialDraft?.hashtags ?? post?.hashtags?.map((h) => h.name) ?? []
  );

  // Layout & Blocks - use draft if available, then post, then defaults
  const [layout, setLayout] = useState<LayoutItem[]>(() => {
    if (initialDraft?.layout) return initialDraft.layout;
    if (post) return mapPostToLayout(post);
    return DEFAULT_LAYOUT;
  });
  const [blocks, setBlocks] = useState<BlockData[]>(() => {
    if (initialDraft?.blocks) return initialDraft.blocks;
    if (post) return mapPostToBlocks(post);
    return DEFAULT_BLOCKS;
  });

  // Image Form
  const imageForm = useImageForm();

  // Handlers: Basic Info
  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      setTitle(e.target.value);
      markAsDirty();
    },
    [markAsDirty]
  );

  const handleShortDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      setShortDescription(e.target.value);
      markAsDirty();
    },
    [markAsDirty]
  );

  const handleThumbnailChange = useCallback((url: string | null) => {
    setThumbnailUrl(url);
    markAsDirty();
  }, [markAsDirty]);

  const handleIsPublicChange = useCallback((value: boolean) => {
    setIsPublic(value);
    markAsDirty();
  }, [markAsDirty]);

  // Handlers: Hashtags
  const addHashtag = useCallback((hashtag: string) => {
    const trimmed = hashtag.trim().replace(/^#/, "");
    if (trimmed) {
      setHashtags((prev) =>
        prev.includes(trimmed) ? prev : [...prev, trimmed]
      );
      markAsDirty();
    }
  }, [markAsDirty]);

  const removeHashtag = useCallback((hashtag: string) => {
    setHashtags((prev) => prev.filter((h) => h !== hashtag));
    markAsDirty();
  }, [markAsDirty]);

  // Handlers: Layout
  const handleLayoutChange = useCallback((newLayout: LayoutItem[]) => {
    setLayout(newLayout);
    markAsDirty();
  }, [markAsDirty]);

  // Handlers: Blocks
  const handleBlockContentChange = useCallback(
    (id: string, content: string) => {
      setBlocks((prev) =>
        prev.map((block) => (block.id === id ? { ...block, content } : block))
      );
      markAsDirty();
    },
    [markAsDirty]
  );

  const handleBlockCaptionChange = useCallback(
    (id: string, imageCaption: string) => {
      setBlocks((prev) =>
        prev.map((block) =>
          block.id === id ? { ...block, imageCaption } : block
        )
      );
      markAsDirty();
      console.log("Caption changed");
    },
    [markAsDirty]
  );

  const handleBlockObjectFitChange = useCallback(
    (id: string, objectFit: ObjectFitType) => {
      setBlocks((prev) =>
        prev.map((block) => (block.id === id ? { ...block, objectFit } : block))
      );
      markAsDirty();
    },
    [markAsDirty]
  );

  // Auto-resize block height when content changes
  const handleBlockHeightChange = useCallback(
    (id: string, newHeight: number) => {
      setLayout((prev) =>
        prev.map((item) =>
          item.i === id && item.h !== newHeight
            ? { ...item, h: newHeight }
            : item
        )
      );
    },
    []
  );

  const handleDeleteBlock = useCallback(
    (id: string) => {
      setBlocks((prev) => prev.filter((block) => block.id !== id));
      setLayout((prev) => prev.filter((item) => item.i !== id));
      imageForm.removeFile(id);
      markAsDirty();
    },
    [imageForm, markAsDirty]
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
      markAsDirty();
    },
    [layout, markAsDirty]
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
      markAsDirty();
    },
    [markAsDirty]
  );

  /**
   * Validation function - kiểm tra các trường bắt buộc
   * Optional fields: hashtags, thumbnailUrl
   * Empty blocks sẽ tự động bị lọc khi build DTO
   */
  const validate = useCallback((): ValidationError[] => {
    const errors: ValidationError[] = [];

    // Required: title
    if (!title.trim()) {
      errors.push({
        field: "Tiêu đề",
        message: "Vui lòng nhập tiêu đề bài viết",
      });
    }

    // Required: shortDescription
    if (!shortDescription.trim()) {
      errors.push({
        field: "Mô tả ngắn",
        message: "Vui lòng nhập mô tả ngắn cho bài viết",
      });
    }

    // Check if there's at least one non-empty block
    const nonEmptyBlocks = blocks.filter((block) => {
      if (block.type === EBlockType.TEXT) {
        return block.content && block.content.trim() !== "";
      }
      if (block.type === EBlockType.IMAGE) {
        return block.content && block.content.trim() !== "";
      }
      return false;
    });

    if (nonEmptyBlocks.length === 0) {
      errors.push({
        field: "Nội dung",
        message: "Bài viết cần có ít nhất một block có nội dung (văn bản hoặc hình ảnh)",
      });
    }

    return errors;
  }, [title, shortDescription, blocks]);

  /**
   * Get non-empty blocks only (for building DTO)
   */
  const getNonEmptyBlocks = useCallback((): BlockData[] => {
    return blocks.filter((block) => {
      if (block.type === EBlockType.TEXT) {
        return block.content && block.content.trim() !== "";
      }
      if (block.type === EBlockType.IMAGE) {
        return block.content && block.content.trim() !== "";
      }
      return false;
    });
  }, [blocks]);

  /**
   * Get layout for non-empty blocks only
   */
  const getNonEmptyLayout = useCallback((): LayoutItem[] => {
    const nonEmptyBlockIds = new Set(getNonEmptyBlocks().map((b) => b.id));
    return layout.filter((item) => nonEmptyBlockIds.has(item.i));
  }, [layout, getNonEmptyBlocks]);

  /**
   * Save draft to localStorage (valid for 10 minutes)
   */
  const saveDraft = useCallback(() => {
    const draft: DraftData = {
      title,
      shortDescription,
      thumbnailUrl,
      isPublic,
      hashtags,
      layout,
      blocks,
      savedAt: Date.now(),
    };
    
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
      markAsClean();
      return true;
    } catch (error) {
      console.error('Error saving draft:', error);
      return false;
    }
  }, [title, shortDescription, thumbnailUrl, isPublic, hashtags, layout, blocks, markAsClean]);

  /**
   * Clear draft from localStorage
   */
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing draft:', error);
    }
  }, []);

  /**
   * Check if there's a valid draft in localStorage
   */
  const hasDraft = useCallback((): boolean => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!savedDraft) return false;
      
      const draft: DraftData = JSON.parse(savedDraft);
      const now = Date.now();
      return now - draft.savedAt < DRAFT_EXPIRATION_MS;
    } catch {
      return false;
    }
  }, []);

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
    handleBlockHeightChange,
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

    // Validation
    validate,
    getNonEmptyBlocks,
    getNonEmptyLayout,

    // Draft management
    saveDraft,
    clearDraft,
    hasDraft,
    hasUnsavedChanges,
    hasUnsavedChangesRef,
    markAsClean,
  };
};

export default usePostForm;
