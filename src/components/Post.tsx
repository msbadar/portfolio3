"use client";

import React from "react";
import Image from "next/image";
import { Icons } from "@/components/ui/Icons";
import { formatCount } from "@/utils/formatters";
import type { Post as PostType } from "@/types";

interface PostProps {
  post: PostType;
  onLike: (postId: number) => void;
}

export const Post = ({ post, onLike }: PostProps) => (
  <article className="flex gap-4 p-6 hover:bg-slate-50/50 transition-all">
    <Image
      src={post.user.avatar}
      alt={post.user.name}
      width={48}
      height={48}
      className="w-12 h-12 rounded-2xl object-cover flex-shrink-0"
    />
    <div className="flex-1 min-w-0">
      <div className="flex items-start justify-between mb-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-[15px]">{post.user.username}</span>
          {post.user.verified && <span className="flex-shrink-0">{Icons.verified()}</span>}
          <span className="text-slate-400 text-sm">• {post.time}</span>
        </div>
        <button className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-all flex-shrink-0 -mt-1">
          {Icons.more()}
        </button>
      </div>
      <p className="text-[15px] leading-relaxed mb-3.5">{post.content}</p>
      {post.image && (
        <div className="mb-4 rounded-2xl overflow-hidden relative h-[400px]">
          <Image
            src={post.image}
            alt={`Image shared by ${post.user.username}`}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="flex gap-2">
        <button
          onClick={() => onLike(post.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            post.liked
              ? "text-rose-500 bg-rose-50"
              : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          {Icons.heart(post.liked)} {formatCount(post.likes)}
        </button>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-slate-500 hover:bg-slate-100 font-medium transition-all">
          {Icons.comment()} {post.comments}
        </button>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-slate-500 hover:bg-slate-100 font-medium transition-all">
          {Icons.repost()} {post.reposts}
        </button>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-slate-500 hover:bg-slate-100 font-medium transition-all">
          {Icons.share()}
        </button>
      </div>
    </div>
  </article>
);
