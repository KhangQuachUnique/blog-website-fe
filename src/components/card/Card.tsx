import { Link } from "react-router-dom";
import type { IPostResponseDto } from "../../types/post";
import { InteractBar } from "../InteractBar";
import { useAuth } from "../../contexts/AuthContext";
import Avatar from '@mui/material/Avatar';
import { stringAvatar } from '../../utils/avatarHelper';
import "../../styles/newsfeed/Card.css";

const Card = ({ post }: { post: IPostResponseDto }) => {
  const { user } = useAuth();
  
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diff = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

    if (diff < 60) return "vừa xong";
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
    return dateObj.toLocaleDateString("vi-VN");
  };

  return (
    <article className="newsfeed-card hover:shadow-lg transition-shadow">
      {/* Thumbnail bên trái */}
      {post.thumbnailUrl && (
        <Link to={`/post/${post.id}`} className="newsfeed-card__thumbnail">
          <img
            src={post.thumbnailUrl}
            alt={post.title}
            className="newsfeed-card__image"
            loading="lazy"
          />
        </Link>
      )}
      
      {/* Content + InteractBar bên phải */}
      <div className="newsfeed-card__right">
        <Link to={`/post/${post.id}`} className="newsfeed-card__content">
          <h2 className="newsfeed-card__title">{post.title}</h2>
          <div className="newsfeed-card__header">
            <div className="newsfeed-card__author">
              {post.author.avatarUrl ? (
                <img
                  src={post.author.avatarUrl}
                  alt={post.author.username}
                  className="newsfeed-card__avatar"
                />
              ) : (
                <Avatar {...stringAvatar(post.author.username, 40, '1rem')} />
              )}
              <div className="newsfeed-card__author-info">
                <span className="newsfeed-card__username">
                  {post.author.username}
                </span>
                {/* <span className="newsfeed-card__username">
                  {post.author.username}
                </span> */}
                {post.community && (
                  <span className="newsfeed-card__community">
                    trong{" "}
                    {typeof post.community === "string"
                      ? post.community
                      : post.community.name}
                    trong{" "}
                    {typeof post.community === "string"
                      ? post.community
                      : post.community.name}
                  </span>
                )}
              </div>
            </div>
            <time className="newsfeed-card__time">
              {formatDate(post.createdAt)}
            </time>
            {/* <time className="newsfeed-card__time">
              {formatDate(post.createdAt)}
            </time> */}
          </div>
          {post.hashtags && post.hashtags.length > 0 && (
            <div className="newsfeed-card__hashtags">
              {post.hashtags.map((h) => (
                <span key={h.id} className="newsfeed-card__hashtag">
                  #{h.name}
                </span>
              ))}
            </div>
          )}
        </Link>
        
        {/* InteractBar nằm dưới content */}
        <div className="newsfeed-card__interact" onClick={(e) => e.stopPropagation()}>
          <InteractBar
            postId={post.id}
            userId={user?.id ?? 0}
            initialUpVotes={post.upVotes}
            initialDownVotes={post.downVotes}
            totalComments={post.totalComments}
          />
        </div>
      </div>
    </article>
  );
};

export default Card;
