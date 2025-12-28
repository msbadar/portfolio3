"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, Heart, MessageCircle } from "lucide-react";
import type { Blog } from "@/types";

interface BlogCardProps {
  blog: Blog;
  onClick?: (blog: Blog) => void;
  index?: number;
}

export const BlogCard = ({ blog, onClick, index = 0 }: BlogCardProps) => {
  const handleClick = () => {
    if (onClick) {
      onClick(blog);
    }
  };

  return (
    <article
      className="group bg-[var(--surface)] rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer"
      onClick={handleClick}
      style={{ animation: `slideUp 0.4s ease ${index * 0.1}s both` }}
    >
      {/* Cover Image */}
      {blog.coverImage && (
        <div className="relative h-48 overflow-hidden">
          <Image
            src={blog.coverImage}
            alt={blog.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-4 left-4">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-medium">
              {blog.category}
            </span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Category badge if no cover image */}
        {!blog.coverImage && (
          <span className="inline-block px-3 py-1 bg-[var(--accent)]/10 text-[var(--accent)] rounded-full text-xs font-medium mb-3">
            {blog.category}
          </span>
        )}

        {/* Title */}
        <h3 className="text-xl font-bold text-[var(--foreground)] mb-2 group-hover:text-[var(--accent)] transition-colors line-clamp-2">
          {blog.title}
        </h3>

        {/* Excerpt */}
        <p className="text-[var(--muted)] text-sm mb-4 line-clamp-2">
          {blog.excerpt}
        </p>

        {/* Meta info */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
          <div className="flex items-center gap-3">
            <Image
              src={blog.user.avatar}
              alt={blog.user.name}
              width={32}
              height={32}
              className="rounded-full"
            />
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">
                {blog.user.name}
              </p>
              <p className="text-xs text-[var(--muted)]">{blog.date}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[var(--muted)]">
            <div className="flex items-center gap-1 text-xs">
              <Clock size={14} />
              <span>{blog.readTime}</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Heart size={14} className={blog.liked ? "fill-rose-500 text-rose-500" : ""} />
              <span>{blog.likes}</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <MessageCircle size={14} />
              <span>{blog.comments}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Read more link */}
      <Link
        href={`/posts/${blog.id}`}
        className="block px-6 py-3 bg-[var(--background)]/50 text-center text-sm font-medium text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        Read Full Article →
      </Link>
    </article>
  );
};
