import React, { useState } from "react";
import { Menu, MenuItem, IconButton } from "@mui/material";
import { MoreHorizontal } from "lucide-react";

// ============================================
// 🎨 TYPES
// ============================================
export interface MoreMenuItem {
  /** Label hiển thị */
  label: string;
  /** Icon component (optional) */
  icon?: React.ReactNode;
  /** Hành động khi click */
  onClick: () => void;
  /** Style nguy hiểm (màu đỏ) */
  danger?: boolean;
  /** Ẩn menu item này */
  hidden?: boolean;
}

export interface MoreButtonProps {
  /** Danh sách menu items */
  menuItems: MoreMenuItem[];
  /** Custom style cho button */
  buttonStyle?: React.CSSProperties;
  /** Custom class cho button */
  buttonClassName?: string;
  /** Kích thước button */
  buttonSize?: "small" | "medium" | "large";
  /** Kích thước icon */
  iconSize?: number;
  /** Tooltip text */
  tooltip?: string;
  /** Custom style cho menu container */
  menuStyle?: React.CSSProperties;
  /** Position của menu */
  anchorOrigin?: {
    vertical: "top" | "bottom";
    horizontal: "left" | "right";
  };
  transformOrigin?: {
    vertical: "top" | "bottom";
    horizontal: "left" | "right";
  };
}

// ============================================
// 🎨 THEME
// ============================================
const THEME = {
  primary: "#F295B6",
  secondary: "#FFB8D1",
  tertiary: "#FFE7F0",
  text: "#4A3C42",
  white: "#FFFFFF",
  danger: "#E57373",
};

// ============================================
// 📝 MORE BUTTON COMPONENT
// ============================================
const MoreButton: React.FC<MoreButtonProps> = ({
  menuItems,
  buttonStyle,
  buttonClassName,
  buttonSize = "medium",
  iconSize = 20,
  tooltip,
  menuStyle,
  anchorOrigin = { vertical: "bottom", horizontal: "right" },
  transformOrigin = { vertical: "top", horizontal: "right" },
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (onClick: () => void) => {
    onClick();
    handleClose();
  };

  // Filter out hidden items
  const visibleItems = menuItems.filter((item) => !item.hidden);

  return (
    <>
      <IconButton
        onClick={handleClick}
        size={buttonSize}
        title={tooltip}
        className={buttonClassName}
        style={{
          color: open ? THEME.primary : "#999999",
          transition: "all 0.2s ease",
          ...buttonStyle,
        }}
      >
        <MoreHorizontal size={iconSize} strokeWidth={2.5} />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={anchorOrigin}
        transformOrigin={transformOrigin}
        onClick={(e) => e.stopPropagation()}
        PaperProps={{
          elevation: 0,
          sx: {
            minWidth: "160px",
            borderRadius: "16px",
            border: `1.5px solid ${THEME.secondary}`,
            boxShadow: "0 4px 20px rgba(242, 149, 182, 0.2)",
            mt: 1,
            "& .MuiMenuItem-root": {
              fontFamily: "'Quicksand', sans-serif",
              fontSize: "14px",
              fontWeight: 600,
              padding: "12px 16px",
              gap: "12px",
              transition: "all 0.15s ease",
              "&:hover": {
                backgroundColor: THEME.tertiary,
              },
            },
            ...menuStyle,
          },
        }}
      >
        {visibleItems.map((item, index) => (
          <React.Fragment key={index}>
            {/* Add divider before danger items */}
            {item.danger && index > 0 && (
              <div
                style={{
                  height: "1px",
                  background: THEME.tertiary,
                  margin: "4px 12px",
                }}
              />
            )}
            <MenuItem
              onClick={() => handleMenuItemClick(item.onClick)}
              sx={{
                color: item.danger ? THEME.danger : THEME.text,
              }}
            >
              {item.icon && (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    color: item.danger ? THEME.danger : THEME.primary,
                    opacity: 0.9,
                  }}
                >
                  {item.icon}
                </span>
              )}
              {item.label}
            </MenuItem>
          </React.Fragment>
        ))}
      </Menu>
    </>
  );
};

export default MoreButton;
