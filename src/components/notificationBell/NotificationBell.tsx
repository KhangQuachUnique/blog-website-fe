import { Avatar, Badge, Popover } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { RiNotification4Line } from "react-icons/ri";
import { FaInbox } from "react-icons/fa6";

import { useAuth } from "../../hooks/useAuth";
import type { NotificationResponseDto } from "../../types/notification";
import { Link } from "react-router-dom";
import { stringAvatar } from "../../utils/avatarHelper";

const NotificationBell = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id as number;

  const notifications = queryClient.getQueryData<NotificationResponseDto[]>([
    "notifications",
    userId,
  ]);

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

  return (
    <div>
      <Badge
        variant="dot"
        sx={{
          "& .MuiBadge-badge": {
            backgroundColor: "#FEB2CD", // pink
            width: 8,
            height: 8,
            borderRadius: "50%",
            boxShadow: "0 0 0 2px white",
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
        <div className="w-90 max-h-96 overflow-y-auto bg-white shadow-sm rounded-md">
          <h3 className="text-lg font-semibold text-gray-800 p-4">
            Notifications
          </h3>
          <ul className="">
            {notifications && notifications.length > 0 ? (
              (console.log(notifications),
              notifications.map((notification) => (
                <li
                  key={notification.id}
                  className={`text-sm text-gray-600 p-4 ${
                    notification.isRead
                      ? "bg-gray-100"
                      : "font-semibold bg-white border-l-4 border-[#C24E67]"
                  }`}
                >
                  <div className={`flex items-start gap-3`}>
                    <Link to={`/user/profile/${notification.sender.id}`}>
                      {notification.sender.avatarUrl ? (
                        <Avatar
                          src={notification.sender.avatarUrl}
                          alt={notification.sender.username}
                          sx={{
                            width: 50,
                            height: 50,
                            border: "4px solid white",
                          }}
                        />
                      ) : (
                        <Avatar
                          {...stringAvatar(
                            notification.sender.username,
                            50,
                            "1.2rem"
                          )}
                        />
                      )}
                    </Link>
                    <div className="flex flex-col text-md gap-1">
                      <span
                        className={`font-semibold ${
                          notification.isRead
                            ? "text-gray-800"
                            : "text-[#C24E67] font-semibold"
                        }`}
                      >
                        {notification.sender.username}
                      </span>
                      <span>{notification.template.message}</span>
                    </div>
                  </div>
                </li>
              )))
            ) : (
              <li className="text-sm text-gray-600 flex justify-center items-center py-[80px]">
                <div className="flex flex-col items-center ">
                  <FaInbox className="text-4xl text-gray-400" />
                  <span className="mt-2">No new notifications</span>
                </div>
              </li>
            )}
          </ul>
        </div>
      </Popover>
    </div>
  );
};

export default NotificationBell;
