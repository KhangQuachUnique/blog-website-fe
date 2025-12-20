import { useState, type ChangeEvent } from "react";
import { uploadFile } from "../../../../services/upload/uploadImageService";
import { useToast } from "../../../../contexts/toast";

// src/pages/community/components/ForumInfoForm.tsx
interface ForumInfoFormProps {
  name: string;
  description: string;
  thumbnailUrl: string;
  onChange: (field: "name" | "description" | "thumbnailUrl", value: string) => void;
  onSave: () => void;
  saving: boolean;
}

const ForumInfoForm = ({
  name,
  description,
  thumbnailUrl,
  onChange,
  onSave,
  saving,
}: ForumInfoFormProps) => {
  const { showToast } = useToast();
  const [uploading, setUploading] = useState(false);

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // reset input để chọn lại cùng 1 file vẫn trigger onChange
    e.currentTarget.value = "";

    // validate nhẹ phía FE (BE cũng validate lại)
    if (file.size > 5 * 1024 * 1024) {
      showToast({ type: "error", message: "Ảnh tối đa 5MB." });
      return;
    }
    if (!file.type.startsWith("image/")) {
      showToast({ type: "error", message: "File không phải ảnh." });
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const url = await uploadFile(formData); // BE trả string URL
      onChange("thumbnailUrl", url);
      showToast({ type: "success", message: "Đã tải ảnh bìa lên." });
    } catch (err: any) {
      console.error(err);
      const msg = err?.message || "Upload ảnh thất bại. Vui lòng thử lại.";
      showToast({ type: "error", message: msg });
    } finally {
      setUploading(false);
    }
  };

  return (
    <section>
      <h4>Thông tin cộng đồng</h4>

      <div style={{ marginTop: 12 }}>
        <label className="community-field-label">Tên cộng đồng</label>
        <input
          className="community-input"
          type="text"
          value={name}
          onChange={(e) => onChange("name", e.target.value)}
        />
      </div>

      <div style={{ marginTop: 12 }}>
        <label className="community-field-label">Mô tả</label>
        <textarea
          className="community-textarea"
          value={description}
          onChange={(e) => onChange("description", e.target.value)}
        />
      </div>

      <div style={{ marginTop: 12 }}>
        <label className="community-field-label">Ảnh bìa</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          disabled={saving || uploading}
        />

        {(saving || uploading) && (
          <div style={{ marginTop: 8, fontSize: 13, color: "#666" }}>
            {uploading ? "Đang upload ảnh..." : "Đang lưu..."}
          </div>
        )}

        {thumbnailUrl && (
          <div style={{ marginTop: 10 }}>
            <img
              src={thumbnailUrl}
              alt="cover preview"
              style={{
                width: "100%",
                maxWidth: 720,
                height: 180,
                objectFit: "cover",
                borderRadius: 16,
                border: "2px solid #ffb6c1",
              }}
            />
          </div>
        )}
      </div>

      <button
        className="community-save-btn"
        onClick={onSave}
        disabled={saving || uploading}
      >
        {saving ? "Đang lưu..." : uploading ? "Đang upload..." : "Lưu thay đổi"}
      </button>
    </section>
  );
};

export default ForumInfoForm;
