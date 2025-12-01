// src/pages/community/components/ApprovePostToggle.tsx
interface ApprovePostToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

const ApprovePostToggle = ({ value, onChange }: ApprovePostToggleProps) => {
  const handleToggle = () => {
    const next = !value;
    onChange(next);
  };

  return (
    <section>
      <h4>Duyệt bài viết trước khi đăng</h4>
      <p>
        Khi bật, tất cả bài viết mới sẽ vào hàng chờ. Admin/mod duyệt xong mới
        hiển thị.
      </p>

      <div className="community-toggle">
        <label>
          <input
            type="checkbox"
            checked={value}
            onChange={handleToggle}
          />{" "}
          {value ? "Đang bật duyệt bài" : "Đang tắt duyệt bài"}
        </label>
      </div>
    </section>
  );
};

export default ApprovePostToggle;
