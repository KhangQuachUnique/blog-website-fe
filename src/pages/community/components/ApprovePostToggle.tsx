import { useState } from "react";

const ApprovePostToggle = () => {
  const [requireApproval, setRequireApproval] = useState<boolean>(false);

  const handleToggle = () => {
    const next = !requireApproval;
    setRequireApproval(next);
    console.log("Require post approval:", next);
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
            checked={requireApproval}
            onChange={handleToggle}
          />{" "}
          {requireApproval ? "Đang bật duyệt bài" : "Đang tắt duyệt bài"}
        </label>
      </div>
    </section>
  );
};

export default ApprovePostToggle;
