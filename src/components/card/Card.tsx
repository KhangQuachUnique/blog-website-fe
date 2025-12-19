import React, { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { IPostResponseDto, IEmojiSummaryDto, IReactionSummaryDto } from "../../types/post";
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
  const navigate = useNavigate();

  // Handle hashtag click - navigate to search page
  const handleHashtagClick = (e: React.MouseEvent, hashtagName: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/search?q=${encodeURIComponent(hashtagName)}&type=hashtag`);
  };

  // Extract reactions safely using typed fields
  const reactionsData: IReactionSummaryDto | undefined = post.reacts ?? post.reactions;
  const reactionEmojis: Array<{ node: React.ReactNode; count: number }> = [];
  if (reactionsData && Array.isArray(reactionsData.emojis)) {
    for (const r of reactionsData.emojis as IEmojiSummaryDto[]) {
      const cnt = r.totalCount ?? 0;
      let node: React.ReactNode;

      // Prefer emoji image url if provided (custom emoji asset), otherwise construct from codepoint, otherwise fallback to raw char
      if (r.emojiUrl) {
        node = <img src={r.emojiUrl} alt="emoji" style={{ width: 18, height: 18 }} />;
      } else if (r.codepoint) {
        let ch: string;
        try {
          const parts = r.codepoint.split('-').map((p: string) => parseInt(p, 16));
          ch = String.fromCodePoint(...parts);
        } catch {
          ch = '💗';
        }
        node = <span>{ch}</span>;
      } else {
        node = <span>💗</span>;
      }

      reactionEmojis.push({ node, count: cnt });
    }
  }

  // Reactions container ref (used for repost horizontal scroll behavior)
  const reactionsRef = useRef<HTMLDivElement | null>(null);

  // Check if this is a repost
  const isRepost = post.type === EPostType.REPOST;

  // For repost cards: convert vertical wheel to horizontal scroll and enable drag-to-scroll
  useEffect(() => {
    if (!isRepost) return;
    const el = reactionsRef.current;
    if (!el) return;

    let isDown = false;
    let startX = 0;
    let startScrollLeft = 0;

    const onWheel = (e: WheelEvent) => {
      // Prefer vertical delta -> horizontal scroll
      if (Math.abs(e.deltaY) > 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };

    const onPointerDown = (ev: PointerEvent) => {
      isDown = true;
      startX = ev.clientX;
      startScrollLeft = el.scrollLeft;
      try { 
        el.setPointerCapture(ev.pointerId); 
      } catch {
        // Ignore pointer capture errors
      }
      el.style.cursor = 'grabbing';
    };

    const onPointerMove = (ev: PointerEvent) => {
      if (!isDown) return;
      const dx = ev.clientX - startX;
      el.scrollLeft = startScrollLeft - dx;
    };

    const endDrag = (ev?: PointerEvent) => {
      isDown = false;
      try {
        if (ev && typeof ev.pointerId !== 'undefined') {
          try {
            el.releasePointerCapture(ev.pointerId);
          } catch {
            // Ignore pointer release errors
          }
        }
      } catch {
        // Ignore errors
      }
      el.style.cursor = 'grab';
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('pointerdown', onPointerDown as EventListener);
    window.addEventListener('pointermove', onPointerMove as EventListener);
    window.addEventListener('pointerup', endDrag as EventListener);
    el.addEventListener('pointerleave', endDrag as EventListener);

    return () => {
      el.removeEventListener('wheel', onWheel as EventListener);
      el.removeEventListener('pointerdown', onPointerDown as EventListener);
      window.removeEventListener('pointermove', onPointerMove as EventListener);
      window.removeEventListener('pointerup', endDrag as EventListener);
      el.removeEventListener('pointerleave', endDrag as EventListener);
    };
  }, [isRepost, reactionEmojis.length]);
  
  
  // Always call the hook at top level (not conditionally)
  const originalId = post.originalPost?.id ?? post.originalPostId;
  const { data: fetchedOriginal } = useGetPostById(originalId ? Number(originalId) : 0);
  
  // Use the original post if it's already in the response, otherwise use the fetched data
  const original = post.originalPost ?? (originalId && fetchedOriginal ? (fetchedOriginal as IPostResponseDto) : undefined);
  
  const formatDate = (dateInput: string | Date) => {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    const now = new Date();
    const diff = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

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
                if (user && user.id) recordViewedPost(original?.id ?? post.originalPostId ?? post.id);
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
            </Link> */}

            {/* Original post content — links to original post */}
            <Link
              to={`/post/${original?.id ?? post.originalPostId ?? post.id}`}
              className="newsfeed-card__content"
              onClick={() => {
                if (user && user.id) recordViewedPost(original?.id ?? post.originalPostId ?? post.id);
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
            {/* Reactions (up to 2 rows) */}
            {reactionEmojis.length > 0 && (
              <div ref={reactionsRef} className="newsfeed-card__reactions" onClick={(e) => e.stopPropagation()}>
                    {reactionEmojis.map((r, idx) => (
                      <div key={idx} className="newsfeed-card__reaction">
                        <span className="newsfeed-card__reaction-emoji">{r.node}</span>
                        <span className="newsfeed-card__reaction-count">{r.count}</span>
                      </div>
                    ))}
              </div>
            )}

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
        {/* Reactions (up to 2 rows) */}
        {reactionEmojis.length > 0 && (
          <div className="newsfeed-card__reactions" onClick={(e) => e.stopPropagation()}>
            {reactionEmojis.map((r, idx) => (
              <div key={idx} className="newsfeed-card__reaction">
                <span className="newsfeed-card__reaction-emoji">{r.node}</span>
                <span className="newsfeed-card__reaction-count">{r.count}</span>
              </div>
            ))}
          </div>
        )}

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
