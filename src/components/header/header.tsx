import { SearchBar } from "../searchBar/searchBar";
import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import { GoPerson } from "react-icons/go";

import { HiMenuAlt2 } from "react-icons/hi";
import { RiNotification4Line } from "react-icons/ri";
import { IoSettingsOutline } from "react-icons/io5";
import { IoExitOutline } from "react-icons/io5";

interface HeaderProps {
  layout: "admin" | "user";
  isLoggedIn?: boolean;
  collapsed?: boolean;
  setCollapsed?: (collapsed: boolean) => void;
}

const Header = ({
  layout,
  isLoggedIn,
  collapsed,
  setCollapsed,
}: HeaderProps) => {
  // Search state
  const [search, setSearch] = useState("");

  const onSearchChange = (value: string) => {
    setSearch(value);
  };

  // Scroll state for background
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // User menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div
      className={`sticky top-0 w-full h-[70px] px-15 flex items-center justify-between transition-all duration-300 z-50 ${
        isScrolled
          ? "bg-[#FFFFFF]/20 backdrop-blur-sm border-b border-[#FFE4EC]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <button
        className="hover:bg-[#FFEFF4] p-1 rounded-lg transition-colors duration-100"
        onClick={() => setCollapsed && setCollapsed(!collapsed)}
      >
        {collapsed && <HiMenuAlt2 fontSize={28} style={{ color: "#F295B6" }} />}
      </button>
      <div className="flex items-center gap-4">
        {layout === "user" && (
          <SearchBar value={search} onChange={onSearchChange} />
        )}
        {!isLoggedIn ? (
          <div className="flex items-center gap-4">
            <NavLink
              to=""
              className="font-bold py-2 px-4 text-[#F295B6] bg-white rounded-lg hover:bg-[#FFEFF4] transition-background duration-200"
            >
              Login
            </NavLink>
            <NavLink
              to=""
              className="font-bold py-2 px-4 text-white bg-[#F295B6] rounded-lg hover:bg-[#FFB8D1] transition-background duration-200"
            >
              Register
            </NavLink>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <button className="hover:bg-[#FFEFF4] p-2 rounded-lg transition-colors duration-100">
              <RiNotification4Line fontSize={24} style={{ color: "#F295B6" }} />
            </button>
            <Box>
              <IconButton onClick={handleOpen} size="small">
                <Avatar alt="User Avatar" src="https://i.pravatar.cc/300" />
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                PaperProps={{
                  elevation: 0,
                  sx: {
                    bgcolor: "#FFFFFF",
                    boxShadow: "0 0 15px 0 rgba(242, 149, 182, 0.15)",
                    border: "1px solid #FFE4EC",
                    borderRadius: 3,
                    overflow: "visible",
                    minWidth: 200,
                    mt: 1.5,
                    fontFamily: "Mona Sans, Open Sans, Outfit, sans-serif",
                    "& .MuiAvatar-root": {
                      width: 32,
                      height: 32,
                      ml: -0.5,
                      mr: 1,
                    },
                    "& .MuiMenuItem-root": {
                      fontFamily: "Mona Sans, Open Sans, Outfit, sans-serif",
                      fontSize: 15,
                      fontWeight: 400,
                      px: 2,
                      py: 1.5,
                      borderRadius: 1.5,
                      mx: 1,
                      my: 0.5,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        bgcolor: "#FFEFF4",
                        color: "#8C1D35",
                      },
                    },
                    "& .MuiDivider-root": {
                      my: 1,
                      borderColor: "#FFE4EC",
                    },
                  },
                }}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              >
                <MenuItem>
                  <ListItemIcon>
                    <GoPerson style={{ fontSize: 20, color: "#F295B6" }} />
                  </ListItemIcon>
                  Xem trang cá nhân
                </MenuItem>

                <MenuItem>
                  <ListItemIcon>
                    <IoSettingsOutline
                      style={{ fontSize: 20, color: "#F295B6" }}
                    />
                  </ListItemIcon>
                  Cài đặt
                </MenuItem>

                <Divider />

                <MenuItem>
                  <ListItemIcon>
                    <IoExitOutline style={{ fontSize: 20, color: "#F295B6" }} />
                  </ListItemIcon>
                  Đăng xuất
                </MenuItem>
              </Menu>
            </Box>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
