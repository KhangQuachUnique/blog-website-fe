import { useState, useRef, type ChangeEvent } from "react";
import {
  Smile,
  Trash2,
  Plus,
  Loader2,
  ImagePlus,
  X,
  FileImage,
  Zap,
} from "lucide-react";
import { uploadFile } from "../../../../services/upload/uploadImageService";
import { useToast } from "../../../../contexts/toast";
import {
  useGetCommunityEmojis,
  useCreateCommunityEmoji,
  useDeleteCommunityEmoji,
} from "../../../../hooks/useCommunityEmojis";
import DeleteConfirmDialog from "../../../../components/deleteConfirmButton";

interface CommunityEmojiSettingProps {
  communityId: number;
}

const CommunityEmojiSetting = ({ communityId }: CommunityEmojiSettingProps) => {
  const { showToast } = useToast();
  const [emojiName, setEmojiName] = useState("");
  // Local preview state (chưa upload)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [emojiToDelete, setEmojiToDelete] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hooks
  const { data: emojis, isLoading } = useGetCommunityEmojis(communityId);
  const createEmoji = useCreateCommunityEmoji(communityId);
  const deleteEmoji = useDeleteCommunityEmoji(communityId);

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.currentTarget.value = "";

    // Validate file size (max 512KB cho emoji)
    if (file.size > 512 * 1024) {
      showToast({ type: "error", message: "Emoji tối đa 512KB." });
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showToast({ type: "error", message: "File không phải ảnh." });
      return;
    }

    // Tạo preview URL local (chưa upload)
    const localPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(localPreviewUrl);
    setSelectedFile(file);
  };

  const handleClearImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedFile(null);
  };

  const handleCreateEmoji = async () => {
    if (!emojiName.trim()) {
      showToast({ type: "error", message: "Vui lòng nhập tên emoji." });
      return;
    }

    if (!selectedFile) {
      showToast({ type: "error", message: "Vui lòng chọn ảnh emoji." });
      return;
    }

    // Validate emoji name format (chỉ chữ, số, underscore)
    const nameRegex = /^[a-zA-Z0-9_]+$/;
    if (!nameRegex.test(emojiName)) {
      showToast({
        type: "error",
        message: "Tên emoji chỉ được chứa chữ, số và dấu gạch dưới.",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Upload ảnh lên server
      const formData = new FormData();
      formData.append("file", selectedFile);
      const uploadedUrl = await uploadFile(formData);

      // Tạo emoji với URL đã upload
      await createEmoji.mutateAsync({
        name: emojiName.trim(),
        emojiUrl: uploadedUrl,
      });

      showToast({ type: "success", message: "Đã thêm emoji thành công!" });

      // Clear form
      setEmojiName("");
      handleClearImage();
    } catch (err: unknown) {
      console.error(err);
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      showToast({
        type: "error",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Thêm emoji thất bại.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (emojiId: number) => {
    setEmojiToDelete(emojiId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!emojiToDelete) return;

    try {
      await deleteEmoji.mutateAsync(emojiToDelete);
      showToast({ type: "success", message: "Đã xóa emoji thành công!" });
    } catch (err: unknown) {
      console.error(err);
      const error = err as { response?: { data?: { message?: string } } };
      showToast({
        type: "error",
        message: error?.response?.data?.message || "Xóa emoji thất bại.",
      });
    } finally {
      setDeleteDialogOpen(false);
      setEmojiToDelete(null);
    }
  };

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <Smile size={20} className="text-pink-500" />
        <h4 className="text-lg font-semibold text-gray-800">
          Quản lý Emoji tùy chỉnh
        </h4>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        Thêm emoji riêng cho cộng đồng. Thành viên có thể dùng các emoji này để
        thả cảm xúc cho bài viết và bình luận trong cộng đồng.
      </p>

      {/* Form thêm emoji mới */}
      <div className="bg-pink-50 rounded-xl p-5 mb-6 border border-pink-100">
        <h5 className="text-sm font-semibold text-gray-700 mb-4">
          Thêm emoji mới
        </h5>

        <div className="flex flex-col gap-4">
          {/* Row 1: Image selection */}
          <div className="flex items-start gap-4">
            {/* Preview box */}
            <div className="relative">
              <div
                className={`w-20 h-20 rounded-xl border-2 border-dashed 
                           flex items-center justify-center bg-white overflow-hidden
                           transition-colors ${
                             previewUrl
                               ? "border-pink-400"
                               : "border-pink-200 hover:border-pink-300"
                           }`}
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-14 h-14 object-contain"
                  />
                ) : (
                  <ImagePlus size={28} className="text-pink-300" />
                )}
              </div>

              {/* Clear button */}
              {previewUrl && (
                <button
                  onClick={handleClearImage}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-gray-500 text-white 
                             rounded-full flex items-center justify-center
                             hover:bg-gray-600 transition-colors"
                  title="Xóa ảnh"
                  type="button"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Upload button & info */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting}
                className="px-4 py-2 bg-white border-2 border-pink-300 text-pink-600 
                           text-sm font-medium rounded-lg hover:bg-pink-50 
                           hover:border-pink-400 transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed
                           flex items-center gap-2"
              >
                <ImagePlus size={18} />
                {previewUrl ? "Đổi ảnh" : "Chọn ảnh emoji"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-400">
                PNG, JPG, GIF • Tối đa 512KB
              </p>
            </div>
          </div>

          {/* Row 2: Name input & Submit */}
          <div className="flex flex-col sm:flex-row gap-2 items-end">
            {/* Name input */}
            <div className="flex-1 w-full">
              <label className="block text-xs text-gray-600 mb-1 font-medium">
                Tên emoji (không dấu, không khoảng trắng)
              </label>
              <div
                className="flex items-center gap-1 bg-white border border-pink-200 rounded-lg px-3 h-10
                              focus-within:border-pink-400 focus-within:ring-1 focus-within:ring-pink-200 transition-all"
              >
                <span className="text-pink-400 font-medium">:</span>
                <input
                  type="text"
                  value={emojiName}
                  onChange={(e) =>
                    setEmojiName(
                      e.target.value.toLowerCase().replace(/\s/g, "_")
                    )
                  }
                  placeholder="ten_emoji"
                  className="flex-1 text-sm outline-none bg-transparent"
                  disabled={isSubmitting}
                />
                <span className="text-pink-400 font-medium">:</span>
              </div>
              {emojiName && (
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  Sẽ hiển thị:{" "}
                  <span className="text-pink-500 font-medium">
                    :{emojiName}:
                  </span>
                </p>
              )}
            </div>

            {/* Submit button */}
            <button
              onClick={handleCreateEmoji}
              disabled={!emojiName.trim() || !selectedFile || isSubmitting}
              className="w-full sm:w-auto px-5 h-10 bg-pink-500 text-white text-sm font-semibold rounded-lg
                         hover:bg-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed
                         transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Đang thêm...
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Thêm emoji
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tips section */}
        <div className="mt-4 pt-3 border-t border-pink-100 space-y-2">
          <div className="flex items-start gap-2 text-xs text-gray-600">
            <FileImage
              size={14}
              className="text-pink-500 flex-shrink-0 mt-0.5"
            />
            <span>Ảnh emoji nên có kích thước 128x128px hoặc lớn hơn</span>
          </div>
          <div className="flex items-start gap-2 text-xs text-gray-600">
            <Zap size={14} className="text-pink-500 flex-shrink-0 mt-0.5" />
            <span>Tên emoji sẽ tự động chuyển thành chữ thường</span>
          </div>
        </div>
      </div>

      {/* Danh sách emoji */}
      <div>
        <h5 className="text-sm font-semibold text-gray-700 mb-3">
          Emoji hiện có ({emojis?.length || 0})
        </h5>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={24} className="text-pink-400 animate-spin" />
          </div>
        ) : emojis && emojis.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {emojis.map((emoji) => (
              <div
                key={emoji.id}
                className="relative group bg-white rounded-xl p-3 border border-pink-100
                           hover:border-pink-300 hover:shadow-sm transition-all"
              >
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={emoji.emojiUrl}
                    alt={emoji.name}
                    className="w-10 h-10 object-contain"
                  />
                  <span className="text-xs text-gray-600 truncate w-full text-center">
                    :{emoji.name}:
                  </span>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => handleDeleteClick(emoji.id)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white 
                             rounded-full flex items-center justify-center
                             opacity-0 group-hover:opacity-100 transition-opacity
                             hover:bg-red-600"
                  title="Xóa emoji"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl">
            <Smile size={40} className="mx-auto mb-2 opacity-30" />
            <p>Chưa có emoji nào</p>
            <p className="text-sm">Hãy thêm emoji đầu tiên cho cộng đồng!</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setEmojiToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Xóa emoji?"
        description="Emoji này sẽ bị xóa vĩnh viễn. Các cảm xúc đã thả bằng emoji này sẽ không còn hiển thị."
      />
    </section>
  );
};

export default CommunityEmojiSetting;
