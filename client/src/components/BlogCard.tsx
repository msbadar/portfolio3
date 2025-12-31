"use client";

import React from "react";
import Image from "next/image";
import { Icons } from "@/components/ui/Icons";
import type { Blog } from "@/types";

interface BlogCardProps {
  blog: Blog;
  onClick: (blog: Blog) => void;
  index: number;
}

export const BlogCard = ({ blog, onClick, index }: BlogCardProps) => {
  return (
    <article
      className="group flex flex-col sm:flex-row bg-[var(--surface)] rounded-3xl overflow-hidden border border-[var(--border)] hover:shadow-elevated hover:border-[var(--accent)]/20 transition-all duration-300 cursor-pointer animate-slideUp"
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={() => onClick(blog)}
    >
      {/* Cover Image */}
      {blog.coverImage && (
        <div className="relative w-full sm:w-48 h-48 sm:h-40 flex-shrink-0 overflow-hidden">
          <Image
            src={blog.coverImage}
            alt={blog.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
        <div>
          {/* Category & Date */}
          <div className="flex items-center gap-3 mb-2">
            {blog.category && (
              <span className="text-xs font-medium px-2.5 py-1 bg-[var(--accent)]/10 text-[var(--accent)] rounded-full">
                {blog.category}
              </span>
            )}
            <span className="text-xs text-[var(--muted)] flex items-center gap-1">
              {Icons.clock()}
              {blog.readTime}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-[var(--foreground)] line-clamp-2 mb-2 group-hover:text-[var(--accent)] transition-colors">
            {blog.title}
          </h3>

          {/* Excerpt */}
          <p className="text-sm text-[var(--muted)] line-clamp-2 mb-3">
            {blog.excerpt}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src={blog.user.avatar}
              alt={blog.user.name}
              width={24}
              height={24}
              className="w-6 h-6 rounded-full object-cover"
            />
            <span className="text-xs font-medium text-[var(--foreground)]">
              {blog.user.name}
            </span>
            {blog.user.verified && Icons.verified()}
          </div>

          <div className="flex items-center gap-3 text-[var(--muted)]">
            <span className="flex items-center gap-1 text-xs">
              {Icons.heart(false)}
              {blog.likes}
            </span>
            <span className="flex items-center gap-1 text-xs">
              {Icons.comment()}
              {blog.comments}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};
