import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CiSearch } from "react-icons/ci";
import { FiPlus, FiEdit3, FiTrash2, FiEye, FiLock, FiUnlock } from "react-icons/fi";
import { IoFilterOutline } from "react-icons/io5";
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button
} from "@mui/material";
import { 
  getUserList, banUser, unbanUser, deleteUser, type IUser 
} from "../../../services/userService";
import { useToast } from "../../../contexts/toast";

const UserListPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [users, setUsers] = useState<IUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  const [openBanModal, setOpenBanModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [banLoading, setBanLoading] = useState(false);

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Lấy danh sách người dùng
  useEffect(() => {
    fetchUsers();
  }, [searchTerm, filterStatus]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getUserList({
        search: searchTerm || undefined,
        status: filterStatus !== "ALL" ? filterStatus : undefined,
      });
      setUsers(data || []);
    } catch (err) {
      showToast({ type: "error", message: err instanceof Error ? err.message : "Lỗi khi tải danh sách người dùng" });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users; // Backend đã filter, không cần filter lại client-side

  const handleOpenBanModal = (user: IUser) => {
    setSelectedUser(user);
    setOpenBanModal(true);
  };

  const handleConfirmBan = async () => {
    if (!selectedUser) return;

    setBanLoading(true);
    try {
      await banUser(selectedUser.id);
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, isBanned: true } : u));
      setOpenBanModal(false);
      showToast({ type: "success", message: "Khóa tài khoản thành công!" });
    } catch (err) {
      showToast({ type: "error", message: err instanceof Error ? err.message : "Lỗi khi khóa tài khoản" });
    } finally {
      setBanLoading(false);
    }
  };

  const handleUnban = async (user: IUser) => {
    if (!window.confirm(`Bạn có chắc muốn mở khóa cho ${user.username}?`)) return;
    
    try {
      await unbanUser(user.id);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isBanned: false } : u));
      showToast({ type: "success", message: "Mở khóa thành công!" });
    } catch (err) {
      showToast({ type: "error", message: err instanceof Error ? err.message : "Lỗi khi mở khóa" });
    }
  };

  const handleOpenDeleteModal = (user: IUser) => {
    setSelectedUser(user);
    setOpenDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    
    setDeleteLoading(true);
    try {
      await deleteUser(selectedUser.id);
      setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
      setOpenDeleteModal(false);
      showToast({ type: "success", message: "Xóa người dùng thành công!" });
    } catch (err) {
      showToast({ type: "error", message: err instanceof Error ? err.message : "Lỗi khi xóa người dùng" });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm min-h-[80vh]">
      {/* --- HEADER: TITLE & ACTIONS --- */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#8C1D35] font-['Mona_Sans']">Quản lý người dùng</h1>
          <p className="text-gray-500 text-sm mt-1">Xem danh sách, phân quyền và quản lý trạng thái.</p>
        </div>
        
        <button 
          onClick={() => navigate("/admin/users/create")}
          className="flex items-center gap-2 bg-[#F295B6] text-white px-4 py-2 rounded-xl font-medium hover:bg-[#ffb8d1] transition-all"
        >
          <FiPlus fontSize={20} />
          <span>Thêm mới</span>
        </button>
      </div>

      {/* --- TOOLBAR: SEARCH & FILTER --- */}
      <div className="flex flex-wrap items-center gap-4 mb-6 bg-[#FAF5F7] p-4 rounded-xl">
        {/* Search Bar custom  */}
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
            <option value="ACTIVE">Hoạt động</option>
            <option value="BANNED">Đã khóa</option>
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
              <th className="p-4 font-semibold text-sm">Trạng thái</th>
              <th className="p-4 rounded-tr-xl font-semibold text-sm text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {loading ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">Đang tải...</td>
              </tr>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => (
                <tr 
                  key={user.id} 
                  className={`border-b border-gray-100 hover:bg-[#FFF5F8] transition-colors ${index === filteredUsers.length - 1 ? "border-none" : ""}`}
                >
                  <td className="p-4 font-medium">#{user.id}</td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-[#333]">{user.username}</span>
                      <span className="text-xs text-gray-500">{user.email}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold flex w-fit items-center gap-1 ${
                      user.isBanned 
                        ? "bg-red-100 text-red-600" 
                        : user.type === "ADMIN" ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"
                    }`}>
                      {user.isBanned ? "Đã khóa" : user.type === "ADMIN" ? "Admin" : "User"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      {/* Nút Xem chi tiết */}
                      <button onClick={() => navigate(`/admin/users/detail/${user.id}`)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-[#F295B6]" title="Chi tiết">
                        <FiEye fontSize={18} />
                      </button>
                      
                      {/* Nút Sửa */}
                      <button onClick={() => navigate(`/admin/users/edit/${user.id}`)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-blue-500" title="Sửa">
                        <FiEdit3 fontSize={18} />
                      </button>

                      {/* Nút Khóa / Mở Khóa */}
                      {!user.isBanned ? (
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
                <td colSpan={4} className="p-8 text-center text-gray-500">
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
          Khóa tài khoản: {selectedUser?.username}
        </DialogTitle>
        <DialogContent>
          <div className="flex flex-col gap-4 mt-2">
            <p className="text-sm text-gray-600">
              Hành động này sẽ ngăn người dùng truy cập vào hệ thống.
            </p>
          </div>
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px' }}>
          <Button onClick={() => setOpenBanModal(false)} disabled={banLoading}>Hủy</Button>
          <Button 
            onClick={handleConfirmBan} 
            variant="contained"
            disabled={banLoading}
            sx={{ bgcolor: '#d32f2f', '&:hover': { bgcolor: '#b71c1c' } }}
          >
            {banLoading ? "Đang xử lý..." : "Xác nhận khóa"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- MODAL 2: DELETE USER --- */}
      <Dialog open={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
        <DialogTitle sx={{ fontFamily: 'Mona Sans', fontWeight: 'bold' }}>Xác nhận xóa</DialogTitle>
        <DialogContent>
          Bạn có chắc chắn muốn xóa người dùng <strong>{selectedUser?.username}</strong>? 
          <br/>Hành động này không thể hoàn tác.
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px' }}>
          <Button onClick={() => setOpenDeleteModal(false)} disabled={deleteLoading}>Hủy</Button>
          <Button 
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            disabled={deleteLoading}
          >
            {deleteLoading ? "Đang xóa..." : "Xóa vĩnh viễn"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default UserListPage;