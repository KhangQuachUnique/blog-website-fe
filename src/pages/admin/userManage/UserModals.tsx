import { useState, useEffect } from "react";
import {
  FiAlertTriangle,
  FiClock,
  FiShield,
  FiMail,
  FiPhone,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import {
  HiOutlineMail,
  HiOutlineUser,
  HiOutlineLockClosed,
  HiOutlinePhone,
} from "react-icons/hi";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import {
  createUser,
  updateUser,
  type IUser,
  type CreateUserRequest,
  type UpdateUserRequest,
} from "../../../services/userService";
import { useToast } from "../../../contexts/toast";

// ==================== CREATE USER MODAL ====================
// Use Case 3.A: Thêm người dùng mới
interface CreateUserModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateUserModal = ({
  open,
  onClose,
  onSuccess,
}: CreateUserModalProps) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showAdminConfirm, setShowAdminConfirm] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    type: "USER",
  });

  const handleClose = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
      type: "USER",
    });
    onClose();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "type" && value === "ADMIN") {
      setShowAdminConfirm(true);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleConfirmAdmin = () => {
    setFormData((prev) => ({ ...prev, type: "ADMIN" }));
    setShowAdminConfirm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 3.A.3: Validate - Kiểm tra các trường bắt buộc (có dấu *)
    if (!formData.username || !formData.email || !formData.password) {
      showToast({
        type: "error",
        message: "Vui lòng điền đầy đủ thông tin bắt buộc!",
      });
      return;
    }

    // 3.A.4: Kiểm tra mật khẩu (8-50 ký tự, có chữ hoa, thường, số)
    if (formData.password.length < 8) {
      showToast({ 
        type: "error", 
        message: "Mật khẩu phải có ít nhất 8 ký tự" 
      });
      return;
    }

    if (formData.password.length > 50) {
      showToast({ 
        type: "error", 
        message: "Mật khẩu không được quá 50 ký tự" 
      });
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      showToast({
        type: "error",
        message: "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showToast({ type: "error", message: "Mật khẩu không khớp" });
      return;
    }

    setLoading(true);
    try {
      const payload: CreateUserRequest = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber || undefined,
        type: formData.type as "USER" | "ADMIN",
      };

      await createUser(payload);
      // 3.A.5: Thông báo thành công
      showToast({ 
        type: "success", 
        message: "Thêm người dùng thành công!" 
      });
      handleClose();
      onSuccess();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Có lỗi xảy ra!";
      showToast({ type: "error", message: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle
          sx={{ fontFamily: "Mona Sans", fontWeight: "bold", color: "#8C1D35" }}
        >
          Thêm tài khoản mới
        </DialogTitle>
        <DialogContent>
          <form className="flex flex-col gap-4 mt-4">
            {/* Hàng 1: Username & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">
                  Username <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center px-4 py-3 bg-[#FAF5F7] rounded-xl border border-transparent focus-within:border-[#F295B6] transition-all">
                  <HiOutlineUser className="text-gray-400 mr-2" fontSize={20} />
                  <input
                    type="text"
                    name="username"
                    placeholder="Nhập username..."
                    className="bg-transparent outline-none w-full text-sm"
                    value={formData.username}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center px-4 py-3 bg-[#FAF5F7] rounded-xl border border-transparent focus-within:border-[#F295B6] transition-all">
                  <HiOutlineMail className="text-gray-400 mr-2" fontSize={20} />
                  <input
                    type="email"
                    name="email"
                    placeholder="example@email.com"
                    className="bg-transparent outline-none w-full text-sm"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Hàng 2: Mật khẩu & Xác nhận mật khẩu */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center px-4 py-3 bg-[#FAF5F7] rounded-xl border border-transparent focus-within:border-[#F295B6] transition-all">
                  <HiOutlineLockClosed
                    className="text-gray-400 mr-2"
                    fontSize={20}
                  />
                  <input
                    type="password"
                    name="password"
                    placeholder="8-50 ký tự, có chữ hoa, thường, số"
                    className="bg-transparent outline-none w-full text-sm"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">
                  Xác nhận mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center px-4 py-3 bg-[#FAF5F7] rounded-xl border border-transparent focus-within:border-[#F295B6] transition-all">
                  <HiOutlineLockClosed
                    className="text-gray-400 mr-2"
                    fontSize={20}
                  />
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Nhập lại mật khẩu"
                    className="bg-transparent outline-none w-full text-sm"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Hàng 3: Vai trò & SĐT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">
                  Vai trò
                </label>
                <select
                  name="type"
                  className="px-4 py-3 bg-[#FAF5F7] rounded-xl border border-transparent focus:border-[#F295B6] outline-none text-sm cursor-pointer"
                  value={formData.type}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">
                  Số điện thoại
                </label>
                <div className="flex items-center px-4 py-3 bg-[#FAF5F7] rounded-xl border border-transparent focus-within:border-[#F295B6] transition-all">
                  <HiOutlinePhone className="text-gray-400 mr-2" fontSize={20} />
                  <input
                    type="text"
                    name="phoneNumber"
                    placeholder="0912..."
                    className="bg-transparent outline-none w-full text-sm"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          </form>
        </DialogContent>
        <DialogActions sx={{ padding: "16px 24px" }}>
          <Button onClick={handleClose} disabled={loading}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            sx={{ bgcolor: "#F295B6", "&:hover": { bgcolor: "#ffb8d1" } }}
          >
            {loading ? "Đang xử lý..." : "Lưu người dùng"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog xác nhận cấp quyền Admin */}
      <Dialog
        open={showAdminConfirm}
        onClose={() => setShowAdminConfirm(false)}
      >
        <DialogTitle
          sx={{ fontFamily: "Mona Sans", fontWeight: "bold", color: "#b45309" }}
        >
          <div className="flex items-center gap-2">
            <FiAlertTriangle /> Xác nhận cấp quyền Admin
          </div>
        </DialogTitle>
        <DialogContent>
          <p className="text-gray-700">
            Bạn có chắc chắn muốn tạo tài khoản với quyền <strong>Admin</strong>?
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Admin có toàn quyền quản lý hệ thống, bao gồm quản lý người dùng,
            nội dung và cấu hình.
          </p>
        </DialogContent>
        <DialogActions sx={{ padding: "16px 24px" }}>
          <Button onClick={() => setShowAdminConfirm(false)}>Hủy</Button>
          <Button
            onClick={handleConfirmAdmin}
            variant="contained"
            sx={{ bgcolor: "#b45309", "&:hover": { bgcolor: "#92400e" } }}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// ==================== EDIT USER MODAL ====================
// Use Case 4.B: Sửa thông tin người dùng
interface EditUserModalProps {
  open: boolean;
  user: IUser | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditUserModal = ({
  open,
  user,
  onClose,
  onSuccess,
}: EditUserModalProps) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showRoleConfirm, setShowRoleConfirm] = useState(false);
  const [pendingType, setPendingType] = useState<"USER" | "ADMIN">("USER");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [type, setType] = useState<"USER" | "ADMIN">("USER");

  // Update form when user changes
  useEffect(() => {
    if (user && open) {
      setUsername(user.username);
      setEmail(user.email);
      setPhoneNumber(user.phoneNumber || "");
      setType(user.type as "USER" | "ADMIN");
    }
  }, [user, open]);

  const handleClose = () => {
    onClose();
  };

  const handleTypeChange = (newType: "USER" | "ADMIN") => {
    if (newType === "ADMIN" && user?.type !== "ADMIN") {
      setPendingType(newType);
      setShowRoleConfirm(true);
    } else {
      setType(newType);
    }
  };

  const handleConfirmRoleChange = () => {
    setType(pendingType);
    setShowRoleConfirm(false);
  };

  const validateForm = () => {
    if (!username.trim()) {
      showToast({ type: "error", message: "Vui lòng nhập username" });
      return false;
    }
    if (!email.trim()) {
      showToast({ type: "error", message: "Vui lòng nhập email" });
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast({ type: "error", message: "Email không hợp lệ" });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !user) return;

    setLoading(true);
    try {
      const updateData: UpdateUserRequest = {
        username: username.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
        type,
      };

      await updateUser(user.id, updateData);
      // 4.B.4: Thông báo thành công
      showToast({ 
        type: "success", 
        message: "Cập nhật thông tin thành công!" 
      });
      handleClose();
      onSuccess();
    } catch (err) {
      showToast({
        type: "error",
        message:
          err instanceof Error ? err.message : "Lỗi khi cập nhật thông tin",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle
          sx={{ fontFamily: "Mona Sans", fontWeight: "bold", color: "#8C1D35" }}
        >
          Chỉnh sửa thông tin người dùng
        </DialogTitle>
        <DialogContent>
          <div className="space-y-6 mt-4">
            {/* USERNAME */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F295B6]"
                placeholder="Nhập username"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F295B6]"
                placeholder="Nhập email"
              />
            </div>

            {/* PHONE NUMBER */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Số điện thoại
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F295B6]"
                placeholder="Nhập số điện thoại"
              />
            </div>

            {/* TYPE - Loại tài khoản */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Loại tài khoản
              </label>
              <select
                value={type}
                onChange={(e) =>
                  handleTypeChange(e.target.value as "USER" | "ADMIN")
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F295B6]"
              >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
              {type === "ADMIN" && user?.type !== "ADMIN" && (
                <p className="mt-2 text-xs text-amber-600 flex items-center gap-1">
                  <FiAlertTriangle /> Cấp quyền Admin là hành động quan trọng
                </p>
              )}
            </div>
          </div>
        </DialogContent>
        <DialogActions sx={{ padding: "16px 24px" }}>
          <Button onClick={handleClose} disabled={loading}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            sx={{ bgcolor: "#8C1D35", "&:hover": { bgcolor: "#6B1529" } }}
          >
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog xác nhận cấp quyền Admin */}
      <Dialog open={showRoleConfirm} onClose={() => setShowRoleConfirm(false)}>
        <DialogTitle
          sx={{ fontFamily: "Mona Sans", fontWeight: "bold", color: "#b45309" }}
        >
          <div className="flex items-center gap-2">
            <FiAlertTriangle /> Xác nhận cấp quyền Admin
          </div>
        </DialogTitle>
        <DialogContent>
          <p className="text-gray-700">
            Bạn có chắc chắn muốn cấp quyền <strong>Admin</strong> cho người
            dùng <strong>{user?.username}</strong>?
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Admin có toàn quyền quản lý hệ thống, bao gồm quản lý người dùng,
            nội dung và cấu hình.
          </p>
        </DialogContent>
        <DialogActions sx={{ padding: "16px 24px" }}>
          <Button onClick={() => setShowRoleConfirm(false)}>Hủy</Button>
          <Button
            onClick={handleConfirmRoleChange}
            variant="contained"
            sx={{ bgcolor: "#b45309", "&:hover": { bgcolor: "#92400e" } }}
          >
            Xác nhận cấp quyền
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// ==================== DETAIL USER MODAL ====================
// Use Case 4.A: Xem chi tiết người dùng
interface DetailUserModalProps {
  open: boolean;
  user: IUser | null;
  onClose: () => void;
  onEdit: (user: IUser) => void;
}

export const DetailUserModal = ({
  open,
  user,
  onClose,
  onEdit,
}: DetailUserModalProps) => {
  if (!user) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{ fontFamily: "Mona Sans", fontWeight: "bold", color: "#8C1D35" }}
      >
        Thông tin chi tiết người dùng
      </DialogTitle>
      <DialogContent>
        <div className="flex flex-col gap-6 mt-4">
          {/* 4.A.1: Hiển thị thông tin cơ bản */}
          
          {/* ID & Username */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-600 uppercase">
                ID
              </label>
              <div className="px-4 py-3 bg-[#FAF5F7] rounded-xl border border-[#FFE4EC]">
                <p className="text-gray-800 font-medium">#{user.id}</p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-600 uppercase">
                Username
              </label>
              <div className="px-4 py-3 bg-[#FAF5F7] rounded-xl border border-[#FFE4EC]">
                <p className="text-gray-800 font-medium">{user.username}</p>
              </div>
            </div>
          </div>

          {/* Email & SĐT */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-600 uppercase">
                Email
              </label>
              <div className="px-4 py-3 bg-[#FAF5F7] rounded-xl border border-[#FFE4EC]">
                <p className="text-gray-800 font-medium">{user.email}</p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-600 uppercase">
                Số điện thoại
              </label>
              <div className="px-4 py-3 bg-[#FAF5F7] rounded-xl border border-[#FFE4EC]">
                <p className="text-gray-800 font-medium">
                  {user.phoneNumber || "Chưa cập nhật"}
                </p>
              </div>
            </div>
          </div>

          {/* Vai trò & Trạng thái */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-600 uppercase">
                Vai trò
              </label>
              <div className="px-4 py-3 bg-[#FAF5F7] rounded-xl border border-[#FFE4EC]">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold inline-flex w-fit ${
                    user.type === "ADMIN"
                      ? "bg-purple-100 text-purple-600"
                      : "bg-blue-50 text-blue-600"
                  }`}
                >
                  {user.type === "ADMIN" ? "Admin" : "User"}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-600 uppercase">
                Trạng thái
              </label>
              <div className="px-4 py-3 bg-[#FAF5F7] rounded-xl border border-[#FFE4EC]">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold inline-flex w-fit items-center gap-1 ${
                    user.isBanned
                      ? "bg-red-100 text-red-600"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  {user.isBanned ? (
                    <>
                      <FiAlertCircle /> Đã khóa
                    </>
                  ) : (
                    <>
                      <FiCheckCircle /> Hoạt động
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Ngày tham gia */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-600 uppercase">
              Ngày tham gia
            </label>
            <div className="px-4 py-3 bg-[#FAF5F7] rounded-xl border border-[#FFE4EC] flex items-center gap-2">
              <FiClock className="text-[#F295B6]" />
              <p className="text-gray-800 font-medium">
                {user.joinAt
                  ? new Date(user.joinAt).toLocaleDateString("vi-VN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Không có thông tin"}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
      <DialogActions sx={{ padding: "16px 24px" }}>
        {/* 4.A.3: Nút "Quay về" */}
        <Button 
          onClick={onClose} 
          variant="contained"
          sx={{ bgcolor: "#8C1D35", "&:hover": { bgcolor: "#6B1529" } }}
        >
          Quay về
        </Button>
      </DialogActions>
    </Dialog>
  );
};