import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import type { UpdateProfileData, ChangePasswordData, BlockedUser } from "../../../types/user.types";
import { IoArrowBack, IoSaveOutline, IoCloseOutline } from "react-icons/io5";
import { AiOutlineUser, AiOutlineLock, AiOutlineEye, AiOutlineUserDelete } from "react-icons/ai";
import { MdBlock } from "react-icons/md";
import * as userService from "../../../services/user/userService";
import * as authService from "../../../services/auth";
import { useAuth } from "../../../hooks/useAuth";
import { useToast } from "../../../contexts/toast";
import Avatar from '@mui/material/Avatar';
import { stringAvatar } from '../../../utils/avatarHelper';
import "../../../styles/profile/profile.css";
import "../../../styles/profile/modal.css";
import "../../../styles/profile/sidebar.css";

type TabType = "profile" | "password" | "privacy" | "blocked" | "delete";

const EditProfile = () => {
  const navigate = useNavigate();
  const { logout, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [loading, setLoading] = useState(false);
  
  // Delete account modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Forgot password modal
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState<'email' | 'otp' | 'password'>('email');
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resetPasswordData, setResetPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [sendingOtp, setSendingOtp] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

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
      } catch (err: unknown) {
        console.error('Error fetching profile:', err);
        const error = err as { response?: { data?: { message?: string } }; message?: string };
        console.error('Error response:', error.response?.data);
        showToast({
          type: "error",
          message: error.response?.data?.message || error.message || "Không thể tải thông tin người dùng"
        });
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
        } catch (err: unknown) {
          showToast({
            type: "error",
            message: err instanceof Error ? err.message : "Không thể tải danh sách người dùng bị chặn"
          });
        }
      };
      fetchBlockedUsers();
    }
  }, [activeTab]);

  const handleProfileChange = (field: keyof UpdateProfileData, value: string | boolean | undefined) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: keyof ChangePasswordData, value: string) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Store file for later upload
      setAvatarFile(file);
      
      // Show preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      let uploadedAvatarUrl = profileData.avatarUrl;

      // Upload avatar first if there's a new file
      if (avatarFile) {
        const formData = new FormData();
        formData.append("file", avatarFile);
        
        // Upload using uploadFile from service
        const { uploadFile } = await import("../../../services/upload/uploadImageService");
        uploadedAvatarUrl = await uploadFile(formData);
        
        // Update profileData with new URL to keep the preview
        setProfileData(prev => ({ ...prev, avatarUrl: uploadedAvatarUrl }));
        
        // Clear file but keep preview
        setAvatarFile(null);
      }

      // Clean data: chuyển chuỗi rỗng thành undefined
      const cleanedData = {
        ...profileData,
        avatarUrl: uploadedAvatarUrl || undefined,
        dob: profileData.dob || undefined,
        phoneNumber: profileData.phoneNumber || undefined,
        bio: profileData.bio || undefined,
      };
      
      await userService.updateMyProfile(cleanedData);
      
      // Refresh user data in AuthContext to update avatar everywhere
      await refreshUser();
      
      showToast({ type: "success", message: "Cập nhật hồ sơ thành công!" });
      
      // Clear preview after successful update
      setAvatarPreview(null);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      showToast({
        type: "error",
        message: error.response?.data?.message || error.message || "Có lỗi xảy ra"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPasswordReset = async () => {
    if (!forgotPasswordEmail) {
      showToast({ type: "error", message: "Vui lòng nhập email" });
      return;
    }
    
    setSendingOtp(true);
    try {
      await authService.sendResetOtp(forgotPasswordEmail);
      setForgotPasswordStep('otp');
      showToast({ type: "success", message: "Mã OTP đã được gửi đến email của bạn" });
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      showToast({
        type: "error",
        message: error.response?.data?.message || error.message || "Có lỗi xảy ra"
      });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value && !/^\d+$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;
    
    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    
    const lastIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  const handleVerifyOtp = () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      showToast({ type: "error", message: "Vui lòng nhập đủ 6 số OTP" });
      return;
    }
    setForgotPasswordStep('password');
  };

  const handleResetPassword = async () => {
    const otpCode = otp.join("");
    
    if (!resetPasswordData.newPassword) {
      showToast({ type: "error", message: "Vui lòng nhập mật khẩu mới" });
      return;
    }
    if (resetPasswordData.newPassword.length < 8) {
      showToast({ type: "error", message: "Mật khẩu phải có ít nhất 8 ký tự" });
      return;
    }
    if (resetPasswordData.newPassword.length > 50) {
      showToast({ type: "error", message: "Mật khẩu không được quá 50 ký tự" });
      return;
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(resetPasswordData.newPassword)) {
      showToast({ type: "error", message: "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số" });
      return;
    }
    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      showToast({ type: "error", message: "Mật khẩu không khớp" });
      return;
    }
    
    setLoading(true);

    try {
      await authService.resetPassword(forgotPasswordEmail, otpCode, resetPasswordData.newPassword);
      
      showToast({ type: "success", message: "Mật khẩu đã được đặt lại thành công!" });
      setShowForgotPasswordModal(false);
      setForgotPasswordStep('email');
      setForgotPasswordEmail('');
      setOtp(["", "", "", "", "", ""]);
      setResetPasswordData({ newPassword: '', confirmPassword: '' });
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      showToast({ 
        type: "error", 
        message: error.response?.data?.message || error.message || "Có lỗi xảy ra" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword) {
      showToast({ type: "error", message: "Vui lòng nhập mật khẩu hiện tại" });
      return;
    }
    if (!passwordData.newPassword) {
      showToast({ type: "error", message: "Vui lòng nhập mật khẩu mới" });
      return;
    }
    if (passwordData.newPassword.length < 8) {
      showToast({ type: "error", message: "Mật khẩu phải có ít nhất 8 ký tự" });
      return;
    }
    if (passwordData.newPassword.length > 50) {
      showToast({ type: "error", message: "Mật khẩu không được quá 50 ký tự" });
      return;
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)) {
      showToast({ type: "error", message: "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số" });
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast({ type: "error", message: "Mật khẩu không khớp" });
      return;
    }
    
    setLoading(true);
    try {
      await userService.changePassword(passwordData);
      showToast({ type: "success", message: "Đổi mật khẩu thành công!" });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      showToast({ 
        type: "error", 
        message: error.response?.data?.message || error.message || "Có lỗi xảy ra" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnblockUser = async (userId: number) => {
    try {
      await userService.unblockUser(userId);
      setBlockedUsers((prev) => prev.filter((user) => user.id !== userId));
      showToast({ type: "success", message: "Đã bỏ chặn người dùng" });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      showToast({
        type: "error",
        message: error.response?.data?.message || error.message || "Có lỗi xảy ra"
      });
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      await userService.deleteAccount();
      await logout();
      setShowDeleteModal(false);
      navigate("/");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      showToast({
        type: "error",
        message: error.response?.data?.message || error.message || "Có lỗi xảy ra"
      });
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
            <div className="profile-loading-spinner mx-auto mb-4"></div>
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

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="profile-sidebar">
          <div className="profile-sidebar-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`profile-sidebar-tab ${
                  activeTab === tab.id ? "profile-sidebar-tab-active" : ""
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 profile-card profile-card-header">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold" style={{ color: "#8C1D35" }}>
                Thông tin cá nhân
              </h2>

              {/* Avatar */}
              <div className="flex items-center gap-6">
                {avatarPreview || profileData.avatarUrl ? (
                  <img
                    src={avatarPreview || profileData.avatarUrl}
                    alt="Avatar"
                    className="profile-avatar profile-avatar-md"
                  />
                ) : (
                  <Avatar {...stringAvatar(profileData.username || 'User', 80, '1.8rem')} />
                )}
                <div>
                  <label className="profile-btn-primary cursor-pointer">
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
                <label className="profile-label">Username</label>
                <input
                  type="text"
                  value={profileData.username}
                  onChange={(e) => handleProfileChange("username", e.target.value)}
                  className="profile-input"
                />
              </div>

              <div>
                <label className="profile-label">Số điện thoại</label>
                <input
                  type="tel"
                  value={profileData.phoneNumber}
                  onChange={(e) => handleProfileChange("phoneNumber", e.target.value)}
                  className="profile-input"
                  placeholder="0123456789"
                />
              </div>

              <div>
                <label className="profile-label">Ngày sinh</label>
                <input
                  type="date"
                  value={profileData.dob}
                  onChange={(e) => handleProfileChange("dob", e.target.value)}
                  className="profile-input"
                />
              </div>

              <div>
                <label className="profile-label">Giới tính</label>
                <select
                  value={profileData.gender || ""}
                  onChange={(e) => handleProfileChange("gender", e.target.value as 'MALE' | 'FEMALE' | 'OTHER' | undefined)}
                  className="profile-input"
                >
                  <option value="">Chọn giới tính</option>
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                </select>
              </div>

              <div>
                <label className="profile-label">Tiểu sử</label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => handleProfileChange("bio", e.target.value)}
                  rows={4}
                  className="profile-input"
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
                    <div className="profile-toggle"></div>
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
                    <div className="profile-toggle"></div>
                  </label>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="profile-btn-primary"
                >
                  <IoSaveOutline fontSize={20} />
                  {loading ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
                <button
                  onClick={() => navigate(-1)}
                  className="profile-btn-secondary"
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
                  <label className="profile-label mb-0">Mật khẩu hiện tại</label>
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
                  className="profile-input"
                />
              </div>

              <div>
                <label className="profile-label">Mật khẩu mới</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                  className="profile-input"
                />
              </div>

              <div>
                <label className="profile-label">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                  className="profile-input"
                />
              </div>

              <button
                onClick={handleChangePassword}
                disabled={loading}
                className="profile-btn-primary"
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
                          showToast({
                            type: "success",
                            message: result.isPrivate ? "Đã chuyển sang chế độ riêng tư" : "Đã công khai hồ sơ"
                          });
                        } catch (err: unknown) {
                          const error = err as { response?: { data?: { message?: string } }; message?: string };
                          showToast({
                            type: "error",
                            message: error.response?.data?.message || error.message || "Có lỗi xảy ra"
                          });
                        }
                      }}
                      className="sr-only peer"
                    />
                    <div className="profile-toggle-lg"></div>
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
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.username}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <Avatar {...stringAvatar(user.username, 48, '1.2rem')} />
                        )}
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
                className="profile-btn-danger"
              >
                Xóa tài khoản của tôi
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="profile-modal-overlay">
          <div className="profile-modal profile-modal-border-primary">
            <div className="profile-modal-header">
              <h2 className="profile-modal-title profile-modal-title-primary">
                {forgotPasswordStep === 'email' && 'Quên mật khẩu'}
                {forgotPasswordStep === 'otp' && 'Xác thực OTP'}
                {forgotPasswordStep === 'password' && 'Đặt mật khẩu mới'}
              </h2>
              <button
                onClick={() => {
                  setShowForgotPasswordModal(false);
                  setForgotPasswordStep('email');
                  setOtp(["", "", "", "", "", ""]);
                  setResetPasswordData({ newPassword: '', confirmPassword: '' });
                }}
                className="profile-modal-close-btn"
              >
                <IoCloseOutline fontSize={28} />
              </button>
            </div>

            {/* Step 1: Email */}
            {forgotPasswordStep === 'email' && (
              <div className="profile-modal-form">
                <p className="profile-modal-form-hint">
                  Nhập email của bạn để nhận mã OTP
                </p>
                <div>
                  <label className="profile-label">Email</label>
                  <input
                    type="email"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    className="profile-input"
                    placeholder="your@email.com"
                  />
                </div>
                <button
                  onClick={handleRequestPasswordReset}
                  disabled={sendingOtp || !forgotPasswordEmail}
                  className="profile-modal-btn-full profile-modal-btn-primary"
                >
                  {sendingOtp ? 'Đang gửi...' : 'Gửi mã OTP'}
                </button>
              </div>
            )}

            {/* Step 2: OTP */}
            {forgotPasswordStep === 'otp' && (
              <div className="profile-modal-form">
                <p className="profile-modal-form-hint">
                  Nhập mã OTP đã gửi đến {forgotPasswordEmail}
                </p>
                <div>
                  <label className="profile-label text-center block mb-3">Mã OTP</label>
                  <div className="flex justify-center gap-2">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => { inputRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        className="w-12 h-14 text-center text-xl font-bold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F295B6] focus:border-[#F295B6]"
                        style={{ borderColor: '#FFE4EC' }}
                      />
                    ))}
                  </div>
                </div>
                <button
                  onClick={handleVerifyOtp}
                  className="profile-modal-btn-full profile-modal-btn-primary"
                >
                  Tiếp tục
                </button>
                <button
                  onClick={handleRequestPasswordReset}
                  disabled={sendingOtp}
                  className="w-full py-2 font-medium text-[#F295B6] border border-[#F295B6] rounded-lg hover:bg-[#FFF8FB] transition-colors disabled:opacity-60"
                >
                  {sendingOtp ? 'Đang gửi...' : 'Gửi lại mã OTP'}
                </button>
              </div>
            )}

            {/* Step 3: New Password */}
            {forgotPasswordStep === 'password' && (
              <div className="profile-modal-form">
                <p className="profile-modal-form-hint">
                  Nhập mật khẩu mới cho tài khoản của bạn
                </p>
                <div>
                  <label className="profile-label">Mật khẩu mới</label>
                  <input
                    type="password"
                    value={resetPasswordData.newPassword}
                    onChange={(e) => setResetPasswordData({ ...resetPasswordData, newPassword: e.target.value })}
                    onFocus={() => showToast({ type: "info", message: "Mật khẩu phải có 8-50 ký tự, chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số" })}
                    className="profile-input"
                    placeholder="Tối thiểu 8 ký tự, có chữ hoa, thường và số"
                  />
                </div>
                <div>
                  <label className="profile-label">Xác nhận mật khẩu</label>
                  <input
                    type="password"
                    value={resetPasswordData.confirmPassword}
                    onChange={(e) => setResetPasswordData({ ...resetPasswordData, confirmPassword: e.target.value })}
                    className="profile-input"
                    placeholder="Nhập lại mật khẩu"
                  />
                </div>
                <button
                  onClick={handleResetPassword}
                  disabled={loading}
                  className="profile-modal-btn-full profile-modal-btn-primary"
                >
                  {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="profile-modal-overlay">
          <div className="profile-modal profile-modal-border-danger">
            <div className="profile-modal-header">
              <h2 className="profile-modal-title profile-modal-title-danger">
                ⚠️ Xác nhận xóa tài khoản
              </h2>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="profile-modal-close-btn"
                disabled={loading}
              >
                <IoCloseOutline size={28} />
              </button>
            </div>

            <div className="mb-6">
              <p className="profile-modal-text profile-modal-text-bold">
                Bạn có chắc chắn muốn xóa tài khoản của mình?
              </p>
              <p className="profile-modal-text-danger">
                Hành động này sẽ xóa vĩnh viễn:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-2">
                <li>Tất cả bài viết và bình luận của bạn</li>
                <li>Thông tin cá nhân</li>
                <li>Danh sách người theo dõi và đang theo dõi</li>
                <li>Lịch sử hoạt động</li>
              </ul>
              <p className="profile-modal-warning-box">
                ⚠️ Hành động này không thể hoàn tác!
              </p>
            </div>

            <div className="profile-modal-btn-container">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={loading}
                className="profile-modal-btn-flex profile-modal-btn-secondary"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="profile-modal-btn-flex profile-modal-btn-danger"
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
