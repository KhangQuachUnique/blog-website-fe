import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";

import type { IPostResponseDto } from "../../types/post";
import { EPostType } from "../../types/post";
import InteractBar from "../interactBar/InteractBar";
import { recordViewedPost } from "../../services/user/viewedHistory/viewedHistory";
import { useAuth } from "../../contexts/AuthContext";
import { useGetPostById } from "../../hooks/usePost";
import { stringAvatar } from "../../utils/avatarHelper";
import "../../styles/newsfeed/Card.css";
import ReactionSection from "../Emoji";

const Card = ({ post }: { post: IPostResponseDto }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

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

  useEffect(() => {
    console.log("Original post data:", fetchedOriginal);
  }, [fetchedOriginal]);

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
        <article className="newsfeed-card newsfeed-card--repost hover:shadow-lg transition-shadow !h-[430px]">
          {/* Thumbnail (links to original post) */}
          {(fetchedOriginal?.thumbnailUrl || post.thumbnailUrl) && (
            <Link
              to={`/post/${fetchedOriginal?.id}`}
              className="newsfeed-card__thumbnail"
              onClick={() => {
                if (user && user.id)
                  recordViewedPost(
                    fetchedOriginal?.id ?? post.originalPostId ?? post.id
                  );
              }}
            >
              <img
                src={fetchedOriginal?.thumbnailUrl ?? post.thumbnailUrl}
                alt={fetchedOriginal?.title ?? post.title}
                className="newsfeed-card__image"
                loading="lazy"
              />
            </Link>
          )}

          {/* Right side: repost header (compact) + original content */}
          <div className="newsfeed-card__right">
            {/* Compact repost header — links to the repost itself */}
            <div
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
              <div
                className="newsfeed-card__repost-meta w-full"
                onClick={() => {
                  if (user && user.id) recordViewedPost(post.id);
                }}
              >
                <div className="newsfeed-card__header w-full">
                  <div className="newsfeed-card__author">
                    <div>
                      {post.author.avatarUrl ? (
                        <img
                          src={post.author.avatarUrl}
                          alt={post.author.username}
                          className="newsfeed-card__avatar !w-[30px] !h-[30px]"
                          onClick={(e) => handleAvatarClick(e, post.author.id)}
                          style={{ cursor: "pointer" }}
                        />
                      ) : (
                        <div
                          onClick={(e) => handleAvatarClick(e, post.author.id)}
                          style={{ cursor: "pointer" }}
                        >
                          <Avatar
                            {...stringAvatar(
                              post.author.username,
                              30,
                              "1rem",
                              "",
                              "none"
                            )}
                          />
                        </div>
                      )}
                    </div>
                    <div className="newsfeed-card__author-info">
                      <span
                        className="newsfeed-card__username"
                        onClick={(e) => handleAvatarClick(e, post.author.id)}
                        style={{ cursor: "pointer" }}
                      >
                        {post.author.username}
                        <span className="text-gray-500 font-normal ml-3">
                          đã đăng lại
                        </span>
                      </span>
                    </div>
                  </div>
                  <span className="newsfeed-card__time">
                    {formatDate(post.createdAt)}
                  </span>
                </div>
                <h2 className="newsfeed-card__title">{post.title}</h2>

                {post.hashtags && post.hashtags.length > 0 && (
                  <div className="newsfeed-card__hashtags mt-2">
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
              </div>
            </div>

            {/* Original post content — links to original post */}
            <Link
              to={`/post/${
                fetchedOriginal?.id ?? post.originalPostId ?? post.id
              }`}
              className="newsfeed-card__content"
              onClick={() => {
                if (user && user.id)
                  recordViewedPost(
                    fetchedOriginal?.id ?? post.originalPostId ?? post.id
                  );
              }}
            >
              <h2 className="newsfeed-card__title">
                {fetchedOriginal?.title ?? post.title}
              </h2>

              <div className="newsfeed-card__header">
                <div className="newsfeed-card__author">
                  {fetchedOriginal?.author?.avatarUrl ? (
                    <img
                      src={fetchedOriginal.author.avatarUrl}
                      alt={fetchedOriginal.author.username}
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
                        {...stringAvatar(
                          post.author.username,
                          50,
                          "1rem",
                          "",
                          "none"
                        )}
                      />
                    </div>
                  )}
                  <div className="newsfeed-card__author-info">
                    <span
                      className="newsfeed-card__username"
                      onClick={(e) =>
                        handleAvatarClick(
                          e,
                          fetchedOriginal?.author?.id ?? post.author.id
                        )
                      }
                      style={{ cursor: "pointer" }}
                    >
                      {fetchedOriginal?.author?.username ??
                        post.author.username}
                    </span>
                    {fetchedOriginal?.community && (
                      <span className="newsfeed-card__community">
                        {typeof fetchedOriginal.community === "string"
                          ? fetchedOriginal.community
                          : fetchedOriginal.community.name}
                      </span>
                    )}
                  </div>
                </div>
                <time className="newsfeed-card__time">
                  {formatDate(fetchedOriginal?.createdAt ?? post.createdAt)}
                </time>
              </div>

              {fetchedOriginal?.hashtags &&
                fetchedOriginal.hashtags.length > 0 && (
                  <div className="newsfeed-card__hashtags">
                    {fetchedOriginal.hashtags.map((h) => (
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
              className="newsfeed-card__interact !p-0"
              onClick={(e) => e.stopPropagation()}
            >
              <ReactionSection
                postId={post?.id ?? post.originalPostId ?? post.id}
                reactions={post?.reacts?.emojis ?? []}
              />
              <div className="pl-2 border-t border-t-[#FFC9DC]">
                <InteractBar
                  postId={post?.id ?? post.originalPostId ?? post.id}
                  userId={user?.id ?? 0}
                  votes={post.votes}
                  totalComments={post.totalComments}
                  post={fetchedOriginal ?? post}
                />
              </div>
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
                        {...stringAvatar(
                          post.author.username,
                          50,
                          "1rem",
                          "",
                          "none"
                        )}
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
              className="newsfeed-card__interact bg-white"
              onClick={(e) => e.stopPropagation()}
            >
              <ReactionSection
                postId={post.id}
                reactions={post.reacts?.emojis ?? []}
              />
              <div className="pl-2 border-t border-t-[#FFC9DC]">
                <InteractBar
                  postId={post.id}
                  userId={user?.id ?? 0}
                  votes={post.votes}
                  totalComments={post.totalComments}
                  post={post}
                />
              </div>
            </div>
          </div>
        </article>
      )}
    </>
  );
};

export default Card;
