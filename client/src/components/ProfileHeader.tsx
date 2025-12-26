"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Icons } from "@/components/ui/Icons";
import { Markdown } from "@/components/ui/Markdown";
import { Skeleton } from "@/components/ui/Skeleton";
import { EditProfileModal } from "@/components/EditProfileModal";
import { useUsers } from "@/hooks/useUsers";

export const ProfileHeader = () => {
  const { users } = useUsers();
  const user = users.currentUser;
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
    <>
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
                <h1 className="text-xl font-bold text-[var(--foreground)] truncate">
                  {user.name}
                </h1>
                <span className="flex-shrink-0">
                  {user.verified && Icons.verified()}
                </span>
              </div>
              <span className="text-[var(--muted)]">@{user.username}</span>
            </div>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors flex-shrink-0"
            >
              Edit Profile
            </button>
          </div>
          <div className="text-[var(--muted)] mb-5 max-w-2xl text-sm">
            {user.bio ? (
              <>
                <div className={user.bio.length > 200 ? "line-clamp-3" : ""}>
                  <Markdown content={user.bio} />
                </div>
                {user.bio.length > 200 && (
                  <Link
                    href="/about"
                    className="inline-flex items-center gap-1 text-[var(--accent)] hover:text-[var(--accent-dim)] font-medium text-sm mt-2 transition-colors"
                  >
                    Read more
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M6 12l4-4-4-4" />
                    </svg>
                  </Link>
                )}
              </>
            ) : (
              <p className="text-[var(--muted)] italic">No bio yet</p>
            )}
          </div>
          <div className="flex items-center gap-6 text-sm flex-wrap">
            <span className="text-[var(--muted)]">
              <strong className="text-[var(--foreground)] font-semibold">
                {user.followers}
              </strong>{" "}
              followers
            </span>
            <span className="text-[var(--muted)]">
              <strong className="text-[var(--foreground)] font-semibold">
                {user.following}
              </strong>{" "}
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
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </>
  );
};
