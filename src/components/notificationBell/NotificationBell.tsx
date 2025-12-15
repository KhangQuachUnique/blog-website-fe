import { Badge, Popover } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { RiNotification4Line } from "react-icons/ri";

import { useAuth } from "../../hooks/useAuth";
import type { NotificationResponseDto } from "../../types/notification";
import { Link } from "react-router-dom";

const NotificationBell = () => {
  const { user } = useAuth();
  const userId = user?.id as number;

  const { data: notifications } = useQuery<NotificationResponseDto[]>({
    queryKey: ["notifications", userId],
  });
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
          },
        }}
        onClose={handleClose}
      >
        <div className="w-90 max-h-96 overflow-y-auto bg-white shadow-sm rounded-md p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Notifications
          </h3>
          <ul className="space-y-5">
            {notifications && notifications.length > 0 ? (
              notifications.map((notification) => (
                <li key={notification.id} className="text-sm text-gray-600">
                  <div className="flex items-start gap-3">
                    <Link to={`/user/profile/${notification.sender.id}`}>
                      <img
                        className="w-[80px] rounded-full"
                        src={notification.sender.avatarUrl ?? ""}
                        alt={notification.sender.username}
                      />
                    </Link>
                    <div>
                      <span className="font-semibold text-gray-800">
                        {notification.sender.username}
                      </span>{" "}
                      <span>{notification.template.message}</span>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="text-sm text-gray-600" id="">
                No new notifications.
              </li>
            )}
          </ul>
        </div>
      </Popover>
    </div>
  );
};

export default NotificationBell;
