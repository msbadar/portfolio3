"use client";

import React, { useEffect, useState, useRef } from "react";
import { usePosts } from "@/hooks/usePosts";
import { usePostFilters } from "@/hooks/usePostFilters";
import { useUsers } from "@/hooks/useUsers";
import { ProfileHeader } from "@/components/ProfileHeader";
import { Post } from "@/components/Post";
import { PostSkeleton } from "@/components/ui/Skeleton";

export const MainContent = () => {
  const { posts, fetchPosts, likePost } = usePosts();
  const { filters, setFilters } = usePostFilters();
  const { fetchCurrentUser } = useUsers();
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fetch data when filters change
  useEffect(() => {
    fetchPosts(filters);
    fetchCurrentUser();
  }, [filters, fetchPosts, fetchCurrentUser]);

  // Focus input when expanded
  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);

  // Handle ESC key to close search
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchExpanded) {
        setIsSearchExpanded(false);
        setFilters({ search: undefined });
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isSearchExpanded, setFilters]);

  const handleCloseSearch = () => {
    setIsSearchExpanded(false);
    setFilters({ search: undefined });
  };

  return (
    <main className="flex-1 min-w-0 bg-[var(--background)] overflow-y-auto">
      <ProfileHeader />

      {/* Filter Tabs */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-[var(--border)]">
        <div className="flex gap-4">
          <button
            onClick={() => setFilters({ type: undefined })}
            className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
              !filters.type
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilters({ type: "post" })}
            className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
              filters.type === "post"
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => setFilters({ type: "blog" })}
            className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
              filters.type === "blog"
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
            }`}
          >
            Blogs
          </button>
        </div>

        {/* Expandable Search */}
        <div className="flex items-center gap-2">
          {!isSearchExpanded ? (
            <button
              onClick={() => setIsSearchExpanded(true)}
              className="p-2 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)] rounded-xl transition-all"
              aria-label="Open search"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          ) : (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-5 duration-200">
              <input
                ref={searchInputRef}
                type="text"
                value={filters.search || ""}
                onChange={(e) =>
                  setFilters({ search: e.target.value || undefined })
                }
                placeholder="Search posts and blogs..."
                className="px-4 py-2 rounded-xl bg-[var(--surface)] text-sm border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all w-[250px]"
              />
              <button
                onClick={handleCloseSearch}
                className="p-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-all"
                aria-label="Close search"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Unified Content */}
      <div className="py-8 space-y-3 max-w-4xl mx-auto">
        {posts.loading ? (
          [1, 2, 3].map((i) => <PostSkeleton key={i} />)
        ) : posts.error ? (
          <div className="text-center py-12">
            <p className="text-rose-500 mb-4">{posts.error}</p>
            <button
              onClick={() => fetchPosts(filters)}
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
    </main>
  );
};
