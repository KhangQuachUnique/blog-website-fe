import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Icons
import { CiSearch } from "react-icons/ci";
import { FiPlus, FiEdit3, FiTrash2, FiEye, FiLock, FiUnlock } from "react-icons/fi";
import { IoFilterOutline } from "react-icons/io5";

// MUI Components (Tận dụng lại thư viện bạn đã cài)
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, Select, MenuItem, FormControl, InputLabel 
} from "@mui/material";

// --- MOCK DATA (Dữ liệu giả để test giao diện) ---
const MOCK_USERS: IUser[] = [
  { id: 1, fullName: "Nguyễn Văn A", email: "vana@gmail.com", role: "USER", status: "ACTIVE" },
  { id: 2, fullName: "Trần Thị B", email: "btran@gmail.com", role: "ADMIN", status: "ACTIVE" },
  { id: 3, fullName: "Lê Văn C", email: "c_le@gmail.com", role: "USER", status: "BANNED", banReason: "Spam bài viết" },
  { id: 4, fullName: "Phạm D", email: "pham_d@yahoo.com", role: "USER", status: "ACTIVE" },
];

const UserListPage = () => {
  const navigate = useNavigate();
  
  // --- STATES ---
  const [users, setUsers] = useState<IUser[]>(MOCK_USERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL"); // ALL | ACTIVE | BANNED

  // State cho Modal Ban/Unban
  const [openBanModal, setOpenBanModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [banDuration, setBanDuration] = useState("1_WEEK"); // 1_DAY, 1_WEEK, 1_MONTH, PERMANENT
  const [banReason, setBanReason] = useState("");

  // State cho Modal Delete
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  // --- LOGIC TÌM KIẾM & LỌC ---
  // (Thực tế bạn sẽ gọi API ở đây, còn giờ mình filter trên Mock Data)
  const filteredUsers = users.filter((user) => {
    const matchSearch = 
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toString().includes(searchTerm);
    
    const matchFilter = filterStatus === "ALL" || user.status === filterStatus;

    return matchSearch && matchFilter;
  });

  // --- HANDLERS ---
  
  // 1. Xử lý Ban User
  const handleOpenBanModal = (user: IUser) => {
    setSelectedUser(user);
    setBanReason("");
    setBanDuration("1_WEEK");
    setOpenBanModal(true);
  };

  const handleConfirmBan = () => {
    if (!selectedUser) return;
    if (!banReason.trim()) {
      alert("Vui lòng nhập lý do khóa tài khoản!");
      return;
    }

    // TODO: Gọi API Ban user tại đây
    console.log("Ban User:", selectedUser.id, "Duration:", banDuration, "Reason:", banReason);

    // Cập nhật UI giả lập
    setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, status: "BANNED" } : u));
    setOpenBanModal(false);
  };

  // 2. Xử lý Unban User
  const handleUnban = (user: IUser) => {
    if(window.confirm(`Bạn có chắc muốn mở khóa cho ${user.fullName}?`)) {
       // TODO: Gọi API Unban
       console.log("Unban User:", user.id);
       setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: "ACTIVE" } : u));
    }
  }

  // 3. Xử lý Delete User
  const handleOpenDeleteModal = (user: IUser) => {
    setSelectedUser(user);
    setOpenDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedUser) return;
    // TODO: Gọi API Delete
    console.log("Delete User:", selectedUser.id);
    setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
    setOpenDeleteModal(false);
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm min-h-[80vh]">
      {/* --- HEADER: TITLE & ACTIONS --- */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#8C1D35] font-['Mona_Sans']">Quản lý người dùng</h1>
          <p className="text-gray-500 text-sm mt-1">Xem danh sách, phân quyền và quản lý trạng thái.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <button 
             onClick={() => navigate("/admin/users/create")} // Điều hướng sang trang Create
             className="flex items-center gap-2 bg-[#F295B6] text-white px-4 py-2 rounded-xl font-medium hover:bg-[#ffb8d1] transition-all"
           >
             <FiPlus fontSize={20} />
             <span>Thêm mới</span>
           </button>
        </div>
      </div>

      {/* --- TOOLBAR: SEARCH & FILTER --- */}
      <div className="flex flex-wrap items-center gap-4 mb-6 bg-[#FAF5F7] p-4 rounded-xl">
        {/* Search Bar custom theo style của bạn */}
        <div className="flex items-center px-4 py-2 bg-white border border-[#FFE4EC] rounded-xl gap-2 w-[300px] focus-within:border-[#F295B6] transition-colors">
            <input
                type="text"
                className="outline-none w-full text-sm text-gray-700 placeholder-gray-400"
                placeholder="Tìm theo tên, email, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <CiSearch fontSize={22} className="text-[#F295B6]" />
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-2">
            <IoFilterOutline className="text-[#F295B6]" />
            <select 
                className="px-4 py-2 bg-white border border-[#FFE4EC] rounded-xl text-sm text-[#8C1D35] focus:outline-none focus:border-[#F295B6] cursor-pointer"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
            >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="ACTIVE">Hoạt động (Active)</option>
                <option value="BANNED">Đã khóa (Banned)</option>
            </select>
        </div>
      </div>

      {/* --- TABLE DANH SÁCH --- */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#FFE4EC] text-[#8C1D35]">
              <th className="p-4 rounded-tl-xl font-semibold text-sm">ID</th>
              <th className="p-4 font-semibold text-sm">Thông tin người dùng</th>
              <th className="p-4 font-semibold text-sm">Vai trò</th>
              <th className="p-4 font-semibold text-sm">Trạng thái</th>
              <th className="p-4 rounded-tr-xl font-semibold text-sm text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
                    <tr 
                        key={user.id} 
                        className={`border-b border-gray-100 hover:bg-[#FFF5F8] transition-colors ${index === filteredUsers.length - 1 ? "border-none" : ""}`}
                    >
                      <td className="p-4 font-medium">#{user.id}</td>
                      <td className="p-4">
                        <div className="flex flex-col">
                            <span className="font-bold text-[#333]">{user.fullName}</span>
                            <span className="text-xs text-gray-500">{user.email}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.role === "ADMIN" ? "bg-purple-100 text-purple-600" : "bg-gray-100 text-gray-600"
                        }`}>
                            {user.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold flex w-fit items-center gap-1 ${
                            user.status === "ACTIVE" 
                                ? "bg-green-100 text-green-600" 
                                : "bg-red-100 text-red-600"
                        }`}>
                            {user.status === "ACTIVE" ? "Hoạt động" : "Đã khóa"}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                            {/* Nút Xem chi tiết */}
                            <button onClick={() => navigate(`/admin/users/detail/${user.id}`)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-[#F295B6]" title="Chi tiết">
                                <FiEye fontSize={18} />
                            </button>
                            
                            {/* Nút Sửa */}
                            <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-blue-500" title="Sửa">
                                <FiEdit3 fontSize={18} />
                            </button>

                            {/* Nút Khóa / Mở Khóa */}
                            {user.status === "ACTIVE" ? (
                                <button 
                                    onClick={() => handleOpenBanModal(user)}
                                    className="p-2 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-500" 
                                    title="Khóa tài khoản"
                                >
                                    <FiLock fontSize={18} />
                                </button>
                            ) : (
                                <button 
                                    onClick={() => handleUnban(user)}
                                    className="p-2 hover:bg-green-50 rounded-lg text-gray-500 hover:text-green-500" 
                                    title="Mở khóa"
                                >
                                    <FiUnlock fontSize={18} />
                                </button>
                            )}

                            {/* Nút Xóa */}
                            <button 
                                onClick={() => handleOpenDeleteModal(user)}
                                className="p-2 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-600" 
                                title="Xóa người dùng"
                            >
                                <FiTrash2 fontSize={18} />
                            </button>
                        </div>
                      </td>
                    </tr>
                ))
            ) : (
                <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                        Không tìm thấy người dùng nào.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- MODAL 1: BAN USER --- */}
      <Dialog open={openBanModal} onClose={() => setOpenBanModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: 'Mona Sans', fontWeight: 'bold', color: '#8C1D35' }}>
            Khóa tài khoản: {selectedUser?.fullName}
        </DialogTitle>
        <DialogContent>
            <div className="flex flex-col gap-4 mt-2">
                <p className="text-sm text-gray-600">
                    Hành động này sẽ ngăn người dùng truy cập vào hệ thống. Người dùng sẽ nhận được thông báo về lý do bị khóa.
                </p>
                
                {/* Chọn thời gian khóa */}
                <FormControl fullWidth size="small">
                    <InputLabel>Thời hạn khóa</InputLabel>
                    <Select
                        value={banDuration}
                        label="Thời hạn khóa"
                        onChange={(e) => setBanDuration(e.target.value)}
                    >
                        <MenuItem value="1_DAY">1 Ngày</MenuItem>
                        <MenuItem value="1_WEEK">1 Tuần</MenuItem>
                        <MenuItem value="1_MONTH">1 Tháng</MenuItem>
                        <MenuItem value="PERMANENT">Vĩnh viễn</MenuItem>
                    </Select>
                </FormControl>

                {/* Nhập lý do (Bắt buộc) */}
                <TextField
                    label="Lý do khóa (Bắt buộc)"
                    multiline
                    rows={3}
                    fullWidth
                    variant="outlined"
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    placeholder="VD: Vi phạm tiêu chuẩn cộng đồng..."
                />
            </div>
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px' }}>
            <Button onClick={() => setOpenBanModal(false)} sx={{ color: '#666' }}>Hủy</Button>
            <Button 
                onClick={handleConfirmBan} 
                variant="contained" 
                sx={{ bgcolor: '#d32f2f', '&:hover': { bgcolor: '#b71c1c' } }}
            >
                Xác nhận khóa
            </Button>
        </DialogActions>
      </Dialog>

      {/* --- MODAL 2: DELETE USER --- */}
      <Dialog open={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
        <DialogTitle sx={{ fontFamily: 'Mona Sans', fontWeight: 'bold' }}>Xác nhận xóa</DialogTitle>
        <DialogContent>
            Bạn có chắc chắn muốn xóa người dùng <strong>{selectedUser?.fullName}</strong>? 
            <br/>Hành động này không thể hoàn tác.
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px' }}>
            <Button onClick={() => setOpenDeleteModal(false)} sx={{ color: '#666' }}>Hủy</Button>
            <Button 
                onClick={handleConfirmDelete} 
                variant="contained" 
                color="error"
            >
                Xóa vĩnh viễn
            </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default UserListPage;