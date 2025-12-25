import React from "react";

interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className = "" }: SkeletonProps) => (
  <div className={`animate-pulse bg-slate-200 rounded-xl ${className}`} />
);

export const PostSkeleton = () => (
  <div className="flex gap-4 p-6">
    <Skeleton className="w-12 h-12 rounded-2xl flex-shrink-0" />
    <div className="flex-1 space-y-3">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-48 w-full rounded-2xl" />
    </div>
  </div>
);

export const BlogSkeleton = () => (
  <div className="flex bg-white rounded-3xl overflow-hidden border border-slate-200/50">
    <Skeleton className="w-[240px] h-[180px]" />
    <div className="flex-1 p-6 space-y-3">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  </div>
);
