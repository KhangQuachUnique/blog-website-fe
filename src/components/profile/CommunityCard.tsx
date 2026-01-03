import type { ICommunityResponse } from "../../types/community";
import { FiUsers } from "react-icons/fi";

interface CommunityCardProps {
  community: ICommunityResponse;
  onClick?: () => void;
}

const CommunityCard = ({ community, onClick }: CommunityCardProps) => {
  return (
    <div
      onClick={onClick}
      className="border border-[#FFE4EC] rounded-xl p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer"
    >
      <div className="flex items-center gap-4 mb-3">
        {community.thumbnailUrl ? (
          <img
            src={community.thumbnailUrl}
            alt={community.name}
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500 text-xl font-bold">
              {community.name?.charAt(0)?.toUpperCase() || "C"}
            </span>
          </div>
        )}
        <div className="flex-1">
          <h4 className="font-bold text-lg hover:text-[#F295B6] transition-colors">
            {community.name}
          </h4>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <FiUsers /> {community.memberCount} thành viên
          </p>
        </div>
      </div>
      {community.description && (
        <p className="text-gray-600 text-sm line-clamp-2">
          {community.description}
        </p>
      )}
    </div>
  );
};

export default CommunityCard;
