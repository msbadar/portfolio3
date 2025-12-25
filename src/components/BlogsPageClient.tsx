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
      <main className="flex-1 max-w-[680px] ml-20 mr-[380px]">
        <header className="sticky top-0 z-10 px-6 py-4 bg-white/70 backdrop-blur-xl border-b border-slate-200/50">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
            Blogs
          </h1>
          <p className="text-slate-500 mt-1">Discover insightful articles from our community</p>
        </header>
        <div className="p-6 grid gap-6">
          {blogs.loading ? (
            [1, 2, 3].map((i) => <BlogSkeleton key={i} />)
          ) : blogs.error ? (
            <div className="text-center py-12">
              <p className="text-rose-500 mb-4">{blogs.error}</p>
              <button
                onClick={fetchBlogs}
                className="px-4 py-2 bg-slate-100 rounded-xl text-sm font-medium hover:bg-slate-200 transition-all"
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
      <div className="flex justify-between min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 font-sans text-slate-900">
        <BlogsContent />
      </div>
    </AppProvider>
  );
};
