"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Icons } from "@/components/ui/Icons";
import { Markdown } from "@/components/ui/Markdown";
import { useApp } from "@/context/AppContext";
import { useUsers } from "@/hooks/useUsers";
import api from "@/services/api";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditProfileModal = ({ isOpen, onClose }: EditProfileModalProps) => {
  const { showToast } = useApp();
  const { users, fetchCurrentUser } = useUsers();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [link, setLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Reset form state when modal opens
  const handleModalOpen = () => {
    if (!initialized && users.currentUser) {
      setName(users.currentUser.name || "");
      setBio(users.currentUser.bio || "");
      setLink(users.currentUser.link || "");
      setInitialized(true);
    }
  };

  const handleClose = () => {
    setInitialized(false);
    setShowPreview(false);
    onClose();
  };

  const handleSubmit = async () => {
    if (!name.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await api.users.updateProfile({
        name: name.trim(),
        bio: bio.trim(),
        link: link.trim(),
      });
      await fetchCurrentUser();
      showToast("Profile updated successfully!", "success");
      handleClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update profile";
      showToast(message, "error");
    }
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  // Initialize values on first render when open
  if (!initialized && users.currentUser) {
    handleModalOpen();
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div
        className="bg-[var(--surface)] rounded-3xl w-full max-w-lg shadow-2xl shadow-black/50 animate-scaleIn overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border)]">
          <button
            onClick={handleClose}
            className="text-[var(--muted)] hover:text-[var(--foreground)] font-medium transition-colors"
          >
            Cancel
          </button>
          <span className="font-bold text-lg text-[var(--foreground)]">Edit Profile</span>
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

        <div className="px-6 py-6 overflow-y-auto flex-1 space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-4">
            <Image
              src={users.currentUser?.avatar || "https://i.pravatar.cc/150?img=33"}
              alt="Your avatar"
              width={80}
              height={80}
              className="w-20 h-20 rounded-2xl object-cover"
            />
            <button className="px-4 py-2 bg-[var(--surface-hover)] rounded-xl text-sm font-medium text-[var(--foreground)] hover:bg-[var(--border)] transition-colors">
              Change Avatar
            </button>
          </div>

          {/* Name Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--foreground)]">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)]/50 transition-all"
            />
          </div>

          {/* Bio/About Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--foreground)]">
              About <span className="text-[var(--muted)] font-normal">(Markdown supported)</span>
            </label>
            {showPreview ? (
              <div className="min-h-24 p-4 bg-[var(--background)] rounded-xl border border-[var(--border)]">
                <Markdown content={bio || "*No bio added*"} />
              </div>
            ) : (
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write something about yourself..."
                rows={4}
                className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)]/50 transition-all resize-none"
              />
            )}
          </div>

          {/* Link Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--foreground)]">Website</label>
            <input
              type="text"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="yourwebsite.com"
              className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)]/50 transition-all"
            />
          </div>
        </div>

        <div className="px-6 py-5 bg-[var(--background)]/50 border-t border-[var(--border)]">
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || isSubmitting}
            className={`w-full px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
              name.trim() && !isSubmitting
                ? "bg-[var(--accent)] text-[var(--background)] shadow-lg shadow-[var(--accent)]/30 hover:shadow-[var(--accent)]/40"
                : "bg-[var(--border)] text-[var(--muted)] cursor-not-allowed"
            }`}
          >
            {isSubmitting && Icons.loader()}
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};
