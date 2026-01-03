import { Avatar, Badge, Popover, CircularProgress } from "@mui/material";
import { useState } from "react";
import { RiNotification4Line } from "react-icons/ri";
import { FaInbox } from "react-icons/fa6";
import { IoCheckmarkDoneSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import {
  useGetNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from "../../hooks/useNotification";
import type { NotificationResponseDto } from "../../types/notification";
import { getNotificationNavigationUrl } from "../../types/notification";
import { Link } from "react-router-dom";
import { stringAvatar } from "../../utils/avatarHelper";
import { formatRelativeTimeVi } from "../../utils/timeHelper";

/**
 * Check if notification is clickable (has navigation)
 */
const isNotificationClickable = (
  notification: NotificationResponseDto
): boolean => {
  return getNotificationNavigationUrl(notification) !== null;
};

const NotificationBell = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userId = user?.id as number;

  // Use the hook for reactive data updates
  const { data: notifications } = useGetNotifications();

  const markAllAsReadMutation = useMarkAllNotificationsAsRead();

  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;
  const hasUnread = unreadCount > 0;

  /**
   * State to manage the open/close status of the notification dropdown
   */
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  /**
   * Handle mark all as read
   */
  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  /**
   * Handle notification click - navigate to appropriate page
   */
  const handleNotificationClick = (notification: NotificationResponseDto) => {
    const url = getNotificationNavigationUrl(notification);
    if (url) {
      handleClose();
      navigate(url);
    }
  };

  return (
    <div>
      <Badge
        badgeContent={hasUnread ? unreadCount : undefined}
        variant={hasUnread ? "standard" : "dot"}
        max={99}
        sx={{
          "& .MuiBadge-badge": {
            backgroundColor: hasUnread ? "#C24E67" : "transparent",
            color: "white",
            fontSize: "0.6rem",
            fontWeight: 600,
            minWidth: hasUnread ? 16 : 6,
            height: hasUnread ? 16 : 6,
            padding: hasUnread ? "0 4px" : 0,
            borderRadius: hasUnread ? "8px" : "50%",
            boxShadow: "0 0 0 1.5px white",
            top: 4,
            right: 4,
          },
        }}
      >
        <button
          className="hover:bg-[#FFEFF4] p-2 rounded-lg transition-colors duration-100"
          onClick={anchorEl ? handleClose : handleOpen}
          ref={undefined}
        >
          <RiNotification4Line fontSize={24} style={{ color: "#F295B6" }} />
        </button>
      </Badge>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            mt: 1.2,
            borderRadius: 3,
            boxShadow: "0px 4px 20px rgba(135, 88, 104, 0.24)",
            padding: 0,
          },
        }}
        onClose={handleClose}
      >
        <div className="w-96 max-h-[480px] overflow-hidden bg-white shadow-sm rounded-md flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">
              Thông báo
              {hasUnread && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({unreadCount} mới)
                </span>
              )}
            </h3>
            {hasUnread && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={markAllAsReadMutation.isPending}
                className="flex items-center gap-1 text-sm text-[#C24E67] hover:text-[#A73D54] 
                           hover:bg-[#FFEFF4] px-2 py-1 rounded-md transition-colors duration-150
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {markAllAsReadMutation.isPending ? (
                  <CircularProgress size={14} sx={{ color: "#C24E67" }} />
                ) : (
                  <IoCheckmarkDoneSharp className="text-base" />
                )}
                <span>Đánh dấu đã đọc</span>
              </button>
            )}
          </div>

          {/* Notification List */}
          <ul className="overflow-y-auto flex-1">
            {notifications && notifications.length > 0 ? (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClick={() => handleNotificationClick(notification)}
                />
              ))
            ) : (
              <li className="text-sm text-gray-600 flex justify-center items-center py-[80px]">
                <div className="flex flex-col items-center">
                  <FaInbox className="text-4xl text-gray-400" />
                  <span className="mt-2">Chưa có thông báo nào</span>
                </div>
              </li>
            )}
          </ul>
        </div>
      </Popover>
    </div>
  );
};

/**
 * Individual notification item component
 */
interface NotificationItemProps {
  notification: NotificationResponseDto;
  onClick: () => void;
}

const NotificationItem = ({ notification, onClick }: NotificationItemProps) => {
  const markAsReadMutation = useMarkNotificationAsRead(notification.id);
  const isClickable = isNotificationClickable(notification);

  const handleClick = () => {
    // Mark as read if not already
    if (!notification.isRead) {
      markAsReadMutation.mutate();
    }
    onClick();
  };

  return (
    <li
      onClick={isClickable ? handleClick : undefined}
      className={`
        text-sm text-gray-600 p-4 border-b border-gray-50 last:border-b-0
        ${
          notification.isRead
            ? "bg-gray-50/50"
            : "bg-white border-l-4 border-l-[#C24E67]"
        }
        ${
          isClickable
            ? "cursor-pointer hover:bg-[#FFF5F8] transition-colors duration-150"
            : ""
        }
      `}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <Link
            to={`/user/profile/${notification.sender.id}`}
            onClick={(e) => e.stopPropagation()}
          >
            {notification.sender.avatarUrl ? (
              <Avatar
                src={notification.sender.avatarUrl}
                alt={notification.sender.username}
                sx={{
                  width: 44,
                  height: 44,
                  border: "2px solid white",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              />
            ) : (
              <Avatar
                {...stringAvatar(notification.sender.username, 44, "1rem")}
              />
            )}
          </Link>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <span
                className={`font-semibold ${
                  notification.isRead ? "text-gray-700" : "text-[#C24E67]"
                }`}
              >
                {notification.sender.username}
              </span>
              <p
                className={`text-gray-600 mt-0.5 line-clamp-2 ${
                  !notification.isRead ? "font-medium" : ""
                }`}
              >
                {notification.template.message}
              </p>
            </div>

            {/* Unread indicator */}
            {!notification.isRead && (
              <span className="w-2 h-2 bg-[#C24E67] rounded-full flex-shrink-0 mt-2" />
            )}
          </div>

          {/* Time */}
          <span className="text-xs text-gray-400 mt-1 block">
            {formatRelativeTimeVi(notification.createdAt)}
          </span>
        </div>
      </div>
    </li>
  );
};

export default NotificationBell;
