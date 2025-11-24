
import { ArrowUp, ArrowDown, MessageCircle, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { PostItem } from '../../types/post';
import '../../styles/newsfeed/Card.css';

const Card = ({ post }: { post: PostItem }) => {
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
    <Link to={`/post/${post.id}`} className="block">
      <article className="newsfeed-card hover:shadow-lg transition-shadow cursor-pointer">
        <div className="newsfeed-card__thumbnail">
          <img
            src={post.thumbnailUrl}
            alt={post.title}
            className="newsfeed-card__image"
            loading="lazy"
          />
        </div>
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
                  <span className="newsfeed-card__community">trong {post.community}</span>
                )}
              </div>
            </div>
            <time className="newsfeed-card__time">{formatDate(post.createdAt)}</time>
          </div>
          <h2 className="newsfeed-card__title">{post.title}</h2>
          <div className="newsfeed-card__footer">
            <div className="newsfeed-card__stats">
              <div className="newsfeed-card__votes">
                <button className="newsfeed-card__vote-btn newsfeed-card__vote-btn--up">
                  <ArrowUp size={18} />
                  <span>{post.upVotes}</span>
                </button>
                <span className="newsfeed-card__score font-bold">
                  {post.score || post.upVotes - post.downVotes}
                </span>
                <button className="newsfeed-card__vote-btn newsfeed-card__vote-btn--down">
                  <ArrowDown size={18} />
                  <span>{post.downVotes}</span>
                </button>
              </div>
              <div className="newsfeed-card__interactions">
                <div className="newsfeed-card__interaction">
                  <MessageCircle size={18} />
                  <span>{post.totalComments}</span>
                </div>
                <div className="newsfeed-card__interaction">
                  <Heart size={18} />
                  <span>{post.totalReacts}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default Card;