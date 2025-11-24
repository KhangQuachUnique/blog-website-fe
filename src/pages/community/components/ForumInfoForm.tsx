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

  return (
    <section style={{ marginTop: 24 }}>
      <h4>Thông tin cộng đồng</h4>

      <div style={{ marginTop: 16 }}>
        <label>Tên cộng đồng</label>
        <br />
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            width: "300px",
            padding: "8px",
            marginTop: "4px",
          }}
        />
      </div>

      <div style={{ marginTop: 16 }}>
        <label>Mô tả</label>
        <br />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{
            width: "300px",
            height: "80px",
            padding: "8px",
            marginTop: "4px",
          }}
        />
      </div>

      <div style={{ marginTop: 16 }}>
        <label>Ảnh đại diện</label>
        <br />
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{ marginTop: "4px" }}
        />

        {avatar && (
          <div style={{ marginTop: 12 }}>
            <img
              src={avatar}
              alt="avatar preview"
              style={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                objectFit: "cover",
                border: "1px solid #ccc",
              }}
            />
          </div>
        )}
      </div>

      <button
        onClick={handleSave}
        style={{
          marginTop: 20,
          padding: "8px 16px",
          background: "pink",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
        }}
      >
        Lưu thay đổi
      </button>
    </section>
  );
};

export default ForumInfoForm;
