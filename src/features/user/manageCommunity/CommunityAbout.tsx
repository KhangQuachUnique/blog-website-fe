import { useParams } from "react-router-dom";
import { useGetCommunitySettings } from "../../../hooks/useCommunity";

const CommunityAbout = () => {
  const { id } = useParams();
  const communityId = Number(id);

  const { data, isLoading } = useGetCommunitySettings(communityId);

  if (isLoading) return <p>Đang tải...</p>;
  if (!data) return <p>Không tìm thấy cộng đồng</p>;

  return (
    <div style={{ marginTop: 20 }}>
      {/* MÔ TẢ */}
      <div className="box">
        <h3>Mô tả</h3>
        <p>{data.description}</p>
      </div>

      {/* THÔNG TIN CHUNG */}
      <div className="box">
        <h3>Thông tin chung</h3>

        <p>
          <b>Loại cộng đồng:</b> {data.isPublic ? "Công khai" : "Riêng tư"}
        </p>

        <p>
          <b>Yêu cầu duyệt bài:</b> {data.requirePostApproval ? "Có" : "Không"}
        </p>

        <p>
          <b>Yêu cầu duyệt thành viên:</b>{" "}
          {data.requireMemberApproval ? "Có" : "Không"}
        </p>

        <p>
          <b>Ngày tạo:</b>{" "}
          {new Date(data.createdAt).toLocaleDateString("vi-VN")}
        </p>
      </div>

      {/* VAI TRÒ */}
      <div className="box">
        <h3>Vai trò của bạn</h3>
        <p>
          Bạn hiện là: <b>{data.role}</b>
        </p>
      </div>
    </div>
  );
};

export default CommunityAbout;
