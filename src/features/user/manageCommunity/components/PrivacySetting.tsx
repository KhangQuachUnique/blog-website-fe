// src/pages/community/components/PrivacySetting.tsx
type PrivacyType = "public" | "private";

interface PrivacySettingProps {
  isPublic: boolean;
  onChange: (value: boolean) => void;
}

const PrivacySetting = ({ isPublic, onChange }: PrivacySettingProps) => {
  const privacy: PrivacyType = isPublic ? "public" : "private";

  const handleChange = (value: PrivacyType) => {
    onChange(value === "public");
  };

  return (
    <section>
      <h4>Quyền riêng tư</h4>
      <p>
        Công khai: ai cũng có thể xem bài viết.
        <br />
        Riêng tư: chỉ thành viên trong cộng đồng mới xem được bài viết.
      </p>

      <div className="community-radio-group">
        <label>
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
