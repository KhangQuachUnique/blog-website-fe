import React from 'react';

interface DownvoteIconProps {
  active?: boolean;
  size?: number;
}

const COLORS = {
  inactive: '#B8A5AB',
  active: '#9B8A90',
};

const DownvoteIcon: React.FC<DownvoteIconProps> = ({ 
  active = false, 
  size = 18,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ transition: 'all 0.2s ease' }}
    >
      <path
        d="M12 20L20 10H15V4H9V10H4L12 20Z"
        fill={active ? COLORS.active : 'transparent'}
        stroke={active ? COLORS.active : COLORS.inactive}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default DownvoteIcon;
