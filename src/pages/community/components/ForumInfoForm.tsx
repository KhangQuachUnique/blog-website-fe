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
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // tạo URL preview tạm (sau này sẽ thay bằng upload thật)
    const previewUrl = URL.createObjectURL(file);
    onChange("thumbnailUrl", previewUrl);
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
        <label className="community-field-label">Ảnh đại diện</label>
        <input type="file" accept="image/*" onChange={handleImageChange} />

        {thumbnailUrl && (
          <div className="community-avatar-preview">
            <img src={thumbnailUrl} alt="avatar preview" />
          </div>
        )}
      </div>

      <button
        className="community-save-btn"
        onClick={onSave}
        disabled={saving}
      >
        {saving ? "Đang lưu..." : "Lưu thay đổi"}
      </button>
    </section>
  );
};

export default ForumInfoForm;
