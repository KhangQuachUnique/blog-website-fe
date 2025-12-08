import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiSave } from "react-icons/fi";
import { HiOutlineMail, HiOutlineUser, HiOutlineLockClosed, HiOutlinePhone } from "react-icons/hi";

const UserCreatePage = () => {
  const navigate = useNavigate();

  // State lưu dữ liệu form
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phoneNumber: "",
    role: "USER", // Mặc định là USER
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate cơ bản
    if (!formData.email || !formData.password || !formData.fullName) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    // TODO: Gọi API tạo user ở đây
    console.log("Dữ liệu gửi đi:", formData);

    alert("Thêm người dùng thành công! (Giả lập)");
    navigate("/admin/users/list");
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
          <h1 className="text-2xl font-bold text-[#8C1D35] font-['Mona_Sans']">Thêm người dùng mới</h1>
          <p className="text-gray-500 text-sm">Điền thông tin để tạo tài khoản mới vào hệ thống.</p>
        </div>
      </div>

      {/* --- FORM --- */}
      <div className="bg-white p-8 rounded-2xl shadow-sm max-w-3xl mx-auto border border-[#FFE4EC]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          {/* Hàng 1: Họ tên & Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Họ và tên <span className="text-red-500">*</span></label>
              <div className="flex items-center px-4 py-3 bg-[#FAF5F7] rounded-xl border border-transparent focus-within:border-[#F295B6] transition-all">
                <HiOutlineUser className="text-gray-400 mr-2" fontSize={20} />
                <input 
                  type="text" name="fullName"
                  placeholder="Nhập họ tên..."
                  className="bg-transparent outline-none w-full text-sm"
                  value={formData.fullName} onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Email <span className="text-red-500">*</span></label>
              <div className="flex items-center px-4 py-3 bg-[#FAF5F7] rounded-xl border border-transparent focus-within:border-[#F295B6] transition-all">
                <HiOutlineMail className="text-gray-400 mr-2" fontSize={20} />
                <input 
                  type="email" name="email"
                  placeholder="example@email.com"
                  className="bg-transparent outline-none w-full text-sm"
                  value={formData.email} onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Hàng 2: Mật khẩu & SĐT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Mật khẩu <span className="text-red-500">*</span></label>
              <div className="flex items-center px-4 py-3 bg-[#FAF5F7] rounded-xl border border-transparent focus-within:border-[#F295B6] transition-all">
                <HiOutlineLockClosed className="text-gray-400 mr-2" fontSize={20} />
                <input 
                  type="password" name="password"
                  placeholder="Nhập mật khẩu..."
                  className="bg-transparent outline-none w-full text-sm"
                  value={formData.password} onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Số điện thoại</label>
              <div className="flex items-center px-4 py-3 bg-[#FAF5F7] rounded-xl border border-transparent focus-within:border-[#F295B6] transition-all">
                <HiOutlinePhone className="text-gray-400 mr-2" fontSize={20} />
                <input 
                  type="text" name="phoneNumber"
                  placeholder="0912..."
                  className="bg-transparent outline-none w-full text-sm"
                  value={formData.phoneNumber} onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Hàng 3: Vai trò */}
          <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Vai trò</label>
              <select 
                name="role"
                className="px-4 py-3 bg-[#FAF5F7] rounded-xl border border-transparent focus:border-[#F295B6] outline-none text-sm cursor-pointer"
                value={formData.role} onChange={handleChange}
              >
                <option value="USER">Người dùng (User)</option>
                <option value="ADMIN">Quản trị viên (Admin)</option>
              </select>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-4 mt-4">
            <button 
              type="button"
              onClick={() => navigate("/admin/users/list")}
              className="px-6 py-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors font-medium"
            >
              Hủy bỏ
            </button>
            <button 
              type="submit"
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-[#F295B6] text-white hover:bg-[#ffb8d1] transition-colors font-bold shadow-sm hover:shadow-md"
            >
              <FiSave fontSize={18} />
              Lưu người dùng
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default UserCreatePage;
