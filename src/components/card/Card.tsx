import { Link } from "react-router-dom";
import type { IPostResponseDto } from "../../types/post";
import { EPostType } from "../../types/post";
import { InteractBar } from "../InteractBar";
import { recordViewedPost } from '../../services/user/viewedHistory';
import { useAuth } from "../../contexts/AuthContext";
import { useGetPostById } from "../../hooks/usePost";
import "../../styles/newsfeed/Card.css";

const Card = ({ post }: { post: IPostResponseDto }) => {
  const { user } = useAuth();
  
  // Check if this is a repost
  const isRepost = post.type === EPostType.REPOST;
  
  // Fetch original post if only ID provided
  const originalId = post.originalPost?.id ?? (post as any).originalPostId;
  const { data: fetchedOriginal } = originalId ? useGetPostById(Number(originalId)) : { data: undefined };
  const original = post.originalPost ?? (fetchedOriginal as IPostResponseDto | undefined);
  
  const formatDate = (dateInput: string | Date) => {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return "vừa xong";
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  return (
    <>
      {/* REPOST layout */}
      {isRepost ? (
        <article style={{ 
          border: "1px solid #e5e7eb", 
          borderRadius: "8px", 
          overflow: "hidden",
          backgroundColor: "#fff",
          display: "flex",
          flexDirection: "column"
        }}>
          {/* Repost Header - Compact */}
          <Link
            to={`/post/${post.id}`}
            style={{
              padding: "8px 12px",
              backgroundColor: "#f9fafb",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "12px",
              color: "#6b7280",
              borderBottom: "1px solid #e5e7eb",
              textDecoration: "none",
              cursor: "pointer"
            }}
            onClick={() => {
              if (user && user.id) recordViewedPost(post.id);
            }}
          >
            <img
              src={post.author.avatarUrl}
              alt={post.author.username}
              style={{ 
                width: "24px", 
                height: "24px", 
                borderRadius: "50%",
                flexShrink: 0
              }}
            />
            <span 
              style={{ 
                fontWeight: "500",
                color: "#1f2937"
              }}
            >
              {post.author.username}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
              <img 
                src="/icons8-repost.png" 
                alt="repost" 
                style={{ width: "12px", height: "12px" }}
              />
              <span>chia sẻ</span>
            </div>
          </Link>

          {/* Main Content - 2 cột (thumbnail + content) */}
          <div style={{ display: "flex", flex: 1 }}>
            {/* Thumbnail bên trái */}
            {original?.thumbnailUrl && (
              <Link
                to={`/post/${original.id}`}
                style={{ 
                  display: "block",
                  textDecoration: "none",
                  color: "inherit",
                  flexShrink: 0
                }}
                onClick={() => {
                  if (user && user.id) recordViewedPost(original.id);
                }}
              >
                <img
                  src={original.thumbnailUrl}
                  alt={original.title}
                  style={{ 
                    width: "200px", 
                    height: "100%",
                    minHeight: "180px",
                    objectFit: "cover"
                  }}
                  loading="lazy"
                />
              </Link>
            )}
            
            {/* Content bên phải */}
            <Link
              to={`/post/${original?.id ?? (post as any).originalPostId ?? post.id}`}
              style={{ 
                flex: 1, 
                display: "flex", 
                flexDirection: "column", 
                padding: "12px 16px",
                textDecoration: "none",
                color: "inherit"
              }}
              onClick={() => {
                if (user && user.id) recordViewedPost(original?.id ?? (post as any).originalPostId ?? post.id);
              }}
            >
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: "15px", fontWeight: "600", marginBottom: "6px", color: "#1f2937", lineHeight: 1.3 }}>
                  {original?.title || post.title}
                </h2>
                {original?.author && (
                  <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
                    bởi <strong style={{ color: "#1f2937" }}>{original.author.username}</strong>
                  </div>
                )}
              </div>
              {original?.hashtags && original.hashtags.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                  {original.hashtags.slice(0, 3).map((h) => (
                    <span 
                      key={h.id} 
                      style={{ fontSize: "11px", color: "#f295b6" }}
                    >
                      #{h.name}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          </div>

          {/* InteractBar của người repost */}
          <div style={{ borderTop: "1px solid #e5e7eb", padding: "8px 12px" }} onClick={(e) => e.stopPropagation()}>
            <InteractBar
              postId={post.id}
              userId={user?.id ?? 0}
              initialUpVotes={post.upVotes}
              initialDownVotes={post.downVotes}
              totalComments={post.totalComments}
            />
          </div>
        </article>
      ) : (
        /* Normal card layout */
        <article className="newsfeed-card hover:shadow-lg transition-shadow">
      {/* Thumbnail bên trái */}
      {post.thumbnailUrl && (
        <Link
          to={`/post/${post.id}`}
          className="newsfeed-card__thumbnail"
          onClick={() => {
            if (user && user.id) recordViewedPost(post.id);
          }}
        >
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
        <Link
          to={`/post/${post.id}`}
          className="newsfeed-card__content"
          onClick={() => {
            if (user && user.id) recordViewedPost(post.id);
          }}
        >
          <h2 className="newsfeed-card__title">{post.title}</h2>
          <div className="newsfeed-card__header">
            <div className="newsfeed-card__author">
              <img
                src={post.author.avatarUrl}
                alt={post.author.username}
                className="newsfeed-card__avatar"
              />
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
      )}
    </>
  );
};

export default Card;
