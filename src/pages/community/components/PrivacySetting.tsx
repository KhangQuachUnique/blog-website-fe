import { useState } from "react";

type PrivacyType = "public" | "private";

const PrivacySetting = () => {
  const [privacy, setPrivacy] = useState<PrivacyType>("public");

  const handleChange = (value: PrivacyType) => {
    setPrivacy(value);
    // sau này gọi API ở đây
    console.log("Change privacy to:", value);
  };

  return (
    <section style={{ marginTop: 24 }}>
      <h4>Quyền riêng tư</h4>
      <p style={{ fontSize: 14, color: "#555" }}>
        Công khai: ai cũng có thể xem bài viết. <br />
        Riêng tư: chỉ thành viên trong cộng đồng mới xem được bài viết.
      </p>

      <div style={{ marginTop: 8 }}>
        <label style={{ marginRight: 16 }}>
          <input
            type="radio"
            value="public"
            checked={privacy === "public"}
            onChange={() => handleChange("public")}
          />{" "}
          Công khai
        </label>

        <label>
          <input
            type="radio"
            value="private"
            checked={privacy === "private"}
            onChange={() => handleChange("private")}
          />{" "}
          Riêng tư
        </label>
      </div>
    </section>
  );
};

export default PrivacySetting;
