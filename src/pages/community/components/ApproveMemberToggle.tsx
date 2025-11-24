import { useState } from "react";

const ApproveMemberToggle = () => {
  const [requireApproval, setRequireApproval] = useState<boolean>(false);

  const handleToggle = () => {
    const next = !requireApproval;
    setRequireApproval(next);
    // sau này gọi API
    console.log("Require member approval:", next);
  };

  return (
    <section style={{ marginTop: 24 }}>
      <h4>Duyệt thành viên mới</h4>
      <p style={{ fontSize: 14, color: "#555" }}>
        Khi bật, yêu cầu tham gia cộng đồng sẽ vào hàng chờ. Admin duyệt xong
        thành viên mới chính thức tham gia.
      </p>

      <label style={{ display: "inline-flex", alignItems: "center", marginTop: 8 }}>
        <input
          type="checkbox"
          checked={requireApproval}
          onChange={handleToggle}
          style={{ marginRight: 8 }}
        />
        {requireApproval ? "Đang bật duyệt thành viên" : "Đang tắt duyệt thành viên"}
      </label>
    </section>
  );
};

export default ApproveMemberToggle;
