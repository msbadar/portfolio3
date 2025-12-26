"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icons } from "@/components/ui/Icons";
import { Skeleton } from "@/components/ui/Skeleton";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useUsers } from "@/hooks/useUsers";

export const AvatarMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { ui, dispatchUI } = useApp();
  const { user: authUser, loading: authLoading } = useAuth();
  const { users, toggleFollow, fetchSuggestions, fetchCurrentUser } =
    useUsers();

  useEffect(() => {
    fetchCurrentUser();
    fetchSuggestions();
  }, [fetchCurrentUser, fetchSuggestions]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const navLinks = [
    { id: "home", href: "/", icon: Icons.home, label: "Home" },
    {
      id: "search",
      href: "/search",
      icon: () => Icons.search(),
      label: "Search",
    },
    { id: "blogs", href: "/blogs", icon: Icons.activity, label: "Blogs" },
  ];

  const profileLinks = [
    {
      id: "edit-profile",
      href: "/profile/edit",
      icon: () => Icons.profile(),
      label: "Edit Profile",
    },
    {
      id: "settings",
      href: "/settings",
      icon: () => Icons.menu(),
      label: "Settings",
    },
    { id: "login", href: "/login", icon: () => Icons.close(), label: "Logout" },
  ];

  const footerLinks = [
    { label: "About", href: "/about" },
    { label: "Help", href: "/help" },
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Careers", href: "/careers" },
  ];

  const getIsActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Hamburger Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-6 right-6 z-50 w-12 h-12 rounded-xl bg-[var(--surface)] ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--background)] hover:ring-4 transition-all duration-300 shadow-lg flex items-center justify-center"
      >
        {isOpen ? Icons.close() : Icons.menu()}
      </button>

      {/* Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fadeIn"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Right Sidebar */}
      {isOpen && (
        <div
          ref={menuRef}
          className="fixed top-0 right-0 h-full w-96 bg-[var(--surface)] shadow-2xl border-l border-[var(--border)] z-50 overflow-y-auto animate-slideInRight"
        >
          {/* User Profile Section */}
          {authLoading ? (
            <div className="p-6 border-b border-[var(--border)]">
              <div className="flex items-center gap-4 mb-4">
                <Skeleton className="w-14 h-14 rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </div>
          ) : authUser ? (
            <div className="p-6 border-b border-[var(--border)]">
              <div className="flex items-center gap-4 mb-4">
                <Image
                  src={authUser.avatar || '/default-avatar.png'}
                  alt={authUser.name}
                  width={56}
                  height={56}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-[var(--accent)]/30"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-base text-[var(--foreground)] truncate">
                      {authUser.name}
                    </h3>
                    {authUser.verified && Icons.verified()}
                  </div>
                  <span className="text-sm text-[var(--muted)]">
                    @{authUser.username}
                  </span>
                </div>
              </div>
              <div className="flex gap-4 text-sm">
                <span className="text-[var(--muted)]">
                  <strong className="text-[var(--foreground)] font-semibold">
                    {authUser.followers}
                  </strong>{" "}
                  followers
                </span>
                <span className="text-[var(--muted)]">
                  <strong className="text-[var(--foreground)] font-semibold">
                    {authUser.following}
                  </strong>{" "}
                  following
                </span>
              </div>
            </div>
          ) : (
            <div className="p-6 border-b border-[var(--border)]">
              <div className="text-center space-y-4">
                <h3 className="font-bold text-lg text-[var(--foreground)]">
                  Welcome to Threadz
                </h3>
                <p className="text-sm text-[var(--muted)]">
                  Sign in to connect with others and share your thoughts
                </p>
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="block w-full px-6 py-3 bg-[var(--accent)] text-[var(--background)] font-semibold rounded-xl hover:shadow-lg hover:shadow-[var(--accent)]/30 transition-all"
                >
                  Sign In
                </Link>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <div className="p-4 border-b border-[var(--border)]">
            <h4 className="text-xs font-semibold text-[var(--muted)] mb-3 px-2">
              NAVIGATION
            </h4>
            <nav className="space-y-1">
              {navLinks.map((item) => {
                const isActive = getIsActive(item.href);
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-[var(--accent)] text-[var(--background)] shadow-lg shadow-[var(--accent)]/30"
                        : "text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
                    }`}
                  >
                    <span
                      className={
                        isActive
                          ? "text-[var(--background)]"
                          : "text-[var(--muted)]"
                      }
                    >
                      {item.icon(isActive)}
                    </span>
                    <span className="font-medium text-sm">{item.label}</span>
                  </Link>
                );
              })}
              {authUser && (
                <button
                  onClick={() => {
                    dispatchUI({ type: "TOGGLE_COMPOSE", payload: true });
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-all duration-200"
                >
                  <span className="text-[var(--muted)]">{Icons.create()}</span>
                  <span className="font-medium text-sm">Create Post</span>
                </button>
              )}
            </nav>
          </div>

          {/* Search Section */}
          <div className="p-4 border-b border-[var(--border)]">
            <div className="relative">
              <input
                type="text"
                placeholder="Search anything..."
                value={ui.searchQuery}
                onChange={(e) =>
                  dispatchUI({
                    type: "SET_SEARCH_QUERY",
                    payload: e.target.value,
                  })
                }
                className="w-full px-4 py-3 pl-10 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)]/50 transition-all"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">
                {Icons.search()}
              </span>
            </div>
          </div>

          {/* Who to Follow Section */}
          <div className="p-4 border-b border-[var(--border)]">
            <h4 className="text-xs font-semibold text-[var(--muted)] mb-3 px-2 flex items-center gap-2">
              <span className="w-6 h-6 bg-[var(--accent)] rounded-lg flex items-center justify-center text-[var(--background)] text-xs">
                ✨
              </span>
              WHO TO FOLLOW
            </h4>
            {users.suggestions.length === 0 ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-2">
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
              <div className="space-y-2">
                {users.suggestions.slice(0, 3).map((suggestedUser) => (
                  <div
                    key={suggestedUser.id}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--surface-hover)] transition-all"
                  >
                    <Image
                      src={suggestedUser.avatar}
                      alt={`${suggestedUser.name}'s profile picture`}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 font-semibold text-sm text-[var(--foreground)] truncate">
                        {suggestedUser.username}
                        {suggestedUser.verified && Icons.verified()}
                      </div>
                      <span className="text-xs text-[var(--muted)] block truncate">
                        {suggestedUser.followers} followers
                      </span>
                    </div>
                    <button
                      onClick={() => toggleFollow(suggestedUser.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex-shrink-0 ${
                        users.following[suggestedUser.id]
                          ? "bg-[var(--border)] text-[var(--foreground)]"
                          : "bg-[var(--accent)] text-[var(--background)] shadow-lg shadow-[var(--accent)]/30 hover:shadow-[var(--accent)]/40"
                      }`}
                    >
                      {users.following[suggestedUser.id]
                        ? "Following"
                        : "Follow"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Profile Actions */}
          {authUser && (
            <div className="p-4 border-b border-[var(--border)]">
              <h4 className="text-xs font-semibold text-[var(--muted)] mb-3 px-2">
                ACCOUNT
              </h4>
              <nav className="space-y-1">
                {profileLinks.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-all duration-200"
                  >
                    <span className="text-[var(--muted)]">{item.icon()}</span>
                    <span className="font-medium text-sm">{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
          )}

          {/* Footer Links */}
          <div className="p-4">
            <div className="text-xs text-[var(--muted)] space-y-2">
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {footerLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="hover:text-[var(--accent)] transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <p>© 2025 Threadz</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
