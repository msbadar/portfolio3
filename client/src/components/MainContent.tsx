"use client";

import React, { useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { usePosts } from "@/hooks/usePosts";
import { useBlogs } from "@/hooks/useBlogs";
import { useUsers } from "@/hooks/useUsers";
import { ProfileHeader } from "@/components/ProfileHeader";
import { Post } from "@/components/Post";
import { BlogCard } from "@/components/BlogCard";
import { PostSkeleton, BlogSkeleton } from "@/components/ui/Skeleton";

export const MainContent = () => {
  const { ui, dispatchUI } = useApp();
  const { posts, fetchPosts, likePost } = usePosts();
  const { blogs, fetchBlogs, selectBlog } = useBlogs();
  const { fetchCurrentUser } = useUsers();

  // Initial data fetch
  useEffect(() => {
    fetchPosts();
    fetchBlogs();
    fetchCurrentUser();
  }, [fetchPosts, fetchBlogs, fetchCurrentUser]);

  return (
    <main className="flex-1 min-w-0 bg-[var(--background)] overflow-y-auto">
      <ProfileHeader />

      {/* Tabs */}
      <div className="flex gap-6 px-8 py-2 border-b border-[var(--border)]">
        {["threads", "blogs", "replies", "reposts"].map((tab) => (
          <button
            key={tab}
            onClick={() =>
              dispatchUI({ type: "SET_PROFILE_TAB", payload: tab })
            }
            className={`px-2 py-3 font-semibold text-sm capitalize relative transition-all ${
              ui.profileTab === tab
                ? "text-[var(--accent)]"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {tab}
            {ui.profileTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent)] rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {ui.profileTab === "blogs" ? (
        <div className="p-8 grid gap-6 max-w-4xl mx-auto">
          {blogs.loading ? (
            [1, 2, 3].map((i) => <BlogSkeleton key={i} />)
          ) : blogs.error ? (
            <div className="text-center py-12">
              <p className="text-rose-500 mb-4">{blogs.error}</p>
              <button
                onClick={fetchBlogs}
                className="px-4 py-2 bg-[var(--surface)] rounded-xl text-sm font-medium hover:bg-[var(--surface-hover)] transition-all"
              >
                Try Again
              </button>
            </div>
          ) : (
            blogs.data.map((blog, i) => (
              <BlogCard
                key={blog.id}
                blog={blog}
                onClick={selectBlog}
                index={i}
              />
            ))
          )}
        </div>
      ) : (
        <div className="p-8 space-y-3 max-w-2xl mx-auto">
          {posts.loading ? (
            [1, 2, 3].map((i) => <PostSkeleton key={i} />)
          ) : posts.error ? (
            <div className="text-center py-12">
              <p className="text-rose-500 mb-4">{posts.error}</p>
              <button
                onClick={fetchPosts}
                className="px-4 py-2 bg-[var(--surface)] rounded-xl text-sm font-medium hover:bg-[var(--surface-hover)] transition-all"
              >
                Try Again
              </button>
            </div>
          ) : (
            posts.data.map((post, i) => (
              <div
                key={post.id}
                style={{ animation: `slideUp 0.4s ease ${i * 0.05}s both` }}
              >
                <Post post={post} onLike={likePost} />
              </div>
            ))
          )}
        </div>
      )}
    </main>
  );
};
