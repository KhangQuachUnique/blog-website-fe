import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { UserProfile } from "../../../types/user.types";
import { IoSettingsOutline } from "react-icons/io5";
import { FiUsers } from "react-icons/fi";
import { MdGroup } from "react-icons/md";
import { BsFileText } from "react-icons/bs";

const ViewProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"posts" | "communities">("posts");
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    // TODO: Replace with actual API call
    const fetchProfile = async () => {
      setLoading(true);
      try {
        // Mock data - replace with actual API call
        const mockProfile: UserProfile = {
          user: {
            id: userId || "1",
            username: "johndoe",
            email: "john@example.com",
            phone: "0123456789",
            firstName: "John",
            lastName: "Doe",
            fullName: "John Doe",
            bio: "Passionate blogger and tech enthusiast. Love sharing knowledge about web development, design patterns, and software architecture.",
            avatar: "https://i.pravatar.cc/300",
            isPrivate: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          communities: [
            {
              id: "1",
              name: "Web Development",
              description: "Community for web developers",
              avatar: "https://via.placeholder.com/100",
              memberCount: 1200,
              createdAt: new Date().toISOString(),
            },
            {
              id: "2",
              name: "React Enthusiasts",
              description: "All about React.js",
              avatar: "https://via.placeholder.com/100",
              memberCount: 850,
              createdAt: new Date().toISOString(),
            },
          ],
          followers: [],
          following: [],
          posts: [
            {
              id: "1",
              title: "Getting Started with React TypeScript",
              content: "Full content here...",
              excerpt: "Learn how to set up a React project with TypeScript from scratch.",
              coverImage: "https://via.placeholder.com/400x200",
              authorId: userId || "1",
              author: {} as any,
              status: "published",
              viewCount: 1250,
              likeCount: 89,
              commentCount: 23,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: "2",
              title: "Advanced State Management Patterns",
              content: "Full content here...",
              excerpt: "Explore advanced patterns for managing state in large React applications.",
              coverImage: "https://via.placeholder.com/400x200",
              authorId: userId || "1",
              author: {} as any,
              status: "published",
              viewCount: 980,
              likeCount: 67,
              commentCount: 15,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
          followerCount: 342,
          followingCount: 128,
          postCount: 25,
        };
        
        setProfile(mockProfile);
        // Check if this is the current user's profile
        setIsOwnProfile(true); // TODO: Compare with actual logged-in user ID
      } catch (error) {
        console.error("Failed to fetch profile:", error);
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

  if (profile.user.isPrivate && !isOwnProfile) {
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
      <div className="bg-white rounded-2xl border border-[#FFE4EC] shadow-sm p-8 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <img
              src={profile.user.avatar || "https://i.pravatar.cc/300"}
              alt={profile.user.fullName}
              className="w-32 h-32 rounded-full object-cover border-4 border-[#FFE4EC]"
            />
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold" style={{ color: "#8C1D35" }}>
                {profile.user.fullName || profile.user.username}
              </h1>
              {profile.user.isPrivate && (
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                  🔒 Riêng tư
                </span>
              )}
            </div>
            <p className="text-gray-600 mb-1">@{profile.user.username}</p>
            {profile.user.bio && (
              <p className="text-gray-700 mt-3 max-w-2xl">{profile.user.bio}</p>
            )}

            {/* Stats */}
            <div className="flex gap-6 mt-4">
              <div className="text-center">
                <div className="font-bold text-xl" style={{ color: "#F295B6" }}>
                  {profile.postCount}
                </div>
                <div className="text-sm text-gray-600">Bài viết</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-xl" style={{ color: "#F295B6" }}>
                  {profile.followerCount}
                </div>
                <div className="text-sm text-gray-600">Người theo dõi</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-xl" style={{ color: "#F295B6" }}>
                  {profile.followingCount}
                </div>
                <div className="text-sm text-gray-600">Đang theo dõi</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isOwnProfile && (
            <button
              onClick={() => navigate("/profile/edit")}
              className="flex items-center gap-2 px-6 py-3 bg-[#F295B6] text-white font-bold rounded-lg hover:bg-[#FFB8D1] transition-colors duration-200"
            >
              <IoSettingsOutline fontSize={20} />
              Quản lý hồ sơ
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-[#FFE4EC] shadow-sm overflow-hidden">
        <div className="flex border-b border-[#FFE4EC]">
          <button
            onClick={() => setActiveTab("posts")}
            className={`flex-1 px-6 py-4 font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === "posts"
                ? "text-[#F295B6] border-b-2 border-[#F295B6] bg-[#FFEFF4]"
                : "text-gray-600 hover:bg-[#FFF8FB]"
            }`}
          >
            <BsFileText fontSize={18} />
            Bài viết ({profile.postCount})
          </button>
          <button
            onClick={() => setActiveTab("communities")}
            className={`flex-1 px-6 py-4 font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === "communities"
                ? "text-[#F295B6] border-b-2 border-[#F295B6] bg-[#FFEFF4]"
                : "text-gray-600 hover:bg-[#FFF8FB]"
            }`}
          >
            <MdGroup fontSize={20} />
            Cộng đồng ({profile.communities.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "posts" && (
            <div className="space-y-4">
              {profile.posts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  Chưa có bài viết nào
                </div>
              ) : (
                profile.posts.map((post) => (
                  <div
                    key={post.id}
                    className="border border-[#FFE4EC] rounded-xl p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer"
                  >
                    <div className="flex gap-4">
                      {post.coverImage && (
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="w-48 h-32 object-cover rounded-lg flex-shrink-0"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2 hover:text-[#F295B6] transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>👁️ {post.viewCount} lượt xem</span>
                          <span>❤️ {post.likeCount} thích</span>
                          <span>💬 {post.commentCount} bình luận</span>
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
                <div className="col-span-full text-center py-12 text-gray-500">
                  Chưa tham gia cộng đồng nào
                </div>
              ) : (
                profile.communities.map((community) => (
                  <div
                    key={community.id}
                    className="border border-[#FFE4EC] rounded-xl p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer"
                  >
                    <div className="flex items-center gap-4 mb-3">
                      <img
                        src={community.avatar || "https://via.placeholder.com/100"}
                        alt={community.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-bold text-lg hover:text-[#F295B6] transition-colors">
                          {community.name}
                        </h4>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <FiUsers /> {community.memberCount} thành viên
                        </p>
                      </div>
                    </div>
                    {community.description && (
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {community.description}
                      </p>
                    )}
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
