import { useState, useRef } from "react";
import { IoClose } from "react-icons/io5";
import { BsImage } from "react-icons/bs";
import { FaChevronUp } from "react-icons/fa";

type ObjectFitType = "contain" | "cover" | "fill";

interface ImageBlockEditProps {
  id: string;
  imageUrl?: string;
  caption?: string;
  objectFit?: ObjectFitType;
  style?: React.CSSProperties;
  handleAppendImageForm?: (key: string, file: File) => void;
  handleRemoveImageForm?: (key: string) => void;
  onImageChange?: (id: string, imageUrl: string) => void;
  onCaptionChange?: (id: string, caption: string) => void;
  onObjectFitChange?: (id: string, objectFit: ObjectFitType) => void;
}

const ImageBlockEdit = ({
  id,
  imageUrl: initialImageUrl,
  caption: initialCaption = "",
  objectFit: initialObjectFit = "cover",
  style,
  handleAppendImageForm,
  handleRemoveImageForm,
  onImageChange,
  onCaptionChange,
  onObjectFitChange,
}: ImageBlockEditProps) => {
  const [imageUrl, setImageUrl] = useState(initialImageUrl || "");
  const [caption, setCaption] = useState(initialCaption);
  const [objectFit, setObjectFit] = useState<ObjectFitType>(initialObjectFit);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn file ảnh!");
      return;
    }

    setIsUploading(true);

    // Thêm file vào FormData để upload với block id làm key
    if (handleAppendImageForm) {
      handleAppendImageForm(id, file);
    }
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    onImageChange?.(id, url);
    setIsUploading(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleCaptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCaption = e.target.value;
    setCaption(newCaption);
    onCaptionChange?.(id, newCaption);
  };

  const handleObjectFitChange = (newObjectFit: ObjectFitType) => {
    setObjectFit(newObjectFit);
    onObjectFitChange?.(id, newObjectFit);
  };

  const handleRemoveImage = () => {
    setImageUrl("");
    setCaption("");
    onImageChange?.(id, "");
    onCaptionChange?.(id, "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    handleRemoveImageForm?.(id);
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  if (!imageUrl) {
    return (
      <div
        className={`w-full h-full rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
          isDragging ? "bg-pink-50 border-pink-400" : ""
        }`}
        style={style}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClickUpload}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />
        {isUploading ? (
          <div className="text-gray-500">Đang tải ảnh...</div>
        ) : (
          <>
            <svg
              className="w-12 h-12 text-gray-400 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-gray-500 text-sm text-center">
              Click hoặc kéo thả ảnh vào đây
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-white group">
      <div className="relative flex-1 overflow-hidden rounded-lg">
        <img
          src={imageUrl}
          alt={caption || "Blog image"}
          className="w-full h-full"
          style={{
            objectFit: objectFit,
          }}
        />
        {/* Overlay khi hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all pointer-events-none" />

        {/* Toolbar trên cùng */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-all">
          <button
            onClick={handleClickUpload}
            className="bg-white/70 backdrop-blur-sm text-gray-700 rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-white transition-all shadow-lg flex items-center gap-1"
            title="Thay đổi ảnh"
          >
            <BsImage className="w-4 h-4" />
            Đổi ảnh
          </button>

          <button
            onClick={handleRemoveImage}
            className="bg-red-500/90 backdrop-blur-sm text-white rounded-lg w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-all shadow-lg"
            title="Xóa ảnh"
          >
            <IoClose className="w-5 h-5" />
          </button>
        </div>

        {/* Dropdown menu object-fit */}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all">
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="bg-white/90 backdrop-blur-sm text-gray-700 rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-white transition-all shadow-lg flex items-center gap-2"
            >
              <span className="capitalize">{objectFit}</span>
              <FaChevronUp className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute z-10 bottom-full right-0 mb-2 bg-white rounded-lg shadow-xl overflow-hidden min-w-[140px]">
                <button
                  onClick={() => {
                    handleObjectFitChange("contain");
                    setShowMenu(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-pink-50 transition-colors ${
                    objectFit === "contain"
                      ? "bg-pink-100 text-[#F295B6] font-medium"
                      : "text-gray-700"
                  }`}
                >
                  Contain
                </button>
                <button
                  onClick={() => {
                    handleObjectFitChange("cover");
                    setShowMenu(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-pink-50 transition-colors ${
                    objectFit === "cover"
                      ? "bg-pink-100 text-[#F295B6] font-medium"
                      : "text-gray-700"
                  }`}
                >
                  Cover
                </button>
                <button
                  onClick={() => {
                    handleObjectFitChange("fill");
                    setShowMenu(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-pink-50 transition-colors ${
                    objectFit === "fill"
                      ? "bg-pink-100 text-[#F295B6] font-medium"
                      : "text-gray-700"
                  }`}
                >
                  Fill
                </button>
              </div>
            )}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>
      <div className="pt-2">
        <input
          type="text"
          value={caption}
          onChange={handleCaptionChange}
          placeholder="Thêm chú thích cho ảnh..."
          className="w-full px-2 py-1 text-sm text-gray-600 italic outline-none focus:text-gray-800"
          spellCheck={false}
        />
      </div>
    </div>
  );
};

export default ImageBlockEdit;
