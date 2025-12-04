import type { BlogPost } from "../../../../types/user.types";

interface PostCardProps {
  post: BlogPost;
  onClick?: () => void;
}

const PostCard = ({ post, onClick }: PostCardProps) => {
  return (
    <div
      onClick={onClick}
      className="border border-[#FFE4EC] rounded-xl p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer"
    >
      <div className="flex gap-4">
        {post.coverImage && (
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-48 h-32 object-cover rounded-lg flex-shrink-0"
          />
        )}
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-2 hover:text-[#F295B6] transition-colors">
            {post.title}
          </h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {post.excerpt}
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>👁️ {post.viewCount} lượt xem</span>
            <span>❤️ {post.likeCount} thích</span>
            <span>💬 {post.commentCount} bình luận</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
