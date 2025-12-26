"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { AppProvider, useApp } from "@/context/AppContext";
import { useUsers } from "@/hooks/useUsers";
import { AvatarMenu } from "@/components/AvatarMenu";
import { Icons } from "@/components/ui/Icons";
import { Markdown } from "@/components/ui/Markdown";
import { Skeleton } from "@/components/ui/Skeleton";
import { ToastContainer } from "@/components/ui/Toast";

const AboutContent = () => {
  const { fetchCurrentUser, users } = useUsers();
  const user = users.currentUser;

  useEffect(() => {
    if (!user) {
      fetchCurrentUser();
    }
  }, [fetchCurrentUser, user]);

  if (!user) {
    return (
      <main className="flex-1 min-w-0 bg-[var(--background)] overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8">
          <div className="mb-6">
            <Skeleton className="h-8 w-32 mb-4" />
          </div>
          <div className="bg-[var(--surface)] rounded-3xl p-8 border border-[var(--border)]">
            <Skeleton className="h-32 w-32 rounded-3xl mb-6" />
            <Skeleton className="h-8 w-64 mb-4" />
            <Skeleton className="h-6 w-48 mb-6" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <AvatarMenu />
      <main className="flex-1 min-w-0 bg-[var(--background)] overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8">
          {/* Back Button */}
          <div className="mb-6">
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors text-sm font-medium"
            >
              {Icons.back()}
              Back to Profile
            </Link>
          </div>

          {/* About Section */}
          <div className="bg-[var(--surface)] rounded-3xl p-8 border border-[var(--border)] shadow-lg">
            <h1 className="text-3xl font-bold text-[var(--foreground)] mb-8">
              About
            </h1>

            {/* Profile Info */}
            <div className="flex items-start gap-6 mb-8 flex-wrap sm:flex-nowrap">
              <Image
                src={user.avatar}
                alt={user.name}
                width={128}
                height={128}
                className="w-32 h-32 rounded-3xl object-cover shadow-xl flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold text-[var(--foreground)]">
                    {user.name}
                  </h2>
                  {user.verified && (
                    <span className="flex-shrink-0">{Icons.verified()}</span>
                  )}
                </div>
                <p className="text-[var(--muted)] mb-4">@{user.username}</p>
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

            {/* Bio Section */}
            <div className="border-t border-[var(--border)] pt-8">
              <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">
                Bio
              </h3>
              <div className="prose prose-invert max-w-none">
                {user.bio ? (
                  <Markdown content={user.bio} />
                ) : (
                  <p className="text-[var(--muted)] italic">No bio available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
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

export const AboutPageClient = () => {
  return (
    <AppProvider>
      <div className="flex min-h-screen bg-[var(--background)] font-sans text-[var(--foreground)]">
        <AboutContent />
        <ToastContainerWithContext />
      </div>
    </AppProvider>
  );
};
