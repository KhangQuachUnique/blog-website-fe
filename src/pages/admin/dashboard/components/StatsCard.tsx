import { FiUsers, FiFileText, FiMessageSquare, FiActivity, FiHome, FiTrendingUp } from "react-icons/fi";

interface StatsCardProps {
  title: string;
  value: number;
  subValue?: number;
  subLabel?: string;
  icon: "users" | "posts" | "comments" | "communities" | "interactions" | "growth";
  color: "blue" | "green" | "purple" | "orange" | "pink" | "indigo";
}

const iconMap = {
  users: FiUsers,
  posts: FiFileText,
  comments: FiMessageSquare,
  communities: FiHome,
  interactions: FiActivity,
  growth: FiTrendingUp,
};

const colorMap = {
  blue: {
    bg: "bg-blue-50",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    subColor: "text-blue-600",
  },
  green: {
    bg: "bg-green-50",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    subColor: "text-green-600",
  },
  purple: {
    bg: "bg-purple-50",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    subColor: "text-purple-600",
  },
  orange: {
    bg: "bg-orange-50",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    subColor: "text-orange-600",
  },
  pink: {
    bg: "bg-pink-50",
    iconBg: "bg-pink-100",
    iconColor: "text-pink-600",
    subColor: "text-pink-600",
  },
  indigo: {
    bg: "bg-indigo-50",
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
    subColor: "text-indigo-600",
  },
};

const StatsCard = ({ title, value, subValue, subLabel, icon, color }: StatsCardProps) => {
  const Icon = iconMap[icon];
  const colors = colorMap[color];

  return (
    <div className={`${colors.bg} rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-800">
            {value.toLocaleString("vi-VN")}
          </p>
          {subValue !== undefined && subLabel && (
            <p className={`text-sm mt-1 ${colors.subColor} font-medium`}>
              +{subValue.toLocaleString("vi-VN")} {subLabel}
            </p>
          )}
        </div>
        <div className={`${colors.iconBg} p-3 rounded-lg`}>
          <Icon className={`${colors.iconColor} text-xl`} />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
