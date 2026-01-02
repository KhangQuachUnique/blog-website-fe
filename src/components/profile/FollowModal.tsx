import { useState, useEffect } from "react";
import { Dialog } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import { stringAvatar } from "../../utils/avatarHelper";
import * as userService from "../../services/user/userService";
import { useToast } from "../../contexts/toast";
import { useLoginRequired } from "../../hooks/useLoginRequired";
import { useNavigate } from "react-router-dom";
import type { UserListItem } from "../../types/user";
import { IoClose } from "react-icons/io5";

interface FollowModalProps {
  open: boolean;
  onClose: () => void;
  userId: number;
  type: "followers" | "following";
  currentUserId?: number;
}

const FollowModal = ({
  open,
  onClose,
  userId,
  type,
  currentUserId,
}: FollowModalProps) => {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const { requireLogin } = useLoginRequired();
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data =
        type === "followers"
          ? await userService.getFollowers(userId)
          : await userService.getFollowing(userId);
      setUsers(data);
    } catch (error) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      showToast({
        type: "error",
        message:
          err.response?.data?.message ||
          err.message ||
          "Không thể tải danh sách",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async (targetUser: UserListItem) => {
    if (
      !requireLogin({ message: "Vui lòng đăng nhập để theo dõi người dùng" })
    ) {
      return;
    }

    if (!currentUserId) return;

    try {
      if (targetUser.isFollowing) {
        await userService.unfollowUser(targetUser.id);
        showToast({ type: "success", message: "Đã unfollow người dùng" });
      } else {
        await userService.followUser(targetUser.id);
        showToast({ type: "success", message: "Đã follow người dùng" });
      }

      // Cập nhật lại trạng thái trong danh sách
      setUsers((prev) =>
        prev.map((u) =>
          u.id === targetUser.id ? { ...u, isFollowing: !u.isFollowing } : u
        )
      );
    } catch (error) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      showToast({
        type: "error",
        message: err.response?.data?.message || err.message || "Có lỗi xảy ra",
      });
    }
  };

  const handleUserClick = (targetUserId: number) => {
    onClose();
    navigate(`/profile/${targetUserId}`);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "20px",
          width: "500px",
          padding: "5px",
          boxShadow: "none", // tăng tuỳ thích
        },
      }}
    >
      <div className="p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold" style={{ color: "#F295B6" }}>
            {type === "followers" ? "Người theo dõi" : "Đang theo dõi"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            <IoClose size={30} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="text-gray-500">Đang tải...</div>
          </div>
        ) : users.length === 0 ? (
          <div className="flex justify-center py-8 text-gray-500">
            {type === "followers"
              ? "Chưa có người theo dõi"
              : "Chưa theo dõi ai"}
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div
                  className="flex items-center gap-3 flex-1 cursor-pointer"
                  onClick={() => handleUserClick(user.id)}
                >
                  {user.avatarUrl ? (
                    <Avatar
                      src={user.avatarUrl}
                      alt={user.username}
                      sx={{ width: 48, height: 48 }}
                    />
                  ) : (
                    <Avatar {...stringAvatar(user.username, 48, "1rem")} />
                  )}
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">
                      {user.username}
                    </div>
                    {user.bio && (
                      <div className="text-sm text-gray-500 line-clamp-1">
                        {user.bio}
                      </div>
                    )}
                  </div>
                </div>
                {currentUserId && user.id !== currentUserId && (
                  <button
                    onClick={() => handleFollowToggle(user)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      user.isFollowing
                        ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        : "bg-[#F295B6] text-white hover:bg-[#FFB8D1]"
                    }`}
                  >
                    {user.isFollowing ? "Đã Follow" : "Follow"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default FollowModal;
