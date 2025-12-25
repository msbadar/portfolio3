"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Icons } from "@/components/ui/Icons";
import { useApp } from "@/context/AppContext";
import { usePosts } from "@/hooks/usePosts";
import { useUsers } from "@/hooks/useUsers";

export const ComposeModal = () => {
  const { ui, dispatchUI } = useApp();
  const { createPost } = usePosts();
  const { users } = useUsers();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return;
    setIsSubmitting(true);
    const success = await createPost(content, users.currentUser);
    if (success) {
      setContent("");
      dispatchUI({ type: "TOGGLE_COMPOSE", payload: false });
    }
    setIsSubmitting(false);
  };

  if (!ui.showCompose) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={() => dispatchUI({ type: "TOGGLE_COMPOSE", payload: false })}
    >
      <div
        className="bg-[var(--surface)] rounded-3xl w-full max-w-xl shadow-2xl shadow-black/50 animate-scaleIn border border-[var(--border)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <button
            onClick={() =>
              dispatchUI({ type: "TOGGLE_COMPOSE", payload: false })
            }
            className="text-[var(--muted)] hover:text-[var(--foreground)] font-medium transition-colors"
          >
            Cancel
          </button>
          <span className="font-bold text-lg text-[var(--foreground)]">New Thread</span>
          <div className="w-16" />
        </div>
        <div className="p-6">
          <div className="flex gap-4">
            <div className="flex flex-col items-center flex-shrink-0">
              <Image
                src={
                  users.currentUser?.avatar ||
                  "https://i.pravatar.cc/150?img=33"
                }
                alt="Your avatar"
                width={48}
                height={48}
                className="w-12 h-12 rounded-2xl object-cover"
              />
              <div className="w-0.5 flex-1 bg-gradient-to-b from-[var(--border)] to-transparent mt-3 rounded-full min-h-10" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-sm block mb-2.5 text-[var(--foreground)]">
                {users.currentUser?.username || "you"}
              </span>
              <textarea
                placeholder="Start a thread..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                autoFocus
                className="w-full bg-transparent border-none text-base leading-relaxed resize-none outline-none min-h-32 text-[var(--foreground)] placeholder-[var(--muted)]"
              />
              <div className="flex gap-2 mt-3">
                <button className="p-2 rounded-xl text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--accent)] transition-all">
                  {Icons.image()}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border)] bg-[var(--background)]/50 rounded-b-3xl">
          <span className="text-sm text-[var(--muted)]">Anyone can reply</span>
          <button
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
            className={`px-6 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 ${
              content.trim() && !isSubmitting
                ? "bg-[var(--accent)] text-[var(--background)] shadow-lg shadow-[var(--accent)]/30 hover:shadow-[var(--accent)]/40"
                : "bg-[var(--border)] text-[var(--muted)] cursor-not-allowed"
            }`}
          >
            {isSubmitting && Icons.loader()}
            {isSubmitting ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
};
