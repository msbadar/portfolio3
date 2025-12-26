"use client";

import React from "react";
import Image from "next/image";
import { Icons } from "@/components/ui/Icons";
import { formatCount } from "@/utils/formatters";
import type { Blog } from "@/types";

interface BlogCardProps {
  blog: Blog;
  onClick: (blog: Blog) => void;
  index: number;
}

export const BlogCard = ({ blog, onClick, index }: BlogCardProps) => (
  <article
    onClick={() => onClick(blog)}
    className="group relative bg-[var(--surface)] rounded-3xl overflow-hidden shadow-card hover:shadow-elevated transition-all duration-500 cursor-pointer"
    style={{ animation: `slideUp 0.5s ease ${index * 0.1}s both` }}
  >
    <div className="flex flex-col sm:flex-row">
      <div className="relative w-full sm:w-48 h-48 sm:h-40 overflow-hidden flex-shrink-0">
        <Image
          src={blog.coverImage}
          alt={blog.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[var(--surface)]/20" />
      </div>
      <div className="flex-1 p-6 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="px-2.5 py-0.5 bg-[var(--accent)] text-[var(--background)] text-xs font-semibold rounded-full">
              {blog.category}
            </span>
            <span className="text-xs text-[var(--muted)] flex items-center gap-1">
              {Icons.clock()} {blog.readTime}
            </span>
          </div>
          <h3 className="text-xl font-bold mb-3 text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors line-clamp-2">
            {blog.title}
          </h3>
          <p className="text-[var(--muted)] text-sm mb-4 line-clamp-2">
            {blog.excerpt}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--muted)]">{blog.date}</span>
          <div className="flex items-center gap-3 text-sm text-[var(--muted)]">
            <span className="flex items-center gap-1">
              {Icons.heart(false)} {formatCount(blog.likes)}
            </span>
            <span className="flex items-center gap-1">
              {Icons.comment()} {formatCount(blog.comments)}
            </span>
          </div>
        </div>
      </div>
    </div>
  </article>
);
