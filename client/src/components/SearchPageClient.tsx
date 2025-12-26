"use client";

import React from "react";
import { AppProvider, useApp } from "@/context/AppContext";
import { AvatarMenu } from "@/components/AvatarMenu";
import { Icons } from "@/components/ui/Icons";

const SearchContent = () => {
  const { ui, dispatchUI } = useApp();

  return (
    <>
      <AvatarMenu />
      <main className="flex-1 min-w-0 bg-[var(--background)] overflow-y-auto">
        <header className="sticky top-0 z-10 px-8 py-6 bg-[var(--surface)]/95 backdrop-blur-xl border-b border-[var(--border)]">
          <h1 className="text-2xl font-bold text-[var(--accent)]">
            Search
          </h1>
        </header>
        <div className="p-8 max-w-4xl mx-auto">
          <div className="relative mb-8">
            <input
              type="text"
              placeholder="Search threads, blogs, and users..."
              value={ui.searchQuery}
              onChange={(e) =>
                dispatchUI({ type: "SET_SEARCH_QUERY", payload: e.target.value })
              }
              className="w-full px-5 py-4 pl-14 bg-[var(--background)] border border-[var(--border)] rounded-2xl text-base text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)]/50 transition-all"
            />
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--muted)]">
              {Icons.search()}
            </span>
          </div>

          {ui.searchQuery ? (
            <div className="text-center py-12 text-[var(--muted)]">
              <p>Search results for &ldquo;{ui.searchQuery}&rdquo;</p>
              <p className="text-sm mt-2">No results found. Try a different search term.</p>
            </div>
          ) : (
            <div className="text-center py-12 text-[var(--muted)]">
              <div className="w-16 h-16 mx-auto mb-4 bg-[var(--surface)] rounded-full flex items-center justify-center">
                {Icons.search()}
              </div>
              <p>Start typing to search for threads, blogs, and users</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export const SearchPageClient = () => {
  return (
    <AppProvider>
      <div className="flex min-h-screen bg-[var(--background)] font-sans text-[var(--foreground)]">
        <SearchContent />
      </div>
    </AppProvider>
  );
};
