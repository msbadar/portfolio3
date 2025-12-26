"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Icons } from "@/components/ui/Icons";
import { Markdown } from "@/components/ui/Markdown";
import { useApp } from "@/context/AppContext";
import { usePosts } from "@/hooks/usePosts";
import { useUsers } from "@/hooks/useUsers";

export const ComposeModal = () => {
  const { ui, dispatchUI } = useApp();
  const { createPost } = usePosts();
  const { users } = useUsers();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return;
    setIsSubmitting(true);
    const fullContent = title.trim() ? `# ${title.trim()}\n\n${content}` : content;
    const success = await createPost(fullContent);
    if (success) {
      setTitle("");
      setContent("");
      setShowPreview(false);
      dispatchUI({ type: "TOGGLE_COMPOSE", payload: false });
    }
    setIsSubmitting(false);
  };

  if (!ui.showCompose) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={() => dispatchUI({ type: "TOGGLE_COMPOSE", payload: false })}
    >
      <div
        className="bg-[var(--surface)] rounded-3xl w-full max-w-xl shadow-2xl shadow-black/50 animate-scaleIn overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5">
          <button
            onClick={() =>
              dispatchUI({ type: "TOGGLE_COMPOSE", payload: false })
            }
            className="text-[var(--muted)] hover:text-[var(--foreground)] font-medium transition-colors"
          >
            Cancel
          </button>
          <span className="font-bold text-lg text-[var(--foreground)]">New Thread</span>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`text-sm font-medium transition-colors ${
              showPreview
                ? "text-[var(--accent)]"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {showPreview ? "Edit" : "Preview"}
          </button>
        </div>
        <div className="px-6 pb-6 overflow-y-auto flex-1">
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
              <span className="font-semibold text-sm block mb-3 text-[var(--foreground)]">
                {users.currentUser?.username || "you"}
              </span>
              {showPreview ? (
                <div className="min-h-32 p-3 bg-[var(--background)] rounded-xl">
                  <Markdown
                    content={
                      title.trim()
                        ? `# ${title.trim()}\n\n${content}`
                        : content || "*No content to preview*"
                    }
                  />
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Title (optional)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-transparent border-none text-lg font-semibold leading-relaxed outline-none mb-2 text-[var(--foreground)] placeholder-[var(--muted)]"
                  />
                  <textarea
                    placeholder="Start a thread... (Markdown supported)"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    autoFocus
                    className="w-full bg-transparent border-none text-base leading-relaxed resize-none outline-none min-h-32 text-[var(--foreground)] placeholder-[var(--muted)]"
                  />
                </>
              )}
              <div className="flex gap-2 mt-4">
                <button className="p-2 rounded-xl text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--accent)] transition-all">
                  {Icons.image()}
                </button>
                <span className="text-xs text-[var(--muted)] self-center ml-2">
                  Markdown supported
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between px-6 py-5 bg-[var(--background)]/50">
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
