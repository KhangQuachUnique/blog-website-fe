import { useState } from "react";

const ApprovePostToggle = () => {
  const [requireApproval, setRequireApproval] = useState<boolean>(false);

  const handleToggle = () => {
    const next = !requireApproval;
    setRequireApproval(next);
    // sau này gọi API
    console.log("Require post approval:", next);
  };

  return (
    <section style={{ marginTop: 24 }}>
      <h4>Duyệt bài viết trước khi đăng</h4>
      <p style={{ fontSize: 14, color: "#555" }}>
        Khi bật, tất cả bài viết mới sẽ vào hàng chờ. Admin/mod duyệt xong mới hiển thị.
      </p>

      <label style={{ display: "inline-flex", alignItems: "center", marginTop: 8 }}>
        <input
          type="checkbox"
          checked={requireApproval}
          onChange={handleToggle}
          style={{ marginRight: 8 }}
        />
        {requireApproval ? "Đang bật duyệt bài" : "Đang tắt duyệt bài"}
      </label>
    </section>
  );
};

export default ApprovePostToggle;
