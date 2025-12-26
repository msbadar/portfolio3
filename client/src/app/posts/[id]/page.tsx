"use client";

import React, { use } from "react";
import { AppProvider } from "@/context/AppContext";
import { AvatarMenu } from "@/components/AvatarMenu";
import { PostDetailView } from "@/components/PostDetailView";
import { ToastContainer } from "@/components/ui/Toast";
import { useApp } from "@/context/AppContext";

const ToastContainerWithContext = () => {
  const { ui, dispatchUI } = useApp();
  return (
    <ToastContainer
      toasts={ui.toasts}
      onRemove={(id) => dispatchUI({ type: "REMOVE_TOAST", payload: id })}
    />
  );
};

const PostDetailPageContent = ({ postId }: { postId: number }) => {
  return (
    <div className="flex min-h-screen bg-[var(--background)] font-sans text-[var(--foreground)]">
      <AvatarMenu />
      <div className="flex-1 max-w-5xl mx-auto w-full">
        <PostDetailView postId={postId} />
      </div>
      <ToastContainerWithContext />
    </div>
  );
};

export default function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const postId = parseInt(id);

  return (
    <AppProvider>
      <PostDetailPageContent postId={postId} />
    </AppProvider>
  );
}
