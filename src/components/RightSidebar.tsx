"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icons } from "@/components/ui/Icons";
import { Skeleton } from "@/components/ui/Skeleton";
import { useApp } from "@/context/AppContext";
import { useUsers } from "@/hooks/useUsers";

export const RightSidebar = () => {
  const { users, toggleFollow, fetchSuggestions } = useUsers();
  const { ui, dispatchUI } = useApp();

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  const footerLinks = [
    { label: "About", href: "/about" },
    { label: "Help", href: "/help" },
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Careers", href: "/careers" },
  ];

  return (
    <aside className="w-80 p-4 fixed right-0 top-0 bottom-0 overflow-y-auto bg-[var(--surface)]/95 backdrop-blur-xl border-l border-[var(--border)]">
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search anything..."
          value={ui.searchQuery}
          onChange={(e) =>
            dispatchUI({ type: "SET_SEARCH_QUERY", payload: e.target.value })
          }
          className="w-full px-4 py-3 pl-10 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)]/50 transition-all"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">
          {Icons.search()}
        </span>
      </div>

      <div className="bg-[var(--surface-hover)] rounded-2xl p-4 border border-[var(--border)] shadow-xl shadow-black/10 mb-6">
        <h3 className="font-bold text-base mb-4 flex items-center gap-2 text-[var(--foreground)]">
          <span className="w-7 h-7 bg-[var(--accent)] rounded-lg flex items-center justify-center text-[var(--background)] text-xs">
            ✨
          </span>
          Who to follow
        </h3>
        {users.suggestions.length === 0 ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-2 w-14" />
                </div>
                <Skeleton className="h-8 w-16 rounded-lg" />
              </div>
            ))}
          </div>
        ) : (
          users.suggestions.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-2 py-3 border-b border-[var(--border)] last:border-0"
            >
              <Image
                src={user.avatar}
                alt={`${user.name}'s profile picture`}
                width={40}
                height={40}
                className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 font-semibold text-sm text-[var(--foreground)] truncate">
                  {user.username}
                  {user.verified && Icons.verified()}
                </div>
                <span className="text-xs text-[var(--muted)] block truncate">
                  {user.followers} followers
                </span>
              </div>
              <button
                onClick={() => toggleFollow(user.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex-shrink-0 ${
                  users.following[user.id]
                    ? "bg-[var(--border)] text-[var(--foreground)]"
                    : "bg-[var(--accent)] text-[var(--background)] shadow-lg shadow-[var(--accent)]/30 hover:shadow-[var(--accent)]/40"
                }`}
              >
                {users.following[user.id] ? "Following" : "Follow"}
              </button>
            </div>
          ))
        )}
      </div>

      <div className="text-xs text-[var(--muted)] space-y-2">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {footerLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="hover:text-[var(--accent)] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <p>© 2025 Threadz</p>
      </div>
    </aside>
  );
};
