"use client";

import React from "react";
import Image from "next/image";
import { Icons } from "@/components/ui/Icons";
import { formatCount } from "@/utils/formatters";
import { useBlogs } from "@/hooks/useBlogs";
import { useUsers } from "@/hooks/useUsers";
import { useApp } from "@/context/AppContext";

export const BlogDetailView = () => {
  const { blogs, clearSelection, likeBlog } = useBlogs();
  const { users, toggleBookmark } = useUsers();
  const { dispatchBlogs } = useApp();
  const blog = blogs.selected;

  const renderMarkdown = (content: string) => {
    return content.split("\n").map((line, i) => {
      if (line.startsWith("## "))
        return (
          <h2
            key={i}
            className="text-2xl font-bold mt-10 mb-4 text-[var(--accent)]"
          >
            {line.replace("## ", "")}
          </h2>
        );
      if (line.startsWith("### "))
        return (
          <h3
            key={i}
            className="text-xl font-semibold mt-8 mb-3 text-[var(--foreground)]"
          >
            {line.replace("### ", "")}
          </h3>
        );
      if (line.startsWith("**") && line.endsWith("**"))
        return (
          <p key={i} className="font-semibold mt-6 mb-2 text-[var(--foreground)]">
            {line.replace(/\*\*/g, "")}
          </p>
        );
      if (line.startsWith("- "))
        return (
          <li key={i} className="ml-6 mb-2 text-[var(--muted)] list-disc">
            {line.replace("- ", "")}
          </li>
        );
      if (line.trim() === "") return <div key={i} className="h-4" />;
      return (
        <p key={i} className="mb-4 leading-loose text-[var(--muted)]">
          {line}
        </p>
      );
    });
  };

  if (!blog) return null;

  return (
    <main className="flex-1 min-w-0 bg-[var(--background)] overflow-y-auto">
      <header className="sticky top-0 z-10 px-8 py-5 bg-[var(--surface)]/95 backdrop-blur-xl border-b border-[var(--border)]">
        <div className="flex items-center gap-4 max-w-4xl mx-auto">
          <button
            onClick={clearSelection}
            className="p-2 -ml-2 rounded-xl hover:bg-[var(--surface-hover)] text-[var(--muted)] hover:text-[var(--foreground)] transition-all"
          >
            {Icons.back()}
          </button>
          <span className="text-lg font-semibold text-[var(--accent)]">
            Article
          </span>
        </div>
      </header>

      <article className="animate-fadeIn">
        <div className="relative h-80 overflow-hidden">
          <Image
            src={blog.coverImage}
            alt={blog.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--accent)]/20 backdrop-blur-md text-[var(--accent)] text-xs font-medium rounded-full mb-4">
              {Icons.sparkle()}
              {blog.category}
            </span>
            <h1 className="text-3xl font-bold text-white leading-tight">
              {blog.title}
            </h1>
          </div>
        </div>

        <div className="px-8 py-8 max-w-4xl mx-auto">
          <div className="flex items-center gap-4 pb-8">
            <div className="relative flex-shrink-0">
              <Image
                src={users.currentUser?.avatar || ""}
                alt={users.currentUser?.name || "Author"}
                width={48}
                height={48}
                className="w-12 h-12 rounded-2xl object-cover ring-4 ring-[var(--background)] shadow-lg"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-[var(--accent)] rounded-full border-2 border-[var(--background)]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-base text-[var(--foreground)]">
                  {users.currentUser?.name}
                </span>
                <span className="flex-shrink-0">{Icons.verified()}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[var(--muted)] mt-1">
                <span>{blog.date}</span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  {Icons.clock()} {blog.readTime}
                </span>
              </div>
            </div>
            <button
              onClick={() => toggleBookmark(blog.id)}
              className={`p-3 rounded-xl transition-all flex-shrink-0 ${
                users.bookmarks[blog.id]
                  ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                  : "hover:bg-[var(--surface-hover)] text-[var(--muted)]"
              }`}
            >
              {Icons.bookmark(users.bookmarks[blog.id])}
            </button>
          </div>

          <div className="py-6 text-base">{renderMarkdown(blog.content)}</div>

          <div className="flex items-center gap-2 py-6">
            <button
              onClick={() => likeBlog(blog.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                blog.liked
                  ? "bg-rose-500/10 text-rose-500"
                  : "hover:bg-[var(--surface-hover)] text-[var(--muted)]"
              }`}
            >
              {Icons.heart(blog.liked)}
              <span>{formatCount(blog.likes)}</span>
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[var(--muted)] hover:bg-[var(--surface-hover)] font-medium transition-all">
              {Icons.comment()} {formatCount(blog.comments)}
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[var(--muted)] hover:bg-[var(--surface-hover)] font-medium transition-all ml-auto">
              {Icons.share()} Share
            </button>
          </div>

          <div className="pt-6">
            <h3 className="text-lg font-bold mb-6 text-[var(--foreground)]">More articles</h3>
            <div className="grid gap-4">
              {blogs.data
                .filter((b) => b.id !== blog.id)
                .slice(0, 2)
                .map((b) => (
                  <div
                    key={b.id}
                    onClick={() =>
                      dispatchBlogs({ type: "SELECT_BLOG", payload: b })
                    }
                    className="group flex items-center gap-4 p-4 rounded-2xl bg-[var(--surface)] hover:bg-[var(--surface-hover)] hover:shadow-lg hover:shadow-black/10 cursor-pointer transition-all"
                  >
                    <Image
                      src={b.coverImage}
                      alt={b.title}
                      width={80}
                      height={80}
                      className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium text-[var(--accent)] block mb-1">
                        {b.category}
                      </span>
                      <h4 className="font-semibold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors line-clamp-2 mb-1.5 text-sm">
                        {b.title}
                      </h4>
                      <span className="text-sm text-[var(--muted)] block">
                        {b.readTime}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </article>
    </main>
  );
};
