import { useState } from "react";

const ForumInfoForm = () => {
  const [name, setName] = useState("Tên cộng đồng của bạn");
  const [description, setDescription] = useState("Mô tả ngắn gọn...");
  const [avatar, setAvatar] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setAvatar(previewUrl);
  };

  const handleSave = () => {
    const payload = {
      name,
      description,
      avatar, // sau này sẽ gửi file thật
    };

    console.log("Send to API:", payload);
    alert("Đã lưu thay đổi (mock)");
  };

  // ...
return (
  <section>
    <h4>Thông tin cộng đồng</h4>

    <div style={{ marginTop: 12 }}>
      <label className="community-field-label">Tên cộng đồng</label>
      <input
        className="community-input"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
    </div>

    <div style={{ marginTop: 12 }}>
      <label className="community-field-label">Mô tả</label>
      <textarea
        className="community-textarea"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
    </div>

    <div style={{ marginTop: 12 }}>
      <label className="community-field-label">Ảnh đại diện</label>
      <input type="file" accept="image/*" onChange={handleImageChange} />

      {avatar && (
        <div className="community-avatar-preview">
          <img src={avatar} alt="avatar preview" />
        </div>
      )}
    </div>

    <button className="community-save-btn" onClick={handleSave}>
      Lưu thay đổi
    </button>
  </section>
);
// ...
};

export default ForumInfoForm;
