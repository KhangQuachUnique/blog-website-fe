import type { BlogPost } from "../../types/user.types";

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
        {post.thumbnailUrl && (
          <img
            src={post.thumbnailUrl}
            alt={post.title}
            className="w-48 h-32 object-cover rounded-lg flex-shrink-0"
          />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-bold hover:text-[#F295B6] transition-colors">
              {post.title}
            </h3>
            {!post.isPublic && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                🔒 Riêng tư
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500 mt-3">
            <span>👍 {post.upVotes} upvotes</span>
            <span>👎 {post.downVotes} downvotes</span>
            <span>📅 {new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
