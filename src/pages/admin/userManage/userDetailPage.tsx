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
  FiLock,
  FiUnlock,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import {
  getUserById,
  deleteUser,
  banUser,
  unbanUser,
  type IUser,
} from "../../../services/userService";
import { useToast } from "../../../contexts/toast";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";

const UserDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [banLoading, setBanLoading] = useState(false);

  // Modal states
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openBanModal, setOpenBanModal] = useState(false);
  const [banReason, setBanReason] = useState("");

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
      showToast({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Lỗi khi tải chi tiết người dùng",
      });
      navigate("/admin/users/list");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;

    setDeleteLoading(true);
    try {
      const result = await deleteUser(user.id);
      showToast({
        type: "success",
        message: result.message || "Xóa thành công!",
      });
      navigate("/admin/users/list");
    } catch (err) {
      showToast({
        type: "error",
        message: err instanceof Error ? err.message : "Lỗi khi xóa người dùng",
      });
    } finally {
      setDeleteLoading(false);
      setOpenDeleteModal(false);
    }
  };

  const handleBan = async () => {
    if (!user) return;

    setBanLoading(true);
    try {
      const result = await banUser(user.id, banReason || undefined);
      setUser((prev) => (prev ? { ...prev, isBanned: true } : null));
      showToast({
        type: "success",
        message: result.message || "Khóa tài khoản thành công!",
      });
    } catch (err) {
      showToast({
        type: "error",
        message: err instanceof Error ? err.message : "Lỗi khi khóa tài khoản",
      });
    } finally {
      setBanLoading(false);
      setOpenBanModal(false);
      setBanReason("");
    }
  };

  const handleUnban = async () => {
    if (!user) return;

    setBanLoading(true);
    try {
      const result = await unbanUser(user.id);
      setUser((prev) => (prev ? { ...prev, isBanned: false } : null));
      showToast({
        type: "success",
        message: result.message || "Mở khóa thành công!",
      });
    } catch (err) {
      showToast({
        type: "error",
        message:
          err instanceof Error ? err.message : "Lỗi khi mở khóa tài khoản",
      });
    } finally {
      setBanLoading(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-gray-500">Đang tải...</div>;
  }

  if (!user) {
    return (
      <div className="p-10 text-center text-red-500">
        Không tìm thấy người dùng
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

            {/* Ban/Unban button - không hiển thị cho Admin */}
            {user.type !== "ADMIN" &&
              (!user.isBanned ? (
                <button
                  onClick={() => setOpenBanModal(true)}
                  disabled={banLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 font-medium transition-colors disabled:opacity-50"
                >
                  <FiLock /> Khóa
                </button>
              ) : (
                <button
                  onClick={handleUnban}
                  disabled={banLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 font-medium transition-colors disabled:opacity-50"
                >
                  <FiUnlock /> {banLoading ? "Đang xử lý..." : "Mở khóa"}
                </button>
              ))}

            {/* Delete button - không hiển thị cho Admin */}
            {user.type !== "ADMIN" && (
              <button
                onClick={() => setOpenDeleteModal(true)}
                disabled={deleteLoading}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 font-medium transition-colors disabled:opacity-50"
              >
                <FiTrash2 /> Xóa
              </button>
            )}
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

          {/* THÔNG TIN HỆ THỐNG */}
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
                  <p className="text-xs text-gray-500">Trạng thái tài khoản</p>
                  <p
                    className={`text-sm font-medium flex items-center gap-1 ${
                      user.isBanned ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {user.isBanned ? (
                      <>
                        <FiAlertCircle /> Đã bị khóa
                      </>
                    ) : (
                      <>
                        <FiCheckCircle /> Hoạt động
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal xóa người dùng */}
      <Dialog open={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
        <DialogTitle sx={{ fontFamily: "Mona Sans", fontWeight: "bold" }}>
          Xác nhận xóa
        </DialogTitle>
        <DialogContent>
          <p>
            Bạn có chắc chắn muốn xóa người dùng{" "}
            <strong>{user.username}</strong>?
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Hành động này không thể hoàn tác.
          </p>
        </DialogContent>
        <DialogActions sx={{ padding: "16px 24px" }}>
          <Button
            onClick={() => setOpenDeleteModal(false)}
            disabled={deleteLoading}
          >
            Hủy
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            disabled={deleteLoading}
          >
            {deleteLoading ? "Đang xóa..." : "Xóa vĩnh viễn"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal khóa tài khoản */}
      <Dialog
        open={openBanModal}
        onClose={() => setOpenBanModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{ fontFamily: "Mona Sans", fontWeight: "bold", color: "#8C1D35" }}
        >
          Khóa tài khoản: {user.username}
        </DialogTitle>
        <DialogContent>
          <div className="flex flex-col gap-4 mt-2">
            <p className="text-sm text-gray-600">
              Hành động này sẽ ngăn người dùng truy cập vào hệ thống.
            </p>
            <TextField
              label="Lý do khóa (không bắt buộc)"
              multiline
              rows={3}
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              fullWidth
              variant="outlined"
              size="small"
            />
          </div>
        </DialogContent>
        <DialogActions sx={{ padding: "16px 24px" }}>
          <Button onClick={() => setOpenBanModal(false)} disabled={banLoading}>
            Hủy
          </Button>
          <Button
            onClick={handleBan}
            variant="contained"
            disabled={banLoading}
            sx={{ bgcolor: "#d32f2f", "&:hover": { bgcolor: "#b71c1c" } }}
          >
            {banLoading ? "Đang xử lý..." : "Xác nhận khóa"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default UserDetailPage;
