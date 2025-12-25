"use client";

import React from "react";
import { AppProvider, useApp } from "@/context/AppContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { RightSidebar } from "@/components/RightSidebar";
import { Icons } from "@/components/ui/Icons";

const SearchContent = () => {
  const { ui, dispatchUI } = useApp();

  return (
    <>
      <Sidebar />
      <main className="flex-1 ml-20 mr-80 px-4 overflow-x-hidden">
        <header className="sticky top-0 z-10 px-6 py-4 bg-white/70 backdrop-blur-xl border-b border-slate-200/50">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
            Search
          </h1>
        </header>
        <div className="p-6">
          <div className="relative mb-8">
            <input
              type="text"
              placeholder="Search threads, blogs, and users..."
              value={ui.searchQuery}
              onChange={(e) =>
                dispatchUI({ type: "SET_SEARCH_QUERY", payload: e.target.value })
              }
              className="w-full px-5 py-4 pl-14 bg-slate-100 border-0 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
              {Icons.search()}
            </span>
          </div>

          {ui.searchQuery ? (
            <div className="text-center py-12 text-slate-500">
              <p>Search results for &ldquo;{ui.searchQuery}&rdquo;</p>
              <p className="text-sm mt-2">No results found. Try a different search term.</p>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                {Icons.search()}
              </div>
              <p>Start typing to search for threads, blogs, and users</p>
            </div>
          )}
        </div>
      </main>
      <RightSidebar />
    </>
  );
};

export const SearchPageClient = () => {
  return (
    <AppProvider>
      <div className="flex justify-between min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 font-sans text-slate-900">
        <SearchContent />
      </div>
    </AppProvider>
  );
};
