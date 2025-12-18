import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiSave, FiX } from "react-icons/fi";
import { getUserById, updateUser, type IUser } from "../../../services/userService";
import { useToast } from "../../../contexts/toast";

const UserEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form fields
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [type, setType] = useState<"USER" | "ADMIN">("USER");

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
      setUsername(data.username);
      setEmail(data.email);
      setPhoneNumber(data.phoneNumber || "");
      setType(data.type as "USER" | "ADMIN");
    } catch (err) {
      showToast({
        type: "error",
        message: err instanceof Error ? err.message : "Lỗi khi tải thông tin người dùng",
      });
      navigate("/admin/users/list");
    } finally {
      setLoading(false);
    }
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

  const handleSave = async () => {
    if (!validateForm()) return;
    if (!user) return;

    setSaving(true);
    try {
      const updateData: Partial<IUser> = {
        username: username.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
        type,
      };
      
      await updateUser(user.id, updateData);
      showToast({ type: "success", message: "Cập nhật thông tin thành công!" });
      navigate(`/admin/users/detail/${user.id}`);
    } catch (err) {
      showToast({
        type: "error",
        message: err instanceof Error ? err.message : "Lỗi khi cập nhật thông tin",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/admin/users/detail/${id}`);
  };

  if (loading) {
    return <div className="p-10 text-center text-gray-500">Đang tải...</div>;
  }

  if (!user) {
    return <div className="p-10 text-center text-red-500">Không tìm thấy người dùng</div>;
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
        <h1 className="text-2xl font-bold text-[#8C1D35] font-['Mona_Sans']">
          Chỉnh sửa thông tin người dùng
        </h1>
        <p className="text-gray-500 text-sm mt-1">ID #{user.id} - {user.username}</p>
      </div>

      {/* FORM */}
      <div className="max-w-2xl">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#FFE4EC]">
          <div className="space-y-6">
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
                Số điện thoại (không bắt buộc)
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F295B6]"
                placeholder="Nhập số điện thoại"
              />
            </div>

            {/* TYPE */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Loại tài khoản
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as "USER" | "ADMIN")}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F295B6]"
              >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-[#8C1D35] text-white rounded-lg hover:bg-[#6B1529] font-medium transition-colors disabled:opacity-50"
              >
                <FiSave /> {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
              >
                <FiX /> Hủy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserEditPage;
