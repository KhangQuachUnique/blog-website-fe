import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CiSearch } from "react-icons/ci";
import {
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiEye,
  FiLock,
  FiUnlock,
} from "react-icons/fi";
import { IoFilterOutline } from "react-icons/io5";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import {
  getUserList,
  banUser,
  unbanUser,
  deleteUser,
  type IUser,
} from "../../../services/userService";
import { useToast } from "../../../contexts/toast";
import {
  CreateUserModal,
  EditUserModal,
  DetailUserModal,
} from "./UserModals";

// Custom hook cho debounce
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const UserListPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [users, setUsers] = useState<IUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("id");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("ASC");
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // Debounce search term (300ms)
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Modal states
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);

  const [openBanModal, setOpenBanModal] = useState(false);
  const [banLoading, setBanLoading] = useState(false);

  const [openUnbanModal, setOpenUnbanModal] = useState(false);
  const [unbanLoading, setUnbanLoading] = useState(false);

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Lấy danh sách người dùng
  useEffect(() => {
    fetchUsers();
  }, [debouncedSearchTerm, filterStatus, currentPage, sortBy, sortOrder]);

  // Reset về trang 1 khi search hoặc filter thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, filterStatus]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // 🔄 Backend xử lý pagination (Server-side)
      const response = await getUserList({
        search: debouncedSearchTerm || undefined,
        status: filterStatus !== "ALL" ? filterStatus : undefined,
        page: currentPage,
        limit: itemsPerPage,
        sortBy,
        sortOrder,
      });
      setUsers(response.data || []);
      setTotalPages(response.totalPages || 1);
    } catch (err) {
      showToast({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Lỗi khi tải danh sách người dùng",
      });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Modal handlers
  const handleOpenDetail = (user: IUser) => {
    setSelectedUser(user);
    setOpenDetailModal(true);
  };

  const handleOpenEdit = (user: IUser) => {
    setSelectedUser(user);
    setOpenEditModal(true);
  };

  const handleOpenBanModal = (user: IUser) => {
    setSelectedUser(user);
    setOpenBanModal(true);
  };

  const handleConfirmBan = async () => {
    if (!selectedUser) return;

    setBanLoading(true);
    try {
      const result = await banUser(selectedUser.id);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id
            ? { ...u, ...result.user, isBanned: true }
            : u
        )
      );
      setOpenBanModal(false);
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
    }
  };

  const handleOpenUnbanModal = (user: IUser) => {
    setSelectedUser(user);
    setOpenUnbanModal(true);
  };

  const handleConfirmUnban = async () => {
    if (!selectedUser) return;

    setUnbanLoading(true);
    try {
      const result = await unbanUser(selectedUser.id);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id ? { ...u, ...result.user, isBanned: false } : u
        )
      );
      setOpenUnbanModal(false);
      showToast({
        type: "success",
        message: `Đã mở khóa cho người dùng ${selectedUser.username} thành công`,
      });
    } catch (err) {
      showToast({
        type: "error",
        message: err instanceof Error ? err.message : "Lỗi khi mở khóa",
      });
    } finally {
      setUnbanLoading(false);
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
      const result = await deleteUser(selectedUser.id);
      setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
      setOpenDeleteModal(false);
      showToast({
        type: "success",
        message: result.message || "Xóa người dùng thành công!",
      });
    } catch (err) {
      showToast({
        type: "error",
        message: err instanceof Error ? err.message : "Lỗi khi xóa người dùng",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm min-h-[80vh]">
      {/* --- HEADER: TITLE & ACTIONS --- */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#8C1D35] font-['Mona_Sans']">
            Quản lý người dùng
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Xem danh sách, phân quyền và quản lý trạng thái.
          </p>
        </div>

        <button
          onClick={() => setOpenCreateModal(true)}
          className="flex items-center gap-2 bg-[#F295B6] text-white px-4 py-2 rounded-xl font-medium hover:bg-[#ffb8d1] transition-all"
        >
          <FiPlus fontSize={20} />
          <span>Thêm mới</span>
        </button>
      </div>

      {/* --- TOOLBAR: SEARCH & FILTER --- */}
      <div className="flex flex-wrap items-center gap-4 mb-6 bg-[#FAF5F7] p-4 rounded-xl">
        {/* Search Bar */}
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
              <th className="p-4 font-semibold text-sm">
                Thông tin người dùng
              </th>
              <th className="p-4 font-semibold text-sm">Vai trò</th>
              <th className="p-4 font-semibold text-sm">Trạng thái</th>
              <th className="p-4 rounded-tr-xl font-semibold text-sm text-center">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  Đang tải...
                </td>
              </tr>
            ) : users.length > 0 ? (
              users.map((user, index) => (
                <tr
                  key={user.id}
                  className={`border-b border-gray-100 hover:bg-[#FFF5F8] transition-colors ${
                    index === users.length - 1 ? "border-none" : ""
                  }`}
                >
                  <td className="p-4 font-medium">#{user.id}</td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-[#333]">
                        {user.username}
                      </span>
                      <span className="text-xs text-gray-500">
                        {user.email}
                      </span>
                    </div>
                  </td>
                  {/* Cột Vai trò */}
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold flex w-fit items-center gap-1 ${
                        user.type === "ADMIN"
                          ? "bg-purple-100 text-purple-600"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {user.type === "ADMIN" ? "Admin" : "User"}
                    </span>
                  </td>
                  {/* Cột Trạng thái */}
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold flex w-fit items-center gap-1 ${
                        user.isBanned
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {user.isBanned ? "Đã khóa" : "Hoạt động"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      {/* Nút Xem chi tiết */}
                      <button
                        onClick={() => handleOpenDetail(user)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-[#F295B6]"
                        title="Chi tiết"
                      >
                        <FiEye fontSize={18} />
                      </button>

                      {/* Nút Sửa */}
                      <button
                        onClick={() => handleOpenEdit(user)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-blue-500"
                        title="Sửa"
                      >
                        <FiEdit3 fontSize={18} />
                      </button>

                      {/* Nút Khóa / Mở Khóa - không hiển thị cho Admin */}
                      {user.type !== "ADMIN" &&
                        (!user.isBanned ? (
                          <button
                            onClick={() => handleOpenBanModal(user)}
                            className="p-2 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-500"
                            title="Khóa tài khoản"
                          >
                            <FiLock fontSize={18} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenUnbanModal(user)}
                            className="p-2 hover:bg-green-50 rounded-lg text-gray-500 hover:text-green-500"
                            title="Mở khóa"
                          >
                            <FiUnlock fontSize={18} />
                          </button>
                        ))}

                      {/* Nút Xóa - không hiển thị cho Admin */}
                      {user.type !== "ADMIN" && (
                        <button
                          onClick={() => handleOpenDeleteModal(user)}
                          className="p-2 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-600"
                          title="Xóa người dùng"
                        >
                          <FiTrash2 fontSize={18} />
                        </button>
                      )}
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

      {/* --- PAGINATION --- */}
      {!loading && users.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Trước
          </button>

          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentPage === page
                    ? "bg-[#F295B6] text-white font-bold"
                    : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Sau
          </button>
        </div>
      )}

      {/* --- MODALS FROM UserModals.tsx --- */}
      <CreateUserModal
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        onSuccess={fetchUsers}
      />

      <EditUserModal
        open={openEditModal}
        user={selectedUser}
        onClose={() => setOpenEditModal(false)}
        onSuccess={fetchUsers}
      />

      <DetailUserModal
        open={openDetailModal}
        user={selectedUser}
        onClose={() => setOpenDetailModal(false)}
        onEdit={handleOpenEdit}
      />

      {/* --- MODAL: BAN USER --- */}
      <Dialog
        open={openBanModal}
        onClose={() => setOpenBanModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{ fontFamily: "Mona Sans", fontWeight: "bold", color: "#8C1D35" }}
        >
          Khóa tài khoản: {selectedUser?.username}
        </DialogTitle>
        <DialogContent>
          <div className="flex flex-col gap-4 mt-2">
            <p className="text-sm text-gray-600">
              Hành động này sẽ ngăn người dùng truy cập vào hệ thống.
            </p>
          </div>
        </DialogContent>
        <DialogActions sx={{ padding: "16px 24px" }}>
          <Button onClick={() => setOpenBanModal(false)} disabled={banLoading}>
            Hủy
          </Button>
          <Button
            onClick={handleConfirmBan}
            variant="contained"
            disabled={banLoading}
            sx={{ bgcolor: "#d32f2f", "&:hover": { bgcolor: "#b71c1c" } }}
          >
            {banLoading ? "Đang xử lý..." : "Xác nhận khóa"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- MODAL: UNBAN USER --- */}
      <Dialog
        open={openUnbanModal}
        onClose={() => setOpenUnbanModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{ fontFamily: "Mona Sans", fontWeight: "bold", color: "#16a34a" }}
        >
          Mở khóa tài khoản: {selectedUser?.username}
        </DialogTitle>
        <DialogContent>
          <div className="flex flex-col gap-4 mt-2">
            <p className="text-sm text-gray-600">
              Bạn có chắc muốn mở khóa cho: {selectedUser?.username}?
            </p>
          </div>
        </DialogContent>
        <DialogActions sx={{ padding: "16px 24px" }}>
          <Button
            onClick={() => setOpenUnbanModal(false)}
            disabled={unbanLoading}
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirmUnban}
            variant="contained"
            disabled={unbanLoading}
            sx={{ bgcolor: "#16a34a", "&:hover": { bgcolor: "#15803d" } }}
          >
            {unbanLoading ? "Đang xử lý..." : "Xác nhận mở khóa"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- MODAL: DELETE USER --- */}
      <Dialog open={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
        <DialogTitle sx={{ fontFamily: "Mona Sans", fontWeight: "bold" }}>
          Xác nhận xóa
        </DialogTitle>
        <DialogContent>
          <p className="text-sm text-gray-700">
            Bạn có chắc muốn xóa người dùng{" "}
            <strong>{selectedUser?.username}</strong>?
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
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            disabled={deleteLoading}
          >
            {deleteLoading ? "Đang xóa..." : "Xác nhận"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default UserListPage;