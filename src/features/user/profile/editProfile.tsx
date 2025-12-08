import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { UpdateProfileData, ChangePasswordData, BlockedUser } from "../../../types/user.types";
import { IoArrowBack, IoSaveOutline, IoCloseOutline } from "react-icons/io5";
import { AiOutlineUser, AiOutlineLock, AiOutlineEye, AiOutlineUserDelete } from "react-icons/ai";
import { MdBlock } from "react-icons/md";
import * as userService from "../../../services/user/userService";
import { uploadFile } from "../../../services/upload/uploadImageService";
import { useAuth } from "../../../hooks/useAuth";

type TabType = "profile" | "password" | "privacy" | "blocked" | "delete";

const EditProfile = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Delete account modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Forgot password modal
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState<'email' | 'reset'>('email');
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [resetPasswordData, setResetPasswordData] = useState({
    verificationCode: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Profile data
  const [profileData, setProfileData] = useState<UpdateProfileData>({
    username: "",
    bio: "",
    avatarUrl: "",
    phoneNumber: "",
    dob: "",
    gender: undefined,
    showEmail: true,
    showPhoneNumber: false,
  });
  
  const [isPrivate, setIsPrivate] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Password data
  const [passwordData, setPasswordData] = useState<ChangePasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Blocked users
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);

  // Avatar upload
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setInitialLoading(true);
        const profile = await userService.getMyProfile();
        console.log('Fetched profile:', profile);
        setProfileData({
          username: profile.username || "",
          bio: profile.bio || "",
          avatarUrl: profile.avatarUrl || "",
          phoneNumber: profile.phoneNumber || "",
          dob: profile.dob || "",
          gender: profile.gender,
          showEmail: profile.showEmail !== undefined ? profile.showEmail : true,
          showPhoneNumber: profile.showPhoneNumber !== undefined ? profile.showPhoneNumber : false,
        });
        setIsPrivate(profile.isPrivate || false);
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        console.error('Error response:', err.response?.data);
        setError(err.response?.data?.message || err.message || "Không thể tải thông tin người dùng");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Fetch blocked users when switching to blocked tab
  useEffect(() => {
    if (activeTab === "blocked") {
      const fetchBlockedUsers = async () => {
        try {
          const users = await userService.getBlockedUsers();
          setBlockedUsers(users);
        } catch (err: any) {
          setError(err.message || "Không thể tải danh sách người dùng bị chặn");
        }
      };
      fetchBlockedUsers();
    }
  }, [activeTab]);

  const handleProfileChange = (field: keyof UpdateProfileData, value: any) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: keyof ChangePasswordData, value: string) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload file to server
      try {
        setLoading(true);
        const avatarUrl = await uploadFile(file);
        handleProfileChange("avatarUrl", avatarUrl);
        setSuccess("Ảnh đại diện đã được tải lên!");
        setTimeout(() => setSuccess(null), 3000);
      } catch (err: any) {
        setError(err.message || "Không thể tải ảnh lên");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      // Clean data: chuyển chuỗi rỗng thành undefined
      const cleanedData = {
        ...profileData,
        avatarUrl: profileData.avatarUrl || undefined,
        dob: profileData.dob || undefined,
        phoneNumber: profileData.phoneNumber || undefined,
        bio: profileData.bio || undefined,
      };
      await userService.updateMyProfile(cleanedData);
      setSuccess("Cập nhật hồ sơ thành công!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPasswordReset = async () => {
    setLoading(true);
    setError(null);
    try {
      await userService.requestPasswordReset(forgotPasswordEmail);
      setForgotPasswordStep('reset');
      setSuccess('Mã xác thực đã được gửi đến email của bạn!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    if (resetPasswordData.newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      await userService.resetPassword({
        email: forgotPasswordEmail,
        verificationCode: resetPasswordData.verificationCode,
        newPassword: resetPasswordData.newPassword
      });
      
      setSuccess('Mật khẩu đã được đặt lại thành công!');
      setShowForgotPasswordModal(false);
      setForgotPasswordStep('email');
      setForgotPasswordEmail('');
      setResetPasswordData({ verificationCode: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Mật khẩu mới không khớp");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      await userService.changePassword(passwordData);
      setSuccess("Đổi mật khẩu thành công!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const handleUnblockUser = async (userId: number) => {
    try {
      await userService.unblockUser(userId);
      setBlockedUsers((prev) => prev.filter((user) => user.id !== userId));
      setSuccess("Đã bỏ chặn người dùng");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra");
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    setError(null);
    try {
      await userService.deleteAccount();
      await logout();
      setShowDeleteModal(false);
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra");
      setLoading(false);
    }
  };

  const tabs = [
    { id: "profile" as TabType, label: "Thông tin cá nhân", icon: <AiOutlineUser fontSize={20} /> },
    { id: "password" as TabType, label: "Đổi mật khẩu", icon: <AiOutlineLock fontSize={20} /> },
    { id: "privacy" as TabType, label: "Quyền riêng tư", icon: <AiOutlineEye fontSize={20} /> },
    { id: "blocked" as TabType, label: "Quản lý chặn", icon: <MdBlock fontSize={20} /> },
    { id: "delete" as TabType, label: "Xóa tài khoản", icon: <AiOutlineUserDelete fontSize={20} /> },
  ];

  if (initialLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F295B6] mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải thông tin...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-[#FFEFF4] rounded-lg transition-colors duration-200"
        >
          <IoArrowBack fontSize={24} style={{ color: "#F295B6" }} />
        </button>
        <h1 className="text-3xl font-bold" style={{ color: "#8C1D35" }}>
          Quản lý hồ sơ
        </h1>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 bg-white rounded-2xl border border-[#FFE4EC] shadow-sm p-4">
          <div className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-[#FFEFF4] text-[#F295B6]"
                    : "text-gray-600 hover:bg-[#FFF8FB]"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-2xl border border-[#FFE4EC] shadow-sm p-8">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold" style={{ color: "#8C1D35" }}>
                Thông tin cá nhân
              </h2>

              {/* Avatar */}
              <div className="flex items-center gap-6">
                <img
                  src={avatarPreview || profileData.avatarUrl}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover border-4 border-[#FFE4EC]"
                />
                <div>
                  <label className="px-4 py-2 bg-[#F295B6] text-white font-semibold rounded-lg hover:bg-[#FFB8D1] cursor-pointer transition-colors duration-200">
                    Chọn ảnh mới
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-sm text-gray-500 mt-2">JPG, PNG, tối đa 5MB</p>
                </div>
              </div>

              {/* Form Fields */}
              <div>
                <label className="block text-sm font-semibold mb-2">Username</label>
                <input
                  type="text"
                  value={profileData.username}
                  onChange={(e) => handleProfileChange("username", e.target.value)}
                  className="w-full px-4 py-2 border border-[#FFE4EC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F295B6]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Số điện thoại</label>
                <input
                  type="tel"
                  value={profileData.phoneNumber}
                  onChange={(e) => handleProfileChange("phoneNumber", e.target.value)}
                  className="w-full px-4 py-2 border border-[#FFE4EC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F295B6]"
                  placeholder="0123456789"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Ngày sinh</label>
                <input
                  type="date"
                  value={profileData.dob}
                  onChange={(e) => handleProfileChange("dob", e.target.value)}
                  className="w-full px-4 py-2 border border-[#FFE4EC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F295B6]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Giới tính</label>
                <select
                  value={profileData.gender || ""}
                  onChange={(e) => handleProfileChange("gender", e.target.value as any)}
                  className="w-full px-4 py-2 border border-[#FFE4EC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F295B6]"
                >
                  <option value="">Chọn giới tính</option>
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                  <option value="OTHER">Khác</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Tiểu sử</label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => handleProfileChange("bio", e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-[#FFE4EC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F295B6]"
                  placeholder="Viết vài dòng về bản thân..."
                />
              </div>

              {/* Cài đặt hiển thị thông tin liên hệ */}
              <div className="border border-[#FFE4EC] rounded-lg p-4 space-y-4">
                <h3 className="text-lg font-bold" style={{ color: "#8C1D35" }}>
                  Cài đặt hiển thị thông tin
                </h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Hiển thị Email công khai</p>
                    <p className="text-sm text-gray-600">Người khác có thể xem email của bạn</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profileData.showEmail}
                      onChange={(e) => handleProfileChange("showEmail", e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F295B6]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Hiển thị Số điện thoại công khai</p>
                    <p className="text-sm text-gray-600">Người khác có thể xem số điện thoại của bạn</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profileData.showPhoneNumber}
                      onChange={(e) => handleProfileChange("showPhoneNumber", e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F295B6]"></div>
                  </label>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-[#F295B6] text-white font-bold rounded-lg hover:bg-[#FFB8D1] transition-colors duration-200 disabled:opacity-50"
                >
                  <IoSaveOutline fontSize={20} />
                  {loading ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  <IoCloseOutline fontSize={20} />
                  Hủy
                </button>
              </div>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === "password" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold" style={{ color: "#8C1D35" }}>
                Đổi mật khẩu
              </h2>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold">Mật khẩu hiện tại</label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPasswordModal(true)}
                    className="text-xs text-[#F295B6] hover:underline font-semibold"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                  className="w-full px-4 py-2 border border-[#FFE4EC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F295B6]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Mật khẩu mới</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                  className="w-full px-4 py-2 border border-[#FFE4EC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F295B6]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                  className="w-full px-4 py-2 border border-[#FFE4EC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F295B6]"
                />
              </div>

              <button
                onClick={handleChangePassword}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-[#F295B6] text-white font-bold rounded-lg hover:bg-[#FFB8D1] transition-colors duration-200 disabled:opacity-50"
              >
                <IoSaveOutline fontSize={20} />
                {loading ? "Đang lưu..." : "Đổi mật khẩu"}
              </button>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === "privacy" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold" style={{ color: "#8C1D35" }}>
                Quyền riêng tư
              </h2>

              <div className="border border-[#FFE4EC] rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-2">Hồ sơ riêng tư</h3>
                    <p className="text-gray-600 text-sm">
                      Khi bật chế độ riêng tư, chỉ bạn mới có thể xem hồ sơ và bài viết của mình.
                      Người khác sẽ không thể xem thông tin cá nhân của bạn.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      checked={isPrivate}
                      onChange={async () => {
                        try {
                          const result = await userService.togglePrivacy();
                          setIsPrivate(result.isPrivate);
                          setSuccess(result.isPrivate ? "Đã chuyển sang chế độ riêng tư" : "Đã công khai hồ sơ");
                          setTimeout(() => setSuccess(null), 3000);
                        } catch (err: any) {
                          setError(err.message || "Có lỗi xảy ra");
                        }
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#F295B6]"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Blocked Users Tab */}
          {activeTab === "blocked" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold" style={{ color: "#8C1D35" }}>
                Người dùng đã chặn
              </h2>

              {blockedUsers.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  Bạn chưa chặn người dùng nào
                </div>
              ) : (
                <div className="space-y-3">
                  {blockedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border border-[#FFE4EC] rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={user.avatarUrl || "https://i.pravatar.cc/300"}
                          alt={user.username}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <div className="font-bold">{user.username}</div>
                          <div className="text-sm text-gray-500">@{user.username}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleUnblockUser(user.id)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors duration-200"
                      >
                        Bỏ chặn
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Delete Account Tab */}
          {activeTab === "delete" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-red-600">Xóa tài khoản</h2>

              <div className="border border-red-200 rounded-lg p-6 bg-red-50">
                <h3 className="text-lg font-bold text-red-800 mb-2">⚠️ Cảnh báo</h3>
                <p className="text-red-700 mb-4">
                  Hành động này sẽ xóa vĩnh viễn tài khoản của bạn cùng với tất cả dữ liệu:
                </p>
                <ul className="list-disc list-inside text-red-700 space-y-1 mb-4">
                  <li>Tất cả bài viết và bình luận</li>
                  <li>Thông tin cá nhân</li>
                  <li>Danh sách người theo dõi và đang theo dõi</li>
                  <li>Lịch sử hoạt động</li>
                </ul>
                <p className="text-red-700 font-bold">
                  Hành động này không thể hoàn tác!
                </p>
              </div>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Xóa tài khoản của tôi
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 border-2 border-[#F295B6] shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold" style={{ color: "#8C1D35" }}>
                {forgotPasswordStep === 'email' ? 'Quên mật khẩu' : 'Đặt lại mật khẩu'}
              </h2>
              <button
                onClick={() => {
                  setShowForgotPasswordModal(false);
                  setForgotPasswordStep('email');
                  setError(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <IoCloseOutline fontSize={28} />
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            {forgotPasswordStep === 'email' ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                  Nhập email của bạn để nhận mã xác thực
                </p>
                <div>
                  <label className="block text-sm font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-[#FFE4EC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F295B6]"
                    placeholder="your@email.com"
                  />
                </div>
                <button
                  onClick={handleRequestPasswordReset}
                  disabled={loading || !forgotPasswordEmail}
                  className="w-full px-6 py-3 bg-[#F295B6] text-white font-bold rounded-lg hover:bg-[#FFB8D1] transition-colors duration-200 disabled:opacity-50"
                >
                  {loading ? 'Đang gửi...' : 'Gửi mã xác thực'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                  Nhập mã xác thực đã được gửi đến email và mật khẩu mới
                </p>
                <div>
                  <label className="block text-sm font-semibold mb-2">Mã xác thực (6 số)</label>
                  <input
                    type="text"
                    value={resetPasswordData.verificationCode}
                    onChange={(e) => setResetPasswordData({ ...resetPasswordData, verificationCode: e.target.value })}
                    className="w-full px-4 py-2 border border-[#FFE4EC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F295B6]"
                    placeholder="123456"
                    maxLength={6}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Mật khẩu mới</label>
                  <input
                    type="password"
                    value={resetPasswordData.newPassword}
                    onChange={(e) => setResetPasswordData({ ...resetPasswordData, newPassword: e.target.value })}
                    className="w-full px-4 py-2 border border-[#FFE4EC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F295B6]"
                    placeholder="Ít nhất 6 ký tự"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Xác nhận mật khẩu</label>
                  <input
                    type="password"
                    value={resetPasswordData.confirmPassword}
                    onChange={(e) => setResetPasswordData({ ...resetPasswordData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2 border border-[#FFE4EC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F295B6]"
                    placeholder="Nhập lại mật khẩu"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setForgotPasswordStep('email');
                      setResetPasswordData({ verificationCode: '', newPassword: '', confirmPassword: '' });
                      setError(null);
                    }}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors duration-200"
                  >
                    Quay lại
                  </button>
                  <button
                    onClick={handleResetPassword}
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-[#F295B6] text-white font-bold rounded-lg hover:bg-[#FFB8D1] transition-colors duration-200 disabled:opacity-50"
                  >
                    {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 border-2 border-red-500 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-red-600">
                ⚠️ Xác nhận xóa tài khoản
              </h2>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={loading}
              >
                <IoCloseOutline size={28} />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 mb-4 font-semibold">
                Bạn có chắc chắn muốn xóa tài khoản của mình?
              </p>
              <p className="text-red-600 mb-4">
                Hành động này sẽ xóa vĩnh viễn:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-2">
                <li>Tất cả bài viết và bình luận của bạn</li>
                <li>Thông tin cá nhân</li>
                <li>Danh sách người theo dõi và đang theo dõi</li>
                <li>Lịch sử hoạt động</li>
              </ul>
              <p className="text-red-700 font-bold text-center bg-red-50 p-3 rounded-lg">
                ⚠️ Hành động này không thể hoàn tác!
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50"
              >
                {loading ? 'Đang xóa...' : 'Xác nhận xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProfile;
