import React from 'react';

interface UpvoteIconProps {
  active?: boolean;
  size?: number;
}

const COLORS = {
  inactive: '#F295B6',
  active: '#E8779F',
};

const UpvoteIcon: React.FC<UpvoteIconProps> = ({ 
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
        d="M12 4L4 14H9V20H15V14H20L12 4Z"
        fill={active ? COLORS.active : 'transparent'}
        stroke={active ? COLORS.active : COLORS.inactive}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default UpvoteIcon;
