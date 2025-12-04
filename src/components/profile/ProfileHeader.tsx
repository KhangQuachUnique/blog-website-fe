import type { User } from "../../../../types/user.types";

interface ProfileHeaderProps {
  user: User;
  followerCount: number;
  followingCount: number;
  postCount: number;
  isOwnProfile: boolean;
  onEditProfile?: () => void;
}

const ProfileHeader = ({
  user,
  followerCount,
  followingCount,
  postCount,
  isOwnProfile,
  onEditProfile,
}: ProfileHeaderProps) => {
  return (
    <div className="bg-white rounded-2xl border border-[#FFE4EC] shadow-sm p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <img
            src={user.avatar || "https://i.pravatar.cc/300"}
            alt={user.fullName}
            className="w-32 h-32 rounded-full object-cover border-4 border-[#FFE4EC]"
          />
        </div>

        {/* User Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold" style={{ color: "#8C1D35" }}>
              {user.fullName || user.username}
            </h1>
            {user.isPrivate && (
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                🔒 Riêng tư
              </span>
            )}
          </div>
          <p className="text-gray-600 mb-1">@{user.username}</p>
          {user.bio && (
            <p className="text-gray-700 mt-3 max-w-2xl">{user.bio}</p>
          )}

          {/* Stats */}
          <div className="flex gap-6 mt-4">
            <div className="text-center">
              <div className="font-bold text-xl" style={{ color: "#F295B6" }}>
                {postCount}
              </div>
              <div className="text-sm text-gray-600">Bài viết</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-xl" style={{ color: "#F295B6" }}>
                {followerCount}
              </div>
              <div className="text-sm text-gray-600">Người theo dõi</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-xl" style={{ color: "#F295B6" }}>
                {followingCount}
              </div>
              <div className="text-sm text-gray-600">Đang theo dõi</div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        {isOwnProfile && onEditProfile && (
          <button
            onClick={onEditProfile}
            className="flex items-center gap-2 px-6 py-3 bg-[#F295B6] text-white font-bold rounded-lg hover:bg-[#FFB8D1] transition-colors duration-200"
          >
            Quản lý hồ sơ
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
