
import { Link } from 'react-router-dom';
import type { PostItem } from '../../types/post';
import InteractBar from '../InteractBar';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/newsfeed/Card.css';

const Card = ({ post }: { post: PostItem }) => {
  const { user } = useAuth();
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return 'vừa xong';
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <article className="newsfeed-card hover:shadow-lg transition-shadow">
      <Link to={`/post/${post.id}`} className="block cursor-pointer">
        {post.thumbnailUrl && (
          <div className="newsfeed-card__thumbnail">
            <img
              src={post.thumbnailUrl}
              alt={post.title}
              className="newsfeed-card__image"
              loading="lazy"
            />
          </div>
        )}
        <div className="newsfeed-card__content">
          <div className="newsfeed-card__header">
            <div className="newsfeed-card__author">
              <img
                src={post.author.avatarUrl}
                alt={post.author.username}
                className="newsfeed-card__avatar"
              />
              <div className="newsfeed-card__author-info">
                <span className="newsfeed-card__username">{post.author.username}</span>
                {post.community && (
                  <span className="newsfeed-card__community">
                    trong {typeof post.community === 'string' ? post.community : post.community.name}
                  </span>
                )}
              </div>
            </div>
            <time className="newsfeed-card__time">{formatDate(post.createdAt)}</time>
          </div>
          <h2 className="newsfeed-card__title">{post.title}</h2>
          {post.hashtags && post.hashtags.length > 0 && (
            <div className="newsfeed-card__hashtags">
              {post.hashtags.map((h) => (
                <span key={h.id} className="newsfeed-card__hashtag">#{h.name}</span>
              ))}
            </div>
          )}
        </div>
      </Link>
      
      {/* InteractBar - Blookie Style */}
      <div className="px-4 pb-3" onClick={(e) => e.stopPropagation()}>
        <InteractBar
          postId={post.id}
          userId={user?.id ?? 0}
          initialUpVotes={post.upVotes}
          initialDownVotes={post.downVotes}
          totalComments={post.totalComments}
        />
      </div>
    </article>
  );
};

export default Card;