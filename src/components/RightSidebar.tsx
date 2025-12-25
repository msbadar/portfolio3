"use client";

import React, { useEffect } from "react";
import Image from "next/image";
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

  return (
    <aside className="w-[380px] p-8 fixed right-0 top-0 bottom-0 overflow-y-auto bg-white/50 backdrop-blur-xl border-l border-slate-200/50">
      <div className="relative mb-8">
        <input
          type="text"
          placeholder="Search anything..."
          value={ui.searchQuery}
          onChange={(e) =>
            dispatchUI({ type: "SET_SEARCH_QUERY", payload: e.target.value })
          }
          className="w-full px-5 py-3.5 pl-12 bg-slate-100 border-0 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
        />
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          {Icons.search()}
        </span>
      </div>

      <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl p-6 border border-slate-200/50 shadow-xl shadow-slate-200/20 mb-6">
        <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
          <span className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white text-xs">
            ✨
          </span>
          Who to follow
        </h3>
        {users.suggestions.length === 0 ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-9 w-20 rounded-xl" />
              </div>
            ))}
          </div>
        ) : (
          users.suggestions.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 py-3.5 border-b border-slate-100 last:border-0"
            >
              <Image
                src={user.avatar}
                alt={user.name}
                width={48}
                height={48}
                className="w-12 h-12 rounded-2xl object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 font-semibold text-sm">
                  {user.username}
                  {user.verified && Icons.verified()}
                </div>
                <span className="text-xs text-slate-400 block mt-0.5">
                  {user.followers} followers
                </span>
              </div>
              <button
                onClick={() => toggleFollow(user.id)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex-shrink-0 ${
                  users.following[user.id]
                    ? "bg-slate-100 text-slate-700"
                    : "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40"
                }`}
              >
                {users.following[user.id] ? "Following" : "Follow"}
              </button>
            </div>
          ))
        )}
      </div>

      <div className="text-xs text-slate-400 space-y-2">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {["About", "Help", "Privacy", "Terms", "Careers"].map((link) => (
            <a
              key={link}
              href="#"
              className="hover:text-slate-600 transition-colors"
            >
              {link}
            </a>
          ))}
        </div>
        <p>© 2025 Threadz</p>
      </div>
    </aside>
  );
};
