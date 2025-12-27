import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiSave } from "react-icons/fi";
import {
  HiOutlineMail,
  HiOutlineUser,
  HiOutlineLockClosed,
  HiOutlinePhone,
} from "react-icons/hi";
import {
  createUser,
  type CreateUserRequest,
} from "../../../services/userService";
import { useToast } from "../../../contexts/toast";

const UserCreatePage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  // State lưu dữ liệu form
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    type: "USER", // Mặc định là USER
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (!formData.username || !formData.email || !formData.password) {
      showToast({
        type: "error",
        message: "Vui lòng điền đầy đủ thông tin bắt buộc!",
      });
      return;
    }

    if (formData.password.length < 8) {
      showToast({ type: "error", message: "Mật khẩu phải có ít nhất 8 ký tự" });
      return;
    }

    if (formData.password.length > 50) {
      showToast({ type: "error", message: "Mật khẩu không được quá 50 ký tự" });
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
      showToast({ type: "success", message: "Thêm người dùng thành công!" });
      navigate("/admin/users/list");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Có lỗi xảy ra!";
      showToast({ type: "error", message: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 min-h-[80vh]">
      {/* --- HEADER --- */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate("/admin/users/list")}
          className="p-2 rounded-full hover:bg-white hover:shadow-sm transition-all text-gray-600"
        >
          <FiArrowLeft fontSize={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#8C1D35] font-['Mona_Sans']">
            Thêm người dùng mới
          </h1>
          <p className="text-gray-500 text-sm">
            Điền thông tin để tạo tài khoản mới vào hệ thống.
          </p>
        </div>
      </div>

      {/* --- FORM --- */}
      <div className="bg-white p-8 rounded-2xl shadow-sm max-w-3xl mx-auto border border-[#FFE4EC]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Hàng 1: Username & Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">
                Tên đăng nhập <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center px-4 py-3 bg-[#FAF5F7] rounded-xl border border-transparent focus-within:border-[#F295B6] transition-all">
                <HiOutlineUser className="text-gray-400 mr-2" fontSize={20} />
                <input
                  type="text"
                  name="username"
                  placeholder="Nhập tên đăng nhập..."
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  placeholder="Tối thiểu 8 ký tự, có chữ hoa, thường và số"
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <option value="USER">Người dùng (User)</option>
                <option value="ADMIN">Quản trị viên (Admin)</option>
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

          {/* Buttons */}
          <div className="flex items-center justify-end gap-4 mt-4">
            <button
              type="button"
              onClick={() => navigate("/admin/users/list")}
              className="px-6 py-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors font-medium"
              disabled={loading}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-[#F295B6] text-white hover:bg-[#ffb8d1] disabled:opacity-50 transition-colors font-bold shadow-sm hover:shadow-md"
            >
              <FiSave fontSize={18} />
              {loading ? "Đang xử lý..." : "Lưu người dùng"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserCreatePage;
