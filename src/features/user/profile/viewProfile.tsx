import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as userService from "../../../services/user/userService";
import { MdGroup } from "react-icons/md";
import { BsFileText } from "react-icons/bs";
import { BsGenderMale } from "react-icons/bs";
import { BsGenderFemale } from "react-icons/bs";
import { Users, ShieldOff, ShieldCheck } from "lucide-react";
import Card from "../../../components/card/Card";
import "../../../styles/profile/profile.css";
import "../../../styles/profile/tabs.css";
import Avatar from "@mui/material/Avatar";
import { stringAvatar } from "../../../utils/avatarHelper";
import { MdEmail, MdPhone } from "react-icons/md";
import CustomButton from "../../../components/button";
import { useToast } from "../../../contexts/toast";
import { useLoginRequired } from "../../../hooks/useLoginRequired";
import { useAuth } from "../../../hooks/useAuth";
import { useGetUserProfile } from "../../../hooks/useUser";
import FollowModal from "../../../components/profile/FollowModal";
import ProfileSkeleton from "../../../components/skeleton/ProfileSkeleton";
import { MoreButton } from "../../../components/moreButton";

const ViewProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { requireLogin } = useLoginRequired();
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"posts" | "communities">("posts");
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);
  const [followModalOpen, setFollowModalOpen] = useState(false);
  const [followModalType, setFollowModalType] = useState<
    "followers" | "following"
  >("followers");
  const [isBlocked, setIsBlocked] = useState(false);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        // setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const {
    data: fetchedProfile,
    isLoading: queryLoading,
    error: queryError,
  } = useGetUserProfile(Number(userId));

  useEffect(() => {
    setLoading(queryLoading);

    if (fetchedProfile) {
      setIsFollowing(fetchedProfile.isFollowing || false);
      setFollowersCount(fetchedProfile.followersCount);
      setIsOwnProfile(userId ? currentUser?.id === Number(userId) : true);
    } else if (!queryLoading && queryError) {
      showToast({
        type: "error",
        message: queryError.message || "Không thể tải thông tin hồ sơ",
      });
    }
  }, [
    fetchedProfile,
    queryLoading,
    queryError,
    userId,
    currentUser?.id,
    showToast,
  ]);

  const handleFollowToggle = async () => {
    if (!fetchedProfile || isOwnProfile) return;

    if (
      !requireLogin({ message: "Vui lòng đăng nhập để theo dõi người dùng" })
    ) {
      return;
    }

    setFollowLoading(true);
    try {
      if (isFollowing) {
        await userService.unfollowUser(fetchedProfile.id);
        setIsFollowing(false);
        setFollowersCount((prev) => prev - 1);
        showToast({ type: "success", message: "Đã unfollow người dùng" });
      } else {
        await userService.followUser(fetchedProfile.id);
        setIsFollowing(true);
        setFollowersCount((prev) => prev + 1);
        showToast({ type: "success", message: "Đã follow người dùng" });
      }
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      showToast({
        type: "error",
        message:
          error.response?.data?.message || error.message || "Có lỗi xảy ra",
      });
    } finally {
      setFollowLoading(false);
    }
  };

  const handleBlockToggle = async () => {
    if (!fetchedProfile || isOwnProfile) return;

    if (!requireLogin({ message: "Vui lòng đăng nhập để chặn người dùng" })) {
      return;
    }

    try {
      if (isBlocked) {
        await userService.unblockUser(fetchedProfile.id);
        setIsBlocked(false);
        showToast({ type: "success", message: "Đã bỏ chặn người dùng" });
      } else {
        await userService.blockUser(fetchedProfile.id);
        setIsBlocked(true);
        setIsFollowing(false);
        showToast({ type: "success", message: "Đã chặn người dùng" });
      }
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      showToast({
        type: "error",
        message:
          error.response?.data?.message || error.message || "Có lỗi xảy ra",
      });
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!fetchedProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-500">
          Không tìm thấy hồ sơ người dùng
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Profile Header */}
      <div className="profile-card profile-card-header mb-6">
        <div className="flex flex-col items-start md:items-center">
          {/* Cover Image with fixed aspect ratio */}
          <div className="w-full h-[200px] sm:h-[250px] md:h-[300px] overflow-hidden bg-gray-200">
            {fetchedProfile.coverImageUrl ? (
              <img
                src={fetchedProfile.coverImageUrl}
                alt={`${fetchedProfile.username} cover`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-gray-200 to-gray-300 flex items-center justify-center">
                <span className="text-gray-400 text-lg">Chưa có ảnh bìa</span>
              </div>
            )}
          </div>
          <div className="flex flex-col max-w-[90%] w-[900px]">
            <div className="flex gap-2 h-25">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {fetchedProfile.avatarUrl ? (
                  <Avatar
                    src={fetchedProfile.avatarUrl}
                    alt={fetchedProfile.username}
                    sx={{
                      width: 160,
                      height: 160,
                      transform: "translateY(-50%)",
                      border: "4px solid white",
                    }}
                  />
                ) : (
                  <Avatar
                    {...stringAvatar(
                      fetchedProfile.username,
                      160,
                      "2.5rem",
                      "translateY(-50%)",
                      "4px solid white"
                    )}
                  />
                )}
              </div>
              {/* User name */}
              <div className="flex-1">
                <div className="flex flex-col">
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-gray-800">
                      {fetchedProfile.username}
                    </h1>
                    {fetchedProfile.gender && (
                      <div>
                        {fetchedProfile.gender === "MALE" ? (
                          <BsGenderMale className="text-base text-blue-500" />
                        ) : fetchedProfile.gender === "FEMALE" ? (
                          <BsGenderFemale className="text-base text-pink-500" />
                        ) : null}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    {/* Ngày tham gia */}
                    {fetchedProfile.joinAt && (
                      <div className="flex items-center gap-1 text-gray-500 font-medium">
                        <span>
                          Tham gia{" "}
                          {new Date(fetchedProfile.joinAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center mt-2 gap-3">
                {!isOwnProfile && (
                  <>
                    <MoreButton
                      menuItems={[
                        {
                          label: isBlocked ? "Bỏ chặn" : "Chặn người dùng",
                          icon: isBlocked ? (
                            <ShieldCheck size={16} strokeWidth={2.5} />
                          ) : (
                            <ShieldOff size={16} strokeWidth={2.5} />
                          ),
                          onClick: handleBlockToggle,
                          danger: !isBlocked,
                        },
                      ]}
                      buttonSize="medium"
                      iconSize={22}
                      tooltip="Tùy chọn"
                    />
                    <CustomButton
                      variant={isFollowing ? "default" : "outline"}
                      style={{
                        color: isFollowing ? "#fff" : "#f295b6",
                        borderColor: "#f295b6",
                        backgroundColor: isFollowing
                          ? "#f295b6"
                          : "transparent",
                      }}
                      onClick={handleFollowToggle}
                      disabled={followLoading || isBlocked}
                    >
                      {followLoading
                        ? "Đang xử lý..."
                        : isFollowing
                        ? "Đã theo dõi"
                        : "Theo dõi"}
                    </CustomButton>
                  </>
                )}
              </div>
            </div>
            {/* Container chính: Dùng flex-col và gap-2 để mọi dòng cách nhau ĐỀU 8px */}
            <div className="flex flex-col gap-2 text-lg text-gray-500">
              {/* --- 1. Email --- */}
              {fetchedProfile.email &&
                (isOwnProfile || fetchedProfile.showEmail) && (
                  <div className="flex items-center gap-2">
                    <MdEmail className="text-2xl shrink-0" />
                    <span>{fetchedProfile.email}</span>
                    {!isOwnProfile && (
                      <span className="text-xs text-gray-400 italic"></span>
                    )}
                  </div>
                )}

              {/* --- 2. Số điện thoại --- */}
              {fetchedProfile.phoneNumber &&
                (isOwnProfile || fetchedProfile.showPhoneNumber) && (
                  <div className="flex items-center gap-2">
                    <MdPhone className="text-2xl shrink-0" />
                    <span>{fetchedProfile.phoneNumber}</span>
                    {!isOwnProfile && (
                      <span className="text-xs text-gray-400 italic"></span>
                    )}
                  </div>
                )}
            </div>
            {fetchedProfile.bio && (
              <p className="text-gray-700 max-h-24 overflow-auto my-6">
                {fetchedProfile.bio}
              </p>
            )}
            {/* Stats */}
            <div className="flex gap-6 my-6">
              <div className="flex items-center gap-2"></div>
              <div
                className="flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity"
                onClick={() => {
                  setFollowModalType("followers");
                  setFollowModalOpen(true);
                }}
              >
                <div className="profile-stat-value !text-[20px]">
                  {followersCount}
                </div>
                <div className="profile-stat-label">Người theo dõi</div>
              </div>
              <div
                className="flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity"
                onClick={() => {
                  setFollowModalType("following");
                  setFollowModalOpen(true);
                }}
              >
                <div className="profile-stat-value !text-[20px]">
                  {fetchedProfile.followingCount}
                </div>
                <div className="profile-stat-label">Đang theo dõi</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="profile-card w-full overflow-hidden">
        <div className="profile-tab-nav w-[900px] mx-auto">
          <button
            onClick={() => setActiveTab("posts")}
            className={`profile-tab-nav-item ${
              activeTab === "posts" ? "profile-tab-nav-item-active" : ""
            } rounded-l-lg`}
          >
            <BsFileText className="profile-tab-nav-icon" />
            Bài viết ({fetchedProfile.posts.length})
          </button>
          <button
            onClick={() => setActiveTab("communities")}
            className={`profile-tab-nav-item ${
              activeTab === "communities" ? "profile-tab-nav-item-active" : ""
            } rounded-r-lg`}
          >
            <MdGroup className="profile-tab-nav-icon" />
            Cộng đồng ({fetchedProfile.communities.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="profile-tab-content">
          {activeTab === "posts" && (
            <div className="w-full flex flex-col items-center gap-5">
              {fetchedProfile.posts.length === 0 ? (
                <div className="profile-tab-empty">Chưa có bài viết nào</div>
              ) : (
                fetchedProfile.posts.map((post) => (
                  <div className="w-[900px]" key={post.id}>
                    <Card key={post.id} post={post} />
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "communities" && (
            <div className="space-y-4 w-[900px] mx-auto">
              {fetchedProfile.communities.length === 0 ? (
                <div className="profile-tab-empty">
                  Chưa tham gia cộng đồng nào
                </div>
              ) : (
                fetchedProfile.communities.map((community) => (
                  <button
                    key={community.id}
                    onClick={() => navigate(`/community/${community.id}`)}
                    className="bg-white text-gray-900 rounded-lg flex transform transition duration-150 border border-pink-100 overflow-hidden h-45 w-full hover:-translate-y-1 hover:ring-pink-100"
                  >
                    {/* Left: thumbnail */}
                    <div className="w-50 h-full flex-shrink-0">
                      {community.thumbnailUrl ? (
                        <img
                          src={community.thumbnailUrl}
                          alt={community.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold">
                          {community.name?.[0] || "C"}
                        </div>
                      )}
                    </div>

                    {/* Right: content */}
                    <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                      <div className="min-w-0 pr-4">
                        <div className="text-2xl font-bold mb-4 truncate text-left">
                          {community.name}
                        </div>
                        {community.description && (
                          <div className="text-sm text-gray-600 line-clamp-2 overflow-hidden text-left">
                            {community.description}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        {/* Role badge */}
                        <div className="flex-shrink-0">
                          {community.role && community.role !== "NONE" && (
                            <span
                              className={`text-sm font-semibold px-3 py-1 rounded-full ${
                                community.role === "ADMIN"
                                  ? "bg-pink-100 text-pink-700"
                                  : community.role === "MODERATOR"
                                  ? "bg-amber-100 text-amber-700"
                                  : community.role === "MEMBER"
                                  ? "bg-sky-100 text-sky-700"
                                  : community.role === "PENDING"
                                  ? "bg-gray-100 text-gray-700"
                                  : "bg-rose-100 text-rose-700"
                              }`}
                            >
                              {community.role === "ADMIN"
                                ? "Admin"
                                : community.role === "MODERATOR"
                                ? "Moderator"
                                : community.role === "MEMBER"
                                ? "Thành viên"
                                : community.role === "PENDING"
                                ? "Chờ duyệt"
                                : "Bị khóa"}
                            </span>
                          )}
                        </div>

                        {/* Meta */}
                        <div className="text-right">
                          <div className="flex items-center gap-2 justify-end text-gray-600">
                            <Users size={18} />
                            <div className="text-sm font-medium">
                              {community.memberCount}
                            </div>
                          </div>
                          <div className="mt-1 text-xs text-gray-400">
                            {community.isPublic ? "Public" : "Private"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Follow Modal */}
      <FollowModal
        open={followModalOpen}
        onClose={() => setFollowModalOpen(false)}
        userId={fetchedProfile.id}
        type={followModalType}
        currentUserId={currentUser?.id}
      />
    </div>
  );
};

export default ViewProfile;
