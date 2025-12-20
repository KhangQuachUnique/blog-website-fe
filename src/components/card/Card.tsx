import { Link } from "react-router-dom";
import { memo, useMemo } from "react";
import type { IPostResponseDto } from "../../types/post";
import InteractBar from "../interactBar/InteractBar";
import { recordViewedPost } from "../../services/user/viewedHistory";
import { useAuth } from "../../contexts/AuthContext";
import "../../styles/newsfeed/Card.css";
import ReactionSection from "../Emoji";
import { useQueryClient } from "@tanstack/react-query";
import { getOrCreateSessionSeed } from "../../hooks/useNewsFeed";
import type { EmojiReactSummaryDto } from "../../types/userReact";

const Card = memo(({ post }: { post: IPostResponseDto }) => {
  const queryClient = useQueryClient();
  const sessionSeed = getOrCreateSessionSeed();
  const { user } = useAuth();

  const reactions = useMemo<EmojiReactSummaryDto[]>(() => {
    const cacheData = queryClient.getQueryData<any>(["newsfeed", sessionSeed]);

    if (!cacheData?.pages) return post.reacts?.emojis ?? [];

    for (const page of cacheData.pages) {
      const items = page.items ?? page.data?.items ?? page.results ?? page;
      if (!Array.isArray(items)) continue;

      const foundPost = items.find((p: any) => p.id === post.id);
      if (foundPost?.reacts?.emojis) {
        return foundPost.reacts.emojis;
      }
    }

    return post.reacts?.emojis ?? [];
  }, [queryClient, sessionSeed, post.id, post.reacts?.emojis]);

  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return "vừa xong";
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  return (
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

        {/* InteractBar + Reactions nằm dưới content */}
        <div
          className="newsfeed-card__interact"
          onClick={(e) => e.stopPropagation()}
        >
          <ReactionSection postId={post.id} reactions={reactions} />
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
});

Card.displayName = "Card";

export default Card;
