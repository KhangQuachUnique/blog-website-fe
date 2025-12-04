import { useEditor, EditorContent } from "@tiptap/react";
import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import {
  CiTextAlignLeft,
  CiTextAlignCenter,
  CiTextAlignRight,
  CiTextAlignJustify,
  CiLink,
} from "react-icons/ci";
import {
  FaList,
  FaListOl,
  FaCheck,
  FaAngleDown,
  FaQuoteLeft,
  FaCode,
} from "react-icons/fa6";

interface TextBlockProps {
  id: string;
  content?: string;
  onContentChange?: (newContent: string) => void;
  isEditMode?: boolean;
  style?: React.CSSProperties;
}

const TextBlockEdit = ({
  id,
  content,
  onContentChange,
  isEditMode = true,
  style,
}: TextBlockProps) => {
  const [showPopover, setShowPopover] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [, forceUpdate] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Preset colors
  const colors = [
    { name: "Black", value: "#000000" },
    { name: "Red", value: "#EF4444" },
    { name: "Orange", value: "#F97316" },
    { name: "Yellow", value: "#EAB308" },
    { name: "Green", value: "#22C55E" },
    { name: "Blue", value: "#3B82F6" },
    { name: "Purple", value: "#A855F7" },
    { name: "Pink", value: "#F295B6" },
    { name: "Gray", value: "#6B7280" },
  ];

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setShowPopover(false);
        setShowLinkInput(false);
      }
    };
    if (showPopover) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showPopover]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder: "Nhập nội dung...",
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-[#F295B6] underline cursor-pointer",
        },
      }),
      TextStyle,
      Color,
    ],
    content: content || "",
    editable: isEditMode,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onContentChange?.(html);
      forceUpdate({});
    },
    onSelectionUpdate: () => {
      // Chỉ update active state, không hiện toolbar khi đang kéo
      forceUpdate({});
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-lg max-w-none focus:outline-none min-h-[100px] p-4 text-lg [&_h1]:text-4xl [&_h1]:font-bold [&_h2]:text-3xl [&_h2]:font-bold [&_h3]:text-2xl [&_h3]:font-semibold [&_h3]:my-2 [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_li]:my-1 [&_blockquote]:border-l-4 [&_blockquote]:border-[#F295B6] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_blockquote]:my-4 [&_pre]:bg-gray-900 [&_pre]:text-gray-100 [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:my-4 [&_pre]:overflow-x-auto [&_code]:font-mono [&_code]:text-sm [&::selection]:bg-[#F295B6]/30 [&::selection]:text-inherit",
        spellcheck: "false",
      },
    },
  });

  // Update editable state when isEditMode changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(isEditMode);
    }
  }, [editor, isEditMode]);

  // Handle mouse events for selection
  const handleMouseDown = () => {
    setIsDragging(true);
    setShowPopover(false); // Ẩn toolbar khi bắt đầu kéo
  };

  const handleMouseUp = () => {
    if (!isEditMode || !editor || !isDragging) return;

    setIsDragging(false);

    // Đợi selection update xong
    setTimeout(() => {
      const selection = window.getSelection();
      const selectedText = selection?.toString();

      if (selectedText && selectedText.trim().length > 0) {
        const range = selection?.getRangeAt(0);
        const rect = range?.getBoundingClientRect();

        if (rect && rect.width > 0 && rect.height > 0) {
          let top = rect.top + window.scrollY - 60;
          let left = rect.left + rect.width / 2;

          // Giới hạn trong viewport
          const toolbarWidth = 650;
          const minLeft = toolbarWidth / 2 + 10;
          const maxLeft = window.innerWidth - toolbarWidth / 2 - 10;
          left = Math.max(minLeft, Math.min(left, maxLeft));

          // Nếu quá gần top thì hiện dưới
          if (top < 80) {
            top = rect.bottom + window.scrollY + 10;
          }

          setPopoverPosition({ top, left });
          setShowPopover(true);
        }
      } else if (!showLinkInput && !showColorPicker) {
        setShowPopover(false);
      }
    }, 50);
  };

  if (!editor) {
    return null;
  }

  return (
    <div
      className="text-block h-full flex flex-col relative"
      id={id}
      ref={editorRef}
      style={style}
    >
      {/* Floating Toolbar - Rendered via Portal */}
      {showPopover &&
        isEditMode &&
        createPortal(
          <div
            ref={popoverRef}
            className="fixed z-[9999] bg-white border-2 border-gray-300 rounded-lg shadow-md px-4 py-3 flex items-center gap-2"
            style={{
              backdropFilter: "blur(10px)",
              backgroundColor: "rgba(255, 255, 255, 0.98)",
              top: `${popoverPosition.top}px`,
              left: `${popoverPosition.left}px`,
              transform: "translateX(-50%)",
            }}
          >
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`h-7 w-7 items-center justify-center rounded transition-colors text-sm font-bold ${
                editor.isActive("bold")
                  ? "bg-[#F295B6] text-white"
                  : "hover:bg-gray-200"
              }`}
              title="Bold"
            >
              B
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`h-7 w-7 items-center justify-center rounded transition-colors text-sm italic ${
                editor.isActive("italic")
                  ? "bg-[#F295B6] text-white"
                  : "hover:bg-gray-200"
              }`}
              title="Italic"
            >
              I
            </button>
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`h-7 w-7 items-center justify-center rounded transition-colors text-sm underline ${
                editor.isActive("underline")
                  ? "bg-[#F295B6] text-white"
                  : "hover:bg-gray-200"
              }`}
              title="Underline"
            >
              U
            </button>

            <div className="w-px h-5 bg-gray-300 mx-1.5"></div>

            <button
              onClick={() => {
                if (editor.isActive("heading", { level: 1 })) {
                  editor.chain().focus().setParagraph().run();
                } else {
                  editor.chain().focus().setHeading({ level: 1 }).run();
                }
              }}
              className={`h-7 w-7 items-center justify-center rounded transition-colors text-sm font-semibold ${
                editor.isActive("heading", { level: 1 })
                  ? "bg-[#F295B6] text-white"
                  : "hover:bg-gray-200"
              }`}
              title="H1"
            >
              H1
            </button>
            <button
              onClick={() => {
                if (editor.isActive("heading", { level: 2 })) {
                  editor.chain().focus().setParagraph().run();
                } else {
                  editor.chain().focus().setHeading({ level: 2 }).run();
                }
              }}
              className={`h-7 w-7 items-center justify-center rounded transition-colors text-sm font-semibold ${
                editor.isActive("heading", { level: 2 })
                  ? "bg-[#F295B6] text-white"
                  : "hover:bg-gray-200"
              }`}
              title="H2"
            >
              H2
            </button>

            <div className="w-px h-5 bg-gray-300 mx-1.5"></div>

            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`flex h-7 w-7 items-center justify-center rounded transition-colors text-base ${
                editor.isActive("bulletList")
                  ? "bg-[#F295B6] text-white"
                  : "hover:bg-gray-200"
              }`}
              title="Bullet List"
            >
              <FaList />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`flex h-7 w-7 items-center justify-center rounded transition-colors text-base ${
                editor.isActive("orderedList")
                  ? "bg-[#F295B6] text-white"
                  : "hover:bg-gray-200"
              }`}
              title="Numbered List"
            >
              <FaListOl />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`flex h-7 w-7 items-center justify-center rounded transition-colors text-base ${
                editor.isActive("blockquote")
                  ? "bg-[#F295B6] text-white"
                  : "hover:bg-gray-200"
              }`}
              title="Quote"
            >
              <FaQuoteLeft />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={`flex h-7 w-7 items-center justify-center rounded transition-colors text-base ${
                editor.isActive("codeBlock")
                  ? "bg-[#F295B6] text-white"
                  : "hover:bg-gray-200"
              }`}
              title="Code Block"
            >
              <FaCode />
            </button>

            <div className="w-px h-5 bg-gray-300 mx-1.5"></div>

            <button
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              className={`flex h-7 w-7 items-center justify-center rounded transition-colors text-base ${
                editor.isActive({ textAlign: "left" })
                  ? "bg-[#F295B6] text-white"
                  : "hover:bg-gray-200"
              }`}
              title="Left"
            >
              <CiTextAlignLeft />
            </button>
            <button
              onClick={() =>
                editor.chain().focus().setTextAlign("center").run()
              }
              className={`flex h-7 w-7 items-center justify-center rounded transition-colors text-base ${
                editor.isActive({ textAlign: "center" })
                  ? "bg-[#F295B6] text-white"
                  : "hover:bg-gray-200"
              }`}
              title="Center"
            >
              <CiTextAlignCenter />
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              className={`flex h-7 w-7 items-center justify-center rounded transition-colors text-base ${
                editor.isActive({ textAlign: "right" })
                  ? "bg-[#F295B6] text-white"
                  : "hover:bg-gray-200"
              }`}
              title="Right"
            >
              <CiTextAlignRight />
            </button>
            <button
              onClick={() =>
                editor.chain().focus().setTextAlign("justify").run()
              }
              className={`flex h-7 w-7 items-center justify-center rounded transition-colors text-base ${
                editor.isActive({ textAlign: "justify" })
                  ? "bg-[#F295B6] text-white"
                  : "hover:bg-gray-200"
              }`}
              title="Justify"
            >
              <CiTextAlignJustify />
            </button>

            <div className="w-px h-5 bg-gray-300 mx-1.5"></div>

            <button
              onClick={() => {
                if (editor.isActive("link")) {
                  editor.chain().focus().unsetLink().run();
                } else {
                  setShowLinkInput(!showLinkInput);
                }
              }}
              className={`flex h-7 w-7 items-center justify-center rounded transition-colors text-base ${
                editor.isActive("link")
                  ? "bg-[#F295B6] text-white"
                  : "hover:bg-gray-200"
              }`}
              title="Link"
            >
              <CiLink />
            </button>

            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="px-2.5 py-1.5 rounded transition-colors hover:bg-gray-200 relative"
              title="Text Color"
            >
              <div className="flex items-center gap-1">
                <div
                  className="w-4 h-4 rounded border border-gray-300"
                  style={{
                    backgroundColor:
                      editor.getAttributes("textStyle").color || "#000000",
                  }}
                />
                <span className="text-xs">
                  <FaAngleDown />
                </span>
              </div>
            </button>

            {showColorPicker && (
              <div className="absolute top-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-2 grid grid-cols-3 gap-1.5 z-50">
                {colors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => {
                      editor.chain().focus().setColor(color.value).run();
                      setShowColorPicker(false);
                    }}
                    className="w-8 h-8 rounded border-2 hover:scale-110 transition-transform"
                    style={{
                      backgroundColor: color.value,
                      borderColor:
                        editor.getAttributes("textStyle").color === color.value
                          ? "#F295B6"
                          : "transparent",
                    }}
                    title={color.name}
                  />
                ))}
              </div>
            )}

            {showLinkInput && (
              <>
                <div className="w-px h-5 bg-gray-300 mx-1.5"></div>
                <input
                  type="url"
                  placeholder="URL"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded text-sm w-40"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && linkUrl) {
                      editor.chain().focus().setLink({ href: linkUrl }).run();
                      setLinkUrl("");
                      setShowLinkInput(false);
                    } else if (e.key === "Escape") {
                      setShowLinkInput(false);
                      setLinkUrl("");
                    }
                  }}
                  autoFocus
                />
                <button
                  onClick={() => {
                    if (linkUrl) {
                      editor.chain().focus().setLink({ href: linkUrl }).run();
                      setLinkUrl("");
                      setShowLinkInput(false);
                    }
                  }}
                  className="px-2.5 py-1.5 bg-[#F295B6] text-white rounded hover:bg-[#FFB8D1] text-sm font-semibold"
                >
                  <FaCheck />
                </button>
              </>
            )}
          </div>,
          document.body
        )}

      {/* Editor Content */}
      <div
        ref={contentRef}
        className={`flex-1 overflow-hidden rounded-lg ${
          isEditMode ? "bg-white" : "bg-transparent"
        }`}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        <EditorContent editor={editor} className="" />
        {isEditMode && (
          <div className="absolute bottom-2 right-2 text-xs text-gray-400 italic text-center pointer-events-none">
            Chọn văn bản để tùy chỉnh • Giữ Ctrl để kéo thả block
          </div>
        )}
      </div>
    </div>
  );
};

export default TextBlockEdit;
