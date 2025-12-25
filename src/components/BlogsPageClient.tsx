"use client";

import React, { useEffect } from "react";
import { AppProvider } from "@/context/AppContext";
import { useBlogs } from "@/hooks/useBlogs";
import { Sidebar } from "@/components/layout/Sidebar";
import { RightSidebar } from "@/components/RightSidebar";
import { BlogCard } from "@/components/BlogCard";
import { BlogSkeleton } from "@/components/ui/Skeleton";

const BlogsContent = () => {
  const { blogs, fetchBlogs, selectBlog } = useBlogs();

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  return (
    <>
      <Sidebar />
      <main className="flex-1 ml-20 mr-80 min-w-0">
        <header className="sticky top-0 z-10 px-6 py-4 bg-[var(--surface)]/95 backdrop-blur-xl border-b border-[var(--border)]">
          <h1 className="text-2xl font-bold text-[var(--accent)]">
            Blogs
          </h1>
          <p className="text-[var(--muted)] mt-1">Discover insightful articles from our community</p>
        </header>
        <div className="p-6 grid gap-6">
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
      </main>
      <RightSidebar />
    </>
  );
};

export const BlogsPageClient = () => {
  return (
    <AppProvider>
      <div className="flex min-h-screen bg-[var(--background)] font-sans text-[var(--foreground)]">
        <BlogsContent />
      </div>
    </AppProvider>
  );
};
