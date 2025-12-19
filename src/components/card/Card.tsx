import { Link } from "react-router-dom";
import type { IPostResponseDto } from "../../types/post";
import { EPostType } from "../../types/post";
import { InteractBar } from "../InteractBar";
import { recordViewedPost } from "../../services/user/viewedHistory";
import { useAuth } from "../../contexts/AuthContext";
import { useGetPostById } from "../../hooks/usePost";
import Avatar from "@mui/material/Avatar";
import { stringAvatar } from "../../utils/avatarHelper";
import "../../styles/newsfeed/Card.css";
import { Repeat2 } from "lucide-react";

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
        <article className="newsfeed-card newsfeed-card--repost hover:shadow-lg transition-shadow">
          {/* Thumbnail (links to original post) */}
          {(original?.thumbnailUrl || post.thumbnailUrl) && (
            <Link
              to={`/post/${original?.id ?? (post as any).originalPostId ?? post.id}`}
              className="newsfeed-card__thumbnail"
              onClick={() => {
                if (user && user.id) recordViewedPost(original?.id ?? (post as any).originalPostId ?? post.id);
              }}
            >
              <img
                src={original?.thumbnailUrl ?? post.thumbnailUrl}
                alt={original?.title ?? post.title}
                className="newsfeed-card__image"
                loading="lazy"
              />
            </Link>
          )}

          {/* Right side: repost header (compact) + original content */}
          <div className="newsfeed-card__right">
            {/* Compact repost header — links to the repost itself */}
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
                textDecoration: "none"
              }}
              onClick={() => {
                if (user && user.id) recordViewedPost(post.id);
              }}
            >
            <Link
              to={`/post/${post.id}`}
              className="newsfeed-card__repost-meta"
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
                    <span className="newsfeed-card__username">{post.author.username}</span>
                  </div>
                </div>
                <time className="newsfeed-card__time">{formatDate(post.createdAt)}</time>
              </div>

              {post.hashtags && post.hashtags.length > 0 && (
                <div className="newsfeed-card__hashtags">
                  {post.hashtags.map((h) => (
                    <span key={h.id} className="newsfeed-card__hashtag">#{h.name}</span>
                  ))}
                </div>
              )}
            </Link>
              <div className="newsfeed-card__repost-label">
                <time className="newsfeed-card__time">{formatDate(post.createdAt)}</time>
                {post.type === "REPOST" && <Repeat2 size={14} />}
                <span>Đăng lại</span>
              </div>
            </Link>

            {/* Repost metadata (links to the repost itself): title, time, hashtags, avatar
            <Link
              to={`/post/${post.id}`}
              className="newsfeed-card__repost-meta"
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
                    <span className="newsfeed-card__username">{post.author.username}</span>
                  </div>
                </div>
                <time className="newsfeed-card__time">{formatDate(post.createdAt)}</time>
              </div>

              {post.hashtags && post.hashtags.length > 0 && (
                <div className="newsfeed-card__hashtags">
                  {post.hashtags.map((h) => (
                    <span key={h.id} className="newsfeed-card__hashtag">#{h.name}</span>
                  ))}
                </div>
              )}
            </Link> */}

            {/* Original post content — links to original post */}
            <Link
              to={`/post/${original?.id ?? (post as any).originalPostId ?? post.id}`}
              className="newsfeed-card__content"
              onClick={() => {
                if (user && user.id) recordViewedPost(original?.id ?? (post as any).originalPostId ?? post.id);
              }}
            >
              <h2 className="newsfeed-card__title">{original?.title ?? post.title}</h2>

              <div className="newsfeed-card__header">
                <div className="newsfeed-card__author">
                  <img
                    src={original?.author?.avatarUrl ?? post.author.avatarUrl}
                    alt={original?.author?.username ?? post.author.username}
                    className="newsfeed-card__avatar"
                  />
                  <div className="newsfeed-card__author-info">
                    <span className="newsfeed-card__username">{original?.author?.username ?? post.author.username}</span>
                    {original?.community && (
                      <span className="newsfeed-card__community">
                        {typeof original.community === "string" ? original.community : original.community.name}
                      </span>
                    )}
                  </div>
                </div>
                <time className="newsfeed-card__time">{formatDate(original?.createdAt ?? post.createdAt)}</time>
              </div>

              {original?.hashtags && original.hashtags.length > 0 && (
                <div className="newsfeed-card__hashtags">
                  {original.hashtags.map((h) => (
                    <span key={h.id} className="newsfeed-card__hashtag">#{h.name}</span>
                  ))}
                </div>
              )}
            </Link>

            {/* InteractBar của người repost */}
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
              {post.author.avatarUrl ? (
                <img
                  src={post.author.avatarUrl}
                  alt={post.author.username}
                  className="newsfeed-card__avatar"
                />
              ) : (
                <Avatar {...stringAvatar(post.author.username, 40, "1rem")} />
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
        <div
          className="newsfeed-card__interact"
          onClick={(e) => e.stopPropagation()}
        >
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
