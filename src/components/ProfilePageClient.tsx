"use client";

import React, { useEffect } from "react";
import { AppProvider, useApp } from "@/context/AppContext";
import { usePosts } from "@/hooks/usePosts";
import { useBlogs } from "@/hooks/useBlogs";
import { useUsers } from "@/hooks/useUsers";
import { Sidebar } from "@/components/layout/Sidebar";
import { RightSidebar } from "@/components/RightSidebar";
import { ProfileHeader } from "@/components/ProfileHeader";
import { Post } from "@/components/Post";
import { BlogCard } from "@/components/BlogCard";
import { ComposeModal } from "@/components/ComposeModal";
import { PostSkeleton, BlogSkeleton } from "@/components/ui/Skeleton";
import { ToastContainer } from "@/components/ui/Toast";

const ProfileContent = () => {
  const { ui, dispatchUI } = useApp();
  const { posts, fetchPosts, likePost } = usePosts();
  const { blogs, fetchBlogs, selectBlog } = useBlogs();
  const { fetchCurrentUser } = useUsers();

  useEffect(() => {
    fetchPosts();
    fetchBlogs();
    fetchCurrentUser();
  }, [fetchPosts, fetchBlogs, fetchCurrentUser]);

  return (
    <>
      <Sidebar />
      <main className="flex-1 ml-24 mr-96 min-w-0 px-4">
        <ProfileHeader />

        {/* Tabs */}
        <div className="flex gap-2 px-6 border-b border-slate-200">
          {["threads", "blogs", "replies", "reposts"].map((tab) => (
            <button
              key={tab}
              onClick={() =>
                dispatchUI({ type: "SET_PROFILE_TAB", payload: tab })
              }
              className={`px-5 py-4 font-semibold text-sm capitalize relative transition-all ${
                ui.profileTab === tab
                  ? "text-slate-900"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {tab}
              {ui.profileTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {ui.profileTab === "blogs" ? (
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
        ) : (
          <div className="divide-y divide-slate-100">
            {posts.loading ? (
              [1, 2, 3].map((i) => <PostSkeleton key={i} />)
            ) : posts.error ? (
              <div className="text-center py-12">
                <p className="text-rose-500 mb-4">{posts.error}</p>
                <button
                  onClick={fetchPosts}
                  className="px-4 py-2 bg-slate-100 rounded-xl text-sm font-medium hover:bg-slate-200 transition-all"
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
      <RightSidebar />
      <ComposeModal />
    </>
  );
};

const ToastContainerWithContext = () => {
  const { ui, dispatchUI } = useApp();
  return (
    <ToastContainer
      toasts={ui.toasts}
      onRemove={(id) => dispatchUI({ type: "REMOVE_TOAST", payload: id })}
    />
  );
};

export const ProfilePageClient = () => {
  return (
    <AppProvider>
      <div className="flex justify-between min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 font-sans text-slate-900">
        <ProfileContent />
        <ToastContainerWithContext />
      </div>
    </AppProvider>
  );
};
