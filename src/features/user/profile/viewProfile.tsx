import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { UserProfile } from "../../../types/user.types";
import { IoSettingsOutline } from "react-icons/io5";
import * as userService from "../../../services/user/userService";
import { togglePostPrivacy } from "../../../services/user/post/postService";
import { MdGroup } from "react-icons/md";
import { BsFileText } from "react-icons/bs";
import { TfiEmail } from "react-icons/tfi";
import { CiPhone } from "react-icons/ci";
import { BsGenderMale } from "react-icons/bs";
import { BsGenderFemale } from "react-icons/bs";
import { MdOutlineSchedule } from "react-icons/md";
import { HiDotsHorizontal } from "react-icons/hi";
import { MdPublic, MdLock } from "react-icons/md";
import "../../../styles/profile/profile.css";
import "../../../styles/profile/tabs.css";

const ViewProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"posts" | "communities">("posts");
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        let data: UserProfile;
        
        if (userId) {
          // Viewing another user's profile
          // TODO: Get viewerId from auth context if logged in
          data = await userService.getUserProfile(Number(userId));
          setIsOwnProfile(false);
        } else {
          // Viewing own profile
          data = await userService.getMyProfile();
          setIsOwnProfile(true);
        }
        
        setProfile(data);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-500">Đang tải...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-500">Không tìm thấy hồ sơ người dùng</div>
      </div>
    );
  }

  if (profile.isPrivate && !isOwnProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <div className="text-xl font-bold text-gray-700 mb-2">
            Hồ sơ này ở chế độ riêng tư
          </div>
          <div className="text-gray-500">
            Người dùng đã thiết lập hồ sơ ở chế độ riêng tư
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="profile-card profile-card-header mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <img
              src={profile.avatarUrl || "https://i.pravatar.cc/300"}
              alt={profile.username}
              className="profile-avatar profile-avatar-lg"
            />
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold" style={{ color: "#8C1D35" }}>
                {profile.username}
              </h1>
              {profile.isPrivate && (
                <span className="profile-privacy-badge-sm">
                  🔒 Riêng tư
                </span>
              )}
            </div>
            
            {/* Container chính: Dùng flex-col và gap-2 để mọi dòng cách nhau ĐỀU 8px */}
            <div className="flex flex-col gap-2 text-sm text-gray-600 mt-2">
              
              {/* --- 1. Email --- */}
              {profile.email && (isOwnProfile || profile.showEmail) && (
                <div className="flex items-center gap-2">
                  <TfiEmail className="text-lg shrink-0" />
                  <span>{profile.email}</span>
                  {!isOwnProfile && (
                    <span className="text-xs text-gray-400 italic">(Công khai)</span>
                  )}
                </div>
              )}

              {/* --- 2. Số điện thoại --- */}
              {profile.phoneNumber && (isOwnProfile || profile.showPhoneNumber) && (
                <div className="flex items-center gap-2">
                  <CiPhone className="text-lg shrink-0" />
                  <span>{profile.phoneNumber}</span>
                  {!isOwnProfile && (
                    <span className="text-xs text-gray-400 italic">(Công khai)</span>
                  )}
                </div>
              )}

              {/* --- 3. Hàng chứa Giới tính & Ngày tham gia --- */}
              {/* Kiểm tra nếu có ít nhất 1 trong 2 thông tin thì mới render hàng này */}
              {(profile.gender || profile.joinAt) && (
                <div className="flex flex-wrap items-center gap-4">
                  
                  {/* Giới tính */}
                  {profile.gender && (
                    <div className="flex items-center gap-1">
                      {profile.gender === 'MALE' ? (
                        <>
                          <BsGenderMale className="text-base text-blue-500" /> 
                          <span>Nam</span>
                        </>
                      ) : profile.gender === 'FEMALE' ? (
                        <>
                          <BsGenderFemale className="text-base text-pink-500" /> 
                          <span>Nữ</span>
                        </>
                      ) : (
                        <>
                          <span className="text-base">⚧️</span> 
                          <span>Khác</span>
                        </>
                      )}
                    </div>
                  )}

                  {/* Ngày tham gia */}
                  {profile.joinAt && (
                    <div className="flex items-center gap-1">
                      <MdOutlineSchedule className="text-lg shrink-0" />
                      <span>Tham gia {new Date(profile.joinAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  )}
                </div>
              )}

            </div>

            {profile.bio && (
              <p className="text-gray-700 mt-3 max-w-2xl">{profile.bio}</p>
            )}

            {/* Stats */}
            <div className="flex gap-6 mt-4">
              <div className="text-center">
                <div className="profile-stat-value">
                  {profile.posts.length}
                </div>
                <div className="profile-stat-label">Bài viết</div>
              </div>
              <div className="text-center">
                <div className="profile-stat-value">
                  {profile.followersCount}
                </div>
                <div className="profile-stat-label">Người theo dõi</div>
              </div>
              <div className="text-center">
                <div className="profile-stat-value">
                  {profile.followingCount}
                </div>
                <div className="profile-stat-label">Đang theo dõi</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isOwnProfile && (
            <button
              onClick={() => navigate("/profile/edit")}
              className="profile-btn-primary"
            >
              <IoSettingsOutline fontSize={20} />
              Quản lý hồ sơ
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="profile-card overflow-hidden">
        <div className="profile-tab-nav">
          <button
            onClick={() => setActiveTab("posts")}
            className={`profile-tab-nav-item ${
              activeTab === "posts" ? "profile-tab-nav-item-active" : ""
            }`}
          >
            <BsFileText className="profile-tab-nav-icon" />
            Bài viết ({profile.posts.length})
          </button>
          <button
            onClick={() => setActiveTab("communities")}
            className={`profile-tab-nav-item ${
              activeTab === "communities" ? "profile-tab-nav-item-active" : ""
            }`}
          >
            <MdGroup className="profile-tab-nav-icon" />
            Cộng đồng ({profile.communities.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="profile-tab-content">
          {activeTab === "posts" && (
            <div className="space-y-4">
              {profile.posts.length === 0 ? (
                <div className="profile-tab-empty">
                  Chưa có bài viết nào
                </div>
              ) : (
                profile.posts.map((post) => (
                  <div
                    key={post.id}
                    className="profile-post-card"
                  >
                    <div className="flex gap-4">
                      {post.thumbnailUrl && (
                        <img
                          src={post.thumbnailUrl}
                          alt={post.title}
                          className="profile-post-thumbnail"
                        />
                      )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <h3 className="profile-post-title">
                                {post.title}
                              </h3>
                              {!post.isPublic && (
                                <span className="profile-privacy-badge">
                                  🔒 Riêng tư
                                </span>
                              )}
                          </div>
                          
                          {/* Dropdown menu 3 chấm - chỉ hiển thị nếu là chính mình */}
                          {isOwnProfile && (
                            <div className="relative" ref={openDropdownId === post.id ? dropdownRef : null}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDropdownId(openDropdownId === post.id ? null : post.id);
                                }}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                title="Tùy chọn"
                              >
                                <HiDotsHorizontal className="text-gray-600" fontSize={20} />
                              </button>
                              
                              {/* Dropdown Menu */}
                              {openDropdownId === post.id && (
                                <div className="profile-dropdown">
                                  <div className="py-1">
                                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                                      Quyền xem
                                    </div>
                                    <button
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        if (!post.isPublic) return;
                                        try {
                                          await togglePostPrivacy(post.id);
                                          window.location.reload();
                                        } catch (error) {
                                          console.error('Failed to toggle privacy:', error);
                                        }
                                      }}
                                      className={`profile-dropdown-item ${
                                        post.isPublic ? 'profile-dropdown-item-active' : ''
                                      }`}
                                    >
                                      <MdPublic fontSize={18} />
                                      <span>Công khai</span>
                                      {post.isPublic && <span className="ml-auto text-green-600">✓</span>}
                                    </button>
                                    <button
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        if (post.isPublic) {
                                          try {
                                            await togglePostPrivacy(post.id);
                                            window.location.reload();
                                          } catch (error) {
                                            console.error('Failed to toggle privacy:', error);
                                          }
                                        }
                                      }}
                                      className="profile-dropdown-item"
                                    >
                                      <MdLock fontSize={18} />
                                      <span>Riêng tư</span>
                                      {!post.isPublic && <span className="ml-auto text-gray-600">✓</span>}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-3">
                          <span>👍 {post.upVotes} upvotes</span>
                          <span>👎 {post.downVotes} downvotes</span>
                          <span>📅 {new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "communities" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profile.communities.length === 0 ? (
                <div className="col-span-full profile-tab-empty">
                  Chưa tham gia cộng đồng nào
                </div>
              ) : (
                profile.communities.map((community) => (
                  <div
                    key={community.id}
                    className="profile-community-card"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={community.thumbnailUrl || "https://via.placeholder.com/100"}
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
    </div>
  );
};

export default ViewProfile;
