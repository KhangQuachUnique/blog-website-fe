// src/pages/community/components/ApproveMemberToggle.tsx
interface ApproveMemberToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

const ApproveMemberToggle = ({ value, onChange }: ApproveMemberToggleProps) => {
  const handleToggle = () => {
    const next = !value;
    onChange(next);
  };

  return (
    <section>
      <h4>Duyệt thành viên mới</h4>
      <p>
        Khi bật, yêu cầu tham gia cộng đồng sẽ vào hàng chờ. Admin duyệt xong
        thành viên mới chính thức tham gia.
      </p>

      <div className="community-toggle">
        <label>
          <input
            type="checkbox"
            checked={value}
            onChange={handleToggle}
          />{" "}
          {value
            ? "Đang bật duyệt thành viên"
            : "Đang tắt duyệt thành viên"}
        </label>
      </div>
    </section>
  );
};

export default ApproveMemberToggle;
