import React, { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import { Repeat2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import type { IPostResponseDto } from "../../types/post";
import { EPostType } from "../../types/post";
import InteractBar from "../interactBar/InteractBar";
import { recordViewedPost } from "../../services/user/viewedHistory";
import { useAuth } from "../../contexts/AuthContext";
import { useGetPostById } from "../../hooks/usePost";
import { stringAvatar } from "../../utils/avatarHelper";
import "../../styles/newsfeed/Card.css";
import ReactionSection from "../Emoji";
import type { EmojiReactSummaryDto } from "../../types/userReact";
import type { IGetNewsfeedResponseDto } from "../../types/newsfeed";
import { getOrCreateSessionSeed } from "../../hooks/useNewsFeed";

const Card = ({ post }: { post: IPostResponseDto }) => {
  const queryClient = useQueryClient();
  const sessionSeed = getOrCreateSessionSeed();
  const { user } = useAuth();
  const navigate = useNavigate();

  const reactions = useMemo<EmojiReactSummaryDto[]>(() => {
    const cacheData = queryClient.getQueryData<IGetNewsfeedResponseDto>([
      "newsfeed",
      sessionSeed,
    ]);

    if (!cacheData?.items) {
      return post.reacts?.emojis ?? [];
    }

    const foundPost = cacheData.items.find((p) => p.id === post.id);

    return foundPost?.reacts?.emojis ?? post.reacts?.emojis ?? [];
  }, [queryClient, sessionSeed, post.id, post.reacts?.emojis]);

  // Handle hashtag click - navigate to search page
  const handleHashtagClick = (e: React.MouseEvent, hashtagName: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/search?q=${encodeURIComponent(hashtagName)}&type=hashtag`);
  };

  // Handle avatar/username click - navigate to profile
  const handleAvatarClick = (e: React.MouseEvent, authorId: number) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/profile/${authorId}`);
  };

  // Check if this is a repost
  const isRepost = post.type === EPostType.REPOST;

  // Always call the hook at top level (not conditionally)
  const originalId = post.originalPost?.id ?? post.originalPostId;
  const { data: fetchedOriginal } = useGetPostById(
    originalId ? Number(originalId) : 0
  );

  // Use the original post if it's already in the response, otherwise use the fetched data
  const original =
    post.originalPost ??
    (originalId && fetchedOriginal
      ? (fetchedOriginal as IPostResponseDto)
      : undefined);

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
              to={`/post/${original?.id ?? post.originalPostId ?? post.id}`}
              className="newsfeed-card__thumbnail"
              onClick={() => {
                if (user && user.id)
                  recordViewedPost(
                    original?.id ?? post.originalPostId ?? post.id
                  );
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
                textDecoration: "none",
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
                      onClick={(e) => handleAvatarClick(e, post.author.id)}
                      style={{ cursor: "pointer" }}
                    />
                    <div className="newsfeed-card__author-info">
                      <span
                        className="newsfeed-card__username"
                        onClick={(e) => handleAvatarClick(e, post.author.id)}
                        style={{ cursor: "pointer" }}
                      >
                        {post.author.username}
                      </span>
                    </div>
                  </div>
                  <time className="newsfeed-card__time">
                    {formatDate(post.createdAt)}
                  </time>
                </div>

                {post.hashtags && post.hashtags.length > 0 && (
                  <div className="newsfeed-card__hashtags">
                    {post.hashtags.map((h) => (
                      <span
                        key={h.id}
                        className="newsfeed-card__hashtag newsfeed-card__hashtag--clickable"
                        onClick={(e) => handleHashtagClick(e, h.name)}
                      >
                        #{h.name}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
              <div className="newsfeed-card__repost-label">
                <time className="newsfeed-card__time">
                  {formatDate(post.createdAt)}
                </time>
                {post.type === "REPOST" && <Repeat2 size={14} />}
                <span>Đăng lại</span>
              </div>
            </Link>

            {/* Original post content — links to original post */}
            <Link
              to={`/post/${original?.id ?? post.originalPostId ?? post.id}`}
              className="newsfeed-card__content"
              onClick={() => {
                if (user && user.id)
                  recordViewedPost(
                    original?.id ?? post.originalPostId ?? post.id
                  );
              }}
            >
              <h2 className="newsfeed-card__title">
                {original?.title ?? post.title}
              </h2>

              <div className="newsfeed-card__header">
                <div className="newsfeed-card__author">
                  <img
                    src={original?.author?.avatarUrl ?? post.author.avatarUrl}
                    alt={original?.author?.username ?? post.author.username}
                    className="newsfeed-card__avatar"
                    onClick={(e) =>
                      handleAvatarClick(
                        e,
                        original?.author?.id ?? post.author.id
                      )
                    }
                    style={{ cursor: "pointer" }}
                  />
                  <div className="newsfeed-card__author-info">
                    <span
                      className="newsfeed-card__username"
                      onClick={(e) =>
                        handleAvatarClick(
                          e,
                          original?.author?.id ?? post.author.id
                        )
                      }
                      style={{ cursor: "pointer" }}
                    >
                      {original?.author?.username ?? post.author.username}
                    </span>
                    {original?.community && (
                      <span className="newsfeed-card__community">
                        {typeof original.community === "string"
                          ? original.community
                          : original.community.name}
                      </span>
                    )}
                  </div>
                </div>
                <time className="newsfeed-card__time">
                  {formatDate(original?.createdAt ?? post.createdAt)}
                </time>
              </div>

              {original?.hashtags && original.hashtags.length > 0 && (
                <div className="newsfeed-card__hashtags">
                  {original.hashtags.map((h) => (
                    <span
                      key={h.id}
                      className="newsfeed-card__hashtag newsfeed-card__hashtag--clickable"
                      onClick={(e) => handleHashtagClick(e, h.name)}
                    >
                      #{h.name}
                    </span>
                  ))}
                </div>
              )}
            </Link>

            {/* InteractBar của người repost */}

            <div
              className="newsfeed-card__interact"
              onClick={(e) => e.stopPropagation()}
            >
              <InteractBar
                postId={post.id}
                userId={user?.id ?? 0}
                votes={post.votes}
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
              <div className="flex items-center justify-between">
                <h2 className="newsfeed-card__title">{post.title}</h2>
              </div>

              <div className="newsfeed-card__header">
                <div className="newsfeed-card__author">
                  {post.author.avatarUrl ? (
                    <img
                      src={post.author.avatarUrl}
                      alt={post.author.username}
                      className="newsfeed-card__avatar"
                      onClick={(e) => handleAvatarClick(e, post.author.id)}
                      style={{ cursor: "pointer" }}
                    />
                  ) : (
                    <div
                      onClick={(e) => handleAvatarClick(e, post.author.id)}
                      style={{ cursor: "pointer" }}
                    >
                      <Avatar
                        {...stringAvatar(post.author.username, 40, "1rem")}
                      />
                    </div>
                  )}
                  <div className="newsfeed-card__author-info">
                    <span
                      className="newsfeed-card__username"
                      onClick={(e) => handleAvatarClick(e, post.author.id)}
                      style={{ cursor: "pointer" }}
                    >
                      {post.author.username}
                    </span>
                    {post.community && (
                      <Link
                        to={`/community/${
                          typeof post.community === "string"
                            ? post.community
                            : post.community.id
                        }`}
                        className="newsfeed-card__community flex items-center gap-1 ml-1 px-2 py-1
                        hover:bg-gray-100 transition-colors rounded-md"
                      >
                        <img
                          className="w-6 h-6 rounded-full object-cover"
                          src={
                            typeof post.community === "string"
                              ? ""
                              : post.community.thumbnailUrl
                          }
                        />
                        trong{" "}
                        {typeof post.community === "string"
                          ? post.community
                          : post.community.name}
                      </Link>
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
                    <span
                      key={h.id}
                      className="newsfeed-card__hashtag newsfeed-card__hashtag--clickable"
                      onClick={(e) => handleHashtagClick(e, h.name)}
                    >
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
              <ReactionSection postId={post.id} reactions={reactions} />
              <InteractBar
                postId={post.id}
                userId={user?.id ?? 0}
                votes={post.votes}
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
