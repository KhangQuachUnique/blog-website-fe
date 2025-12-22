import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import * as userService from "../../../services/user/userService";
import { MdGroup } from "react-icons/md";
import { BsFileText } from "react-icons/bs";
import { BsGenderMale } from "react-icons/bs";
import { BsGenderFemale } from "react-icons/bs";
import Card from "../../../components/card/Card";
import "../../../styles/profile/profile.css";
import "../../../styles/profile/tabs.css";
import Avatar from "@mui/material/Avatar";
import { stringAvatar } from "../../../utils/avatarHelper";
import { MdEmail, MdPhone } from "react-icons/md";
import CustomButton from "../../../components/button";
import { useToast } from "../../../contexts/toast";
import { useAuth } from "../../../hooks/useAuth";
import { useGetUserProfile } from "../../../hooks/useUser";
import FollowModal from "../../../components/profile/FollowModal";
import ProfileSkeleton from "../../../components/skeleton/ProfileSkeleton";

const ViewProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { showToast } = useToast();
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
  } = useGetUserProfile(userId ? Number(userId) : undefined, currentUser?.id);

  useEffect(() => {
    setLoading(queryLoading);

    if (fetchedProfile) {
      setIsFollowing(fetchedProfile.isFollowing || false);
      setFollowersCount(fetchedProfile.followersCount);
      setIsOwnProfile(userId ? currentUser?.id === Number(userId) : true);
    } else if (!queryLoading && queryError) {
      const err = queryError as any;
      showToast({
        type: "error",
        message:
          err?.response?.data?.message ||
          err?.message ||
          "Không thể tải thông tin hồ sơ",
      });
    }
  }, [fetchedProfile, queryLoading, queryError, userId, currentUser?.id]);

  const handleFollowToggle = async () => {
    if (!fetchedProfile || isOwnProfile) return;

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
                        ) : (
                          <span className="text-base">⚧️</span>
                        )}
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
              <div className="flex items-start mt-2">
                {!isOwnProfile && (
                  <CustomButton
                    variant={isFollowing ? "default" : "outline"}
                    style={{
                      color: isFollowing ? "#fff" : "#f295b6",
                      borderColor: "#f295b6",
                      backgroundColor: isFollowing ? "#f295b6" : "transparent",
                    }}
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                  >
                    {followLoading
                      ? "Đang xử lý..."
                      : isFollowing
                      ? "Đã Follow"
                      : "Follow"}
                  </CustomButton>
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
              <div className="flex items-center gap-2">
                <div className="profile-stat-value !text-[20px]">
                  {fetchedProfile.posts.length}
                </div>
                <div className="profile-stat-label">Bài viết</div>
              </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fetchedProfile.communities.length === 0 ? (
                <div className="col-span-full profile-tab-empty">
                  Chưa tham gia cộng đồng nào
                </div>
              ) : (
                fetchedProfile.communities.map((community) => (
                  <div key={community.id} className="profile-community-card">
                    <div className="flex items-center gap-4">
                      <img
                        src={community.thumbnailUrl}
                        alt={community.name}
                        className="profile-community-avatar"
                      />
                      <div className="flex-1">
                        <h4 className="font-bold text-lg hover:text-[#F295B6] transition-colors">
                          {community.name}
                        </h4>
                      </div>
                    </div>
                  </div>
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
