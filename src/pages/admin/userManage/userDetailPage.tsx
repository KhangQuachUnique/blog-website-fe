import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiEdit3,
  FiTrash2,
  FiClock,
  FiShield,
  FiMail,
  FiPhone,
} from "react-icons/fi";
import {
  getUserById,
  deleteUser,
  type IUser,
} from "../../../services/userService";

const UserDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchUser();
    }
  }, [id]);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const data = await getUserById(Number(id));
      setUser(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Lỗi khi tải chi tiết người dùng"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !window.confirm(`Bạn có chắc muốn xóa ${user.username}?`))
      return;

    setDeleteLoading(true);
    try {
      await deleteUser(user.id);
      alert("Xóa thành công!");
      navigate("/admin/users/list");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Lỗi khi xóa người dùng");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-gray-500">Đang tải...</div>;
  }

  if (error || !user) {
    return (
      <div className="p-10 text-center text-red-500">
        {error || "Không tìm thấy người dùng"}
      </div>
    );
  }

  return (
    <div className="p-6 min-h-[80vh]">
      {/* HEADER */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/admin/users/list")}
          className="flex items-center gap-2 text-gray-500 hover:text-[#8C1D35] transition-colors mb-4"
        >
          <FiArrowLeft /> Quay lại danh sách
        </button>
        <div className="flex justify-between items-start">
          <h1 className="text-2xl font-bold text-[#8C1D35] font-['Mona_Sans']">
            Hồ sơ người dùng
          </h1>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/admin/users/edit/${user.id}`)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 font-medium transition-colors"
            >
              <FiEdit3 /> Sửa
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 font-medium transition-colors disabled:opacity-50"
            >
              <FiTrash2 /> {deleteLoading ? "Đang xóa..." : "Xóa"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CỘT TRÁI: AVATAR & STATUS */}
        <div className="col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-[#FFE4EC] flex flex-col items-center text-center h-fit">
          <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-[#FAF5F7]">
            <img
              src={user.avatarUrl || "https://i.pravatar.cc/300"}
              alt="User Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-xl font-bold text-gray-800">{user.username}</h2>
          <p className="text-gray-500 text-sm mb-4">#{user.id}</p>

          <div className="flex gap-2 mb-6">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                user.isBanned
                  ? "bg-red-100 text-red-600"
                  : user.type === "ADMIN"
                  ? "bg-purple-100 text-purple-600"
                  : "bg-blue-50 text-blue-600"
              }`}
            >
              {user.isBanned
                ? "Đã khóa"
                : user.type === "ADMIN"
                ? "Admin"
                : "User"}
            </span>
          </div>

          {user.isBanned && (
            <div className="w-full bg-red-50 p-4 rounded-xl text-left border border-red-100">
              <p className="text-xs font-bold text-red-600 uppercase mb-1">
                Tài khoản đã khóa
              </p>
              <p className="text-sm text-red-800">
                Tài khoản này đã bị vô hiệu hóa bởi quản trị viên.
              </p>
            </div>
          )}
        </div>

        {/* CỘT PHẢI: THÔNG TIN CHI TIẾT */}
        <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
          {/* THÔNG TIN CÁ NHÂN */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#FFE4EC]">
            <h3 className="text-lg font-bold text-[#8C1D35] mb-4 pb-2 border-b border-gray-100">
              Thông tin liên hệ
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3 p-3 bg-[#FAF5F7] rounded-xl">
                <div className="p-2 bg-white rounded-lg text-[#F295B6] shadow-sm">
                  <FiMail fontSize={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium text-gray-700">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[#FAF5F7] rounded-xl">
                <div className="p-2 bg-white rounded-lg text-[#F295B6] shadow-sm">
                  <FiPhone fontSize={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Số điện thoại</p>
                  <p className="font-medium text-gray-700">
                    {user.phoneNumber || "Chưa cập nhật"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* THÔNG TIN HỆ THỐNG (VÍ DỤ) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#FFE4EC]">
            <h3 className="text-lg font-bold text-[#8C1D35] mb-4 pb-2 border-b border-gray-100">
              Thông tin hệ thống
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <FiClock className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Ngày tham gia</p>
                  <p className="text-sm font-medium text-gray-700">
                    {user.joinAt
                      ? new Date(user.joinAt).toLocaleDateString("vi-VN")
                      : "Không có"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FiShield className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Xác thực Email</p>
                  <p className="text-sm font-medium text-green-600">
                    Đã xác thực
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailPage;
