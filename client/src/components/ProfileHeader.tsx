"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Icons } from "@/components/ui/Icons";
import { Skeleton } from "@/components/ui/Skeleton";
import { useUsers } from "@/hooks/useUsers";

export const ProfileHeader = () => {
  const { users } = useUsers();
  const user = users.currentUser;

  if (!user) {
    return (
      <div className="relative">
        <Skeleton className="h-32 rounded-none" />
        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-12 mb-6">
            <Skeleton className="w-24 h-24 rounded-3xl flex-shrink-0" />
            <div className="flex-1 pb-2 space-y-2 min-w-0">
              <Skeleton className="h-7 w-40" />
              <Skeleton className="h-5 w-28" />
            </div>
          </div>
          <Skeleton className="h-4 w-3/4 mb-4" />
          <div className="flex gap-6">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative border-b border-[var(--border)]">
      <div className="h-40 bg-gradient-to-r from-[var(--accent)] via-[var(--accent-dim)] to-[#0d9488]" />
      <div className="px-8 pb-6">
        <div className="flex items-end gap-4 -mt-16 mb-6 flex-wrap sm:flex-nowrap">
          <Image
            src={user.avatar}
            alt={user.name}
            width={96}
            height={96}
            className="w-24 h-24 rounded-3xl object-cover ring-4 ring-[var(--background)] shadow-2xl flex-shrink-0"
          />
          <div className="flex-1 pb-2 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-[var(--foreground)] truncate">{user.name}</h1>
              <span className="flex-shrink-0">{user.verified && Icons.verified()}</span>
            </div>
            <span className="text-[var(--muted)]">@{user.username}</span>
          </div>
          <Link
            href="/profile/edit"
            className="px-6 py-2.5 bg-[var(--accent)] text-[var(--background)] rounded-xl font-semibold shadow-lg shadow-[var(--accent)]/30 hover:shadow-[var(--accent)]/40 transition-all flex-shrink-0 text-sm"
          >
            Edit Profile
          </Link>
        </div>
        <p className="text-[var(--muted)] mb-5 max-w-2xl leading-relaxed text-sm">{user.bio}</p>
        <div className="flex items-center gap-6 text-sm flex-wrap">
          <span className="text-[var(--muted)]">
            <strong className="text-[var(--foreground)] font-semibold">{user.followers}</strong>{" "}
            followers
          </span>
          <span className="text-[var(--muted)]">
            <strong className="text-[var(--foreground)] font-semibold">{user.following}</strong>{" "}
            following
          </span>
          {user.link && (
            <a
              href={`https://${user.link}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[var(--accent)] hover:text-[var(--accent-dim)] font-medium transition-colors"
            >
              {Icons.link()} {user.link}
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
