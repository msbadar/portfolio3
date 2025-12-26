"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Icons } from "@/components/ui/Icons";
import { Markdown } from "@/components/ui/Markdown";
import { PostDropdown } from "@/components/PostDropdown";
import { formatCount } from "@/utils/formatters";
import { shareContent } from "@/utils/share";
import { useApp } from "@/context/AppContext";
import { useUsers } from "@/hooks/useUsers";
import type { Post as PostType } from "@/types";

interface PostProps {
  post: PostType;
  onLike: (postId: number) => void;
  onDelete?: (postId: number) => void;
}

export const Post = ({ post, onLike, onDelete }: PostProps) => {
  const { showToast } = useApp();
  const { users } = useUsers();
  const MAX_CONTENT_LENGTH = 200;
  const shouldTruncate = post.content.length > MAX_CONTENT_LENGTH;
  const displayContent = shouldTruncate
    ? post.content.slice(0, MAX_CONTENT_LENGTH) + "..."
    : post.content;

  const isOwnPost = users.currentUser?.username === post.user.username;

  const handleShare = async () => {
    const success = await shareContent({
      title: `Post by @${post.user.username}`,
      text: post.content.slice(0, 100) + (post.content.length > 100 ? "..." : ""),
      url: typeof window !== "undefined" ? `${window.location.origin}/posts/${post.id}` : undefined,
    });

    if (success) {
      showToast("Shared successfully!", "success");
    }
  };

  const handleSave = () => {
    showToast("Post saved!", "success");
  };

  const handleReport = () => {
    showToast("Post reported. We'll review it shortly.", "info");
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(post.id);
    }
  };

  return (
    <article className="flex gap-4 p-8 bg-[var(--surface)] rounded-2xl shadow-card hover:shadow-card-hover hover:bg-[var(--surface-hover)] transition-all">
      <Image
        src={post.user.avatar}
        alt={post.user.name}
        width={48}
        height={48}
        className="w-12 h-12 rounded-2xl object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-[var(--foreground)]">{post.user.username}</span>
            {post.user.verified && <span className="flex-shrink-0">{Icons.verified()}</span>}
            <span className="text-[var(--muted)] text-sm">• {post.time}</span>
          </div>
          <PostDropdown
            postId={post.id}
            isOwnPost={isOwnPost}
            onSave={handleSave}
            onReport={handleReport}
            onDelete={isOwnPost ? handleDelete : undefined}
          />
        </div>
        <div className="text-sm leading-relaxed mb-2 text-[var(--foreground)]">
          <Markdown content={displayContent} />
        </div>
        {shouldTruncate && (
          <Link
            href={`/posts/${post.id}`}
            className="text-sm text-[var(--accent)] hover:underline mb-4 inline-block font-medium"
          >
            Read more
          </Link>
        )}
        {!shouldTruncate && <div className="mb-4"></div>}
        {post.image && (
          <div className="mb-4 rounded-2xl overflow-hidden relative h-96">
            <Image
              src={post.image}
              alt={`Image shared by ${post.user.username}`}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => onLike(post.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              post.liked
                ? "text-[var(--accent)] bg-[var(--accent)]/10"
                : "text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)]"
            }`}
          >
            {Icons.heart(post.liked)} {formatCount(post.likes)}
          </button>
          <Link
            href={`/posts/${post.id}`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)] font-medium transition-all"
          >
            {Icons.comment()} {post.comments}
          </Link>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)] font-medium transition-all">
            {Icons.repost()} {post.reposts}
          </button>
          <button 
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)] font-medium transition-all"
          >
            {Icons.share()}
          </button>
        </div>
      </div>
    </article>
  );
};
