import React from 'react';

interface UpvoteIconProps {
  active?: boolean;
  size?: number;
  className?: string;
}

const COLORS = {
  inactive: '#F295B6',
  active: '#E91E63', // Brighter pink for active state
  hover: '#FF4081',  // Even brighter for hover
};

const UpvoteIcon: React.FC<UpvoteIconProps> = ({ 
  active = false, 
  size = 20,
  className = '' 
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? COLORS.active : COLORS.inactive}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`block transition-colors duration-150 group-hover:stroke-[#FF4081] ${className}`}
      style={{ stroke: active ? COLORS.active : undefined }}
    >
      {/* Reddit-style upvote arrow with stem */}
      <path d="M12 4L5 11h4v8h6v-8h4L12 4z" />
    </svg>
  );
};

export default UpvoteIcon;
