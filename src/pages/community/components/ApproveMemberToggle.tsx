import { useState } from "react";

const ApproveMemberToggle = () => {
  const [requireApproval, setRequireApproval] = useState<boolean>(false);

  const handleToggle = () => {
    const next = !requireApproval;
    setRequireApproval(next);
    console.log("Require member approval:", next);
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
            checked={requireApproval}
            onChange={handleToggle}
          />{" "}
          {requireApproval
            ? "Đang bật duyệt thành viên"
            : "Đang tắt duyệt thành viên"}
        </label>
      </div>
    </section>
  );
};

export default ApproveMemberToggle;
