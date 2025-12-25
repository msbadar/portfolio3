"use client";

import React from "react";
import Image from "next/image";
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
        <div className="px-8 pb-6">
          <div className="flex items-end gap-6 -mt-12 mb-6">
            <Skeleton className="w-28 h-28 rounded-3xl" />
            <div className="flex-1 pb-2 space-y-2">
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
    <div className="relative">
      <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
      <div className="px-8 pb-6">
        <div className="flex items-end gap-6 -mt-12 mb-6">
          <Image
            src={user.avatar}
            alt={user.name}
            width={112}
            height={112}
            className="w-28 h-28 rounded-3xl object-cover ring-4 ring-white shadow-2xl flex-shrink-0"
          />
          <div className="flex-1 pb-2 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <span className="flex-shrink-0">{user.verified && Icons.verified()}</span>
            </div>
            <span className="text-slate-500">@{user.username}</span>
          </div>
          <button className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 transition-all flex-shrink-0">
            Edit Profile
          </button>
        </div>
        <p className="text-slate-600 mb-4 max-w-2xl leading-relaxed">{user.bio}</p>
        <div className="flex items-center gap-6 text-sm flex-wrap">
          <span className="text-slate-500">
            <strong className="text-slate-900 font-semibold">{user.followers}</strong>{" "}
            followers
          </span>
          <span className="text-slate-500">
            <strong className="text-slate-900 font-semibold">{user.following}</strong>{" "}
            following
          </span>
          <a
            href="#"
            className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
          >
            {Icons.link()} {user.link}
          </a>
        </div>
      </div>
    </div>
  );
};
