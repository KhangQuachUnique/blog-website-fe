import { useState, useRef } from "react";
import { IoClose } from "react-icons/io5";
import { BsImage } from "react-icons/bs";
import { ObjectFitType } from "../../types/block";

interface ImageBlockEditProps {
  id: string;
  imageUrl?: string;
  imageCaption?: string;
  objectFit?: ObjectFitType;
  style?: React.CSSProperties;
  handleAppendImageForm?: (key: string, file: File) => void;
  handleRemoveImageForm?: (key: string) => void;
  onImageChange?: (id: string, imageUrl: string) => void;
  onImageCaptionChange: (id: string, imageCaption: string) => void;
  onObjectFitChange?: (id: string, objectFit: ObjectFitType) => void;
}

const ImageBlockEdit = ({
  id,
  imageUrl: initialImageUrl,
  imageCaption: initialImageCaption,
  objectFit: initialObjectFit,
  style,
  handleAppendImageForm,
  handleRemoveImageForm,
  onImageChange,
  onImageCaptionChange,
  onObjectFitChange,
}: ImageBlockEditProps) => {
  const [imageUrl, setImageUrl] = useState(initialImageUrl || "");
  const [imageCaption, setImageCaption] = useState(initialImageCaption);
  const [objectFit, setObjectFit] = useState<ObjectFitType>(
    initialObjectFit || ObjectFitType.COVER
  );
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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

  const handleImageCaptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCaption = e.target.value;
    setImageCaption(newCaption);
    onImageCaptionChange(id, newCaption);
  };

  const handleObjectFitChange = (newObjectFit: ObjectFitType) => {
    setObjectFit(newObjectFit);
    onObjectFitChange?.(id, newObjectFit);
  };

  const handleRemoveImage = () => {
    setImageUrl("");
    setImageCaption("");
    onImageChange?.(id, "");
    onImageCaptionChange?.(id, "");
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
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-[#F295B6]/30 border-t-[#F295B6] rounded-full animate-spin" />
            <span className="text-sm text-gray-600 font-medium">
              Đang tải ảnh...
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center px-6">
            <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center text-[#F295B6]">
              <BsImage className="w-7 h-7" />
            </div>
            <div>
              <p className="text-gray-700 font-semibold text-sm">
                Kéo thả hoặc nhấn để chọn
              </p>
              <p className="text-gray-500 text-xs mt-1">
                PNG, JPG, GIF. Tối đa 5MB
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-white group">
      <div className="relative flex-1 overflow-hidden rounded-lg bg-gradient-to-br from-white via-pink-50/30 to-blue-50/30">
        <img
          src={imageUrl}
          alt={imageCaption || "Blog image"}
          className="w-full h-full"
          style={{
            objectFit: objectFit.toLowerCase() as "contain" | "cover" | "fill",
          }}
        />
        {/* Overlay khi hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none" />

        {/* Liquid Glass Background Effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-all duration-300 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/40 rounded-full mix-blend-screen filter blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-pink-300/20 rounded-full mix-blend-screen filter blur-3xl" />
          <div className="absolute top-1/3 right-0 w-96 h-96 bg-blue-300/15 rounded-full mix-blend-screen filter blur-3xl" />
        </div>

        {/* Top Left: Change & Delete buttons */}
        <div className="absolute top-3 left-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-auto">
          <button
            onClick={handleClickUpload}
            className="bg-white/40 hover:bg-white/50 backdrop-blur-xl text-black rounded-full w-10 h-10 flex items-center justify-center transition-all shadow-xl hover:shadow-2xl border border-white/60 hover:border-white/80"
            title="Thay đổi ảnh"
          >
            <BsImage className="w-5 h-5" />
          </button>

          <button
            onClick={handleRemoveImage}
            className="bg-red-500/50 hover:bg-red-500/60 backdrop-blur-xl text-white rounded-full w-10 h-10 flex items-center justify-center transition-all shadow-xl hover:shadow-2xl border border-white/40 hover:border-white/60"
            title="Xóa ảnh"
          >
            <IoClose className="w-5 h-5" />
          </button>
        </div>

        {/* Bottom Right: Object Fit Bar */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-auto">
          <div className="flex items-center gap-2 bg-white/40 hover:bg-white/50 backdrop-blur-xl rounded-full px-1 py-1 shadow-xl border border-white/60 hover:border-white/80 transition-all">
            {Object.values(ObjectFitType).map((fit) => (
              <button
                key={fit}
                onClick={() => handleObjectFitChange(fit)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  objectFit === fit
                    ? "bg-gradient-to-br from-[#F295B6] to-[#E072A0] text-white shadow-lg backdrop-blur-md border border-white/30"
                    : "text-gray-700 hover:text-gray-900 hover:bg-white/40 backdrop-blur-md border border-transparent hover:border-white/40"
                }`}
                title={fit}
              >
                {fit}
              </button>
            ))}
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
      <div className="py-1">
        <input
          type="text"
          value={imageCaption}
          onChange={handleImageCaptionChange}
          placeholder="Thêm chú thích cho ảnh..."
          className="w-full px-2 py-1 text-sm text-gray-600 italic outline-none focus:text-gray-800"
          spellCheck={false}
        />
      </div>
    </div>
  );
};

export default ImageBlockEdit;
