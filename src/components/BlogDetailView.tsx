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
            className="text-2xl font-bold mt-10 mb-4 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent"
          >
            {line.replace("## ", "")}
          </h2>
        );
      if (line.startsWith("### "))
        return (
          <h3
            key={i}
            className="text-xl font-semibold mt-8 mb-3 text-slate-800"
          >
            {line.replace("### ", "")}
          </h3>
        );
      if (line.startsWith("**") && line.endsWith("**"))
        return (
          <p key={i} className="font-semibold mt-6 mb-2 text-slate-900">
            {line.replace(/\*\*/g, "")}
          </p>
        );
      if (line.startsWith("- "))
        return (
          <li key={i} className="ml-6 mb-2 text-slate-600 list-disc">
            {line.replace("- ", "")}
          </li>
        );
      if (line.trim() === "") return <div key={i} className="h-4" />;
      return (
        <p key={i} className="mb-4 leading-loose text-slate-600">
          {line}
        </p>
      );
    });
  };

  if (!blog) return null;

  return (
    <main className="flex-1 ml-24 mr-96 min-w-0 px-4">
      <header className="sticky top-0 z-10 px-6 py-4 bg-white/70 backdrop-blur-xl border-b border-slate-200/50">
        <div className="flex items-center gap-4">
          <button
            onClick={clearSelection}
            className="p-2 -ml-2 rounded-xl hover:bg-slate-100 transition-all"
          >
            {Icons.back()}
          </button>
          <span className="text-lg font-semibold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
            Article
          </span>
        </div>
      </header>

      <article className="animate-fadeIn">
        <div className="relative h-96 overflow-hidden">
          <Image
            src={blog.coverImage}
            alt={blog.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-md text-white text-xs font-medium rounded-full mb-4">
              {Icons.sparkle()}
              {blog.category}
            </span>
            <h1 className="text-4xl font-bold text-white leading-tight">
              {blog.title}
            </h1>
          </div>
        </div>

        <div className="px-8 py-8">
          <div className="flex items-center gap-4 pb-8 border-b border-slate-200">
            <div className="relative flex-shrink-0">
              <Image
                src={users.currentUser?.avatar || ""}
                alt={users.currentUser?.name || "Author"}
                width={56}
                height={56}
                className="w-14 h-14 rounded-2xl object-cover ring-4 ring-white shadow-lg"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lg">
                  {users.currentUser?.name}
                </span>
                <span className="flex-shrink-0">{Icons.verified()}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
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
                  ? "bg-indigo-100 text-indigo-600"
                  : "hover:bg-slate-100 text-slate-400"
              }`}
            >
              {Icons.bookmark(users.bookmarks[blog.id])}
            </button>
          </div>

          <div className="py-8 text-base">{renderMarkdown(blog.content)}</div>

          <div className="flex items-center gap-2 py-6 border-t border-slate-200">
            <button
              onClick={() => likeBlog(blog.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                blog.liked
                  ? "bg-rose-50 text-rose-600"
                  : "hover:bg-slate-100 text-slate-600"
              }`}
            >
              {Icons.heart(blog.liked)}
              <span>{formatCount(blog.likes)}</span>
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-medium transition-all">
              {Icons.comment()} {formatCount(blog.comments)}
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-medium transition-all ml-auto">
              {Icons.share()} Share
            </button>
          </div>

          <div className="py-8 border-t border-slate-200">
            <h3 className="text-lg font-bold mb-6">More articles</h3>
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
                    className="group flex items-center gap-4 p-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/50 hover:border-slate-300 cursor-pointer transition-all hover:shadow-lg hover:shadow-slate-200/50"
                  >
                    <Image
                      src={b.coverImage}
                      alt={b.title}
                      width={96}
                      height={96}
                      className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium text-indigo-600 block mb-1">
                        {b.category}
                      </span>
                      <h4 className="font-semibold group-hover:text-indigo-600 transition-colors line-clamp-2 mb-1.5">
                        {b.title}
                      </h4>
                      <span className="text-sm text-slate-500 block">
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
