"use client";

import React, { useState, useRef, useEffect } from "react";
import { Icons } from "@/components/ui/Icons";

interface PostDropdownProps {
  postId: number;
  isOwnPost?: boolean;
  onSave?: (postId: number) => void;
  onReport?: (postId: number) => void;
  onDelete?: (postId: number) => void;
  onEdit?: (postId: number) => void;
}

export const PostDropdown = ({
  postId,
  isOwnPost = false,
  onSave,
  onReport,
  onDelete,
  onEdit,
}: PostDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAction = (action: ((id: number) => void) | undefined) => {
    if (action) {
      action(postId);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-xl text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)] transition-all flex-shrink-0 -mt-1"
      >
        {Icons.more()}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-[var(--surface)] rounded-xl shadow-lg shadow-black/20 border border-[var(--border)] z-50 overflow-hidden animate-scaleIn">
          <div className="py-1">
            <button
              onClick={() => handleAction(onSave)}
              className="w-full px-4 py-2.5 text-left text-sm text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors flex items-center gap-3"
            >
              {Icons.bookmark(false)}
              Save
            </button>

            {isOwnPost && onEdit && (
              <button
                onClick={() => handleAction(onEdit)}
                className="w-full px-4 py-2.5 text-left text-sm text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors flex items-center gap-3"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit
              </button>
            )}

            <button
              onClick={() => handleAction(onReport)}
              className="w-full px-4 py-2.5 text-left text-sm text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors flex items-center gap-3"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                <line x1="4" y1="22" x2="4" y2="15" />
              </svg>
              Report
            </button>

            {isOwnPost && onDelete && (
              <>
                <div className="my-1 border-t border-[var(--border)]" />
                <button
                  onClick={() => handleAction(onDelete)}
                  className="w-full px-4 py-2.5 text-left text-sm text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-3"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
