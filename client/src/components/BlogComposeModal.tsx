"use client";

import React, { useState, useCallback, useRef } from "react";
import Image from "next/image";
import { X, FileText, Save, Eye, Edit3 } from "lucide-react";
import { MarkdownEditor, MarkdownEditorRef } from "@/components/ui/MarkdownEditor";
import { Markdown } from "@/components/ui/Markdown";
import { useApp } from "@/context/AppContext";
import { useBlogs } from "@/hooks/useBlogs";
import { useUsers } from "@/hooks/useUsers";

const CATEGORIES = [
  "Technology",
  "Design",
  "Development",
  "Tutorial",
  "Opinion",
  "News",
  "Personal",
  "Other",
];

export const BlogComposeModal = () => {
  const { ui, dispatchUI } = useApp();
  const { createBlog } = useBlogs();
  const { users } = useUsers();
  const editorRef = useRef<MarkdownEditorRef>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [category, setCategory] = useState("Technology");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFullPreview, setIsFullPreview] = useState(false);

  const handleClose = useCallback(() => {
    dispatchUI({ type: "TOGGLE_BLOG_COMPOSE", payload: false });
  }, [dispatchUI]);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Calculate read time (rough estimate: 200 words per minute)
      const wordCount = content.split(/\s+/).filter(Boolean).length;
      const readTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;

      // Auto-generate excerpt if not provided
      const autoExcerpt = excerpt.trim() || 
        content
          .replace(/^#+ .*/gm, "") // Remove headers
          .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Remove links but keep text
          .replace(/[*_~`]/g, "") // Remove markdown formatting
          .trim()
          .substring(0, 160) + "...";

      await createBlog({
        title: title.trim(),
        content,
        excerpt: autoExcerpt,
        coverImage: coverImage.trim() || undefined,
        category,
        readTime,
      });

      // Reset form
      setTitle("");
      setContent("");
      setExcerpt("");
      setCoverImage("");
      setCategory("Technology");
      setIsFullPreview(false);
      handleClose();
    } catch {
      // Error is handled by useBlogs hook with toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = useCallback(async (file: File): Promise<string> => {
    // For now, convert to data URL for local preview
    // In production, you would upload to a server/CDN
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, []);

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await handleImageUpload(file);
      setCoverImage(url);
    } catch {
      // Handle error silently
    }
  };

  // Clear auto-saved content when modal is closed
  const clearAutoSave = () => {
    localStorage.removeItem("blog-draft-content");
    localStorage.removeItem("blog-draft-title");
  };

  if (!ui.showBlogCompose) return null;

  // Full preview mode
  if (isFullPreview) {
    return (
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={handleClose}
      >
        <div
          className="bg-[var(--background)] rounded-3xl w-full max-w-4xl shadow-2xl shadow-black/50 animate-scaleIn overflow-hidden max-h-[95vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Preview Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
            <button
              onClick={() => setIsFullPreview(false)}
              className="flex items-center gap-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              <Edit3 size={20} />
              <span className="font-medium">Back to Editor</span>
            </button>
            <span className="font-bold text-lg text-[var(--foreground)]">
              Preview
            </span>
            <button
              onClick={handleClose}
              className="p-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Preview Content */}
          <div className="flex-1 overflow-y-auto p-8">
            {coverImage && (
              <div className="relative w-full h-64 mb-8 rounded-2xl overflow-hidden">
                <Image
                  src={coverImage}
                  alt="Cover"
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 bg-[var(--surface)] rounded-full text-sm font-medium text-[var(--accent)]">
                {category}
              </span>
              <span className="text-sm text-[var(--muted)]">
                {Math.max(1, Math.ceil(content.split(/\s+/).filter(Boolean).length / 200))} min read
              </span>
            </div>
            <h1 className="text-3xl font-bold mb-6 text-[var(--foreground)]">
              {title || "Untitled Blog Post"}
            </h1>
            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-[var(--border)]">
              <Image
                src={users.currentUser?.avatar || "https://i.pravatar.cc/150?img=33"}
                alt="Author"
                width={48}
                height={48}
                className="rounded-full"
              />
              <div>
                <p className="font-semibold text-[var(--foreground)]">
                  {users.currentUser?.name || "Anonymous"}
                </p>
                <p className="text-sm text-[var(--muted)]">
                  {new Date().toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
            <article className="prose prose-lg dark:prose-invert max-w-none">
              <Markdown content={content || "*No content yet*"} />
            </article>
          </div>

          {/* Preview Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border)] bg-[var(--surface)]/50">
            <button
              onClick={() => setIsFullPreview(false)}
              className="px-4 py-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              Continue Editing
            </button>
            <button
              onClick={handleSubmit}
              disabled={!title.trim() || !content.trim() || isSubmitting}
              className={`px-6 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                title.trim() && content.trim() && !isSubmitting
                  ? "bg-[var(--accent)] text-[var(--background)] shadow-lg shadow-[var(--accent)]/30 hover:shadow-[var(--accent)]/40"
                  : "bg-[var(--border)] text-[var(--muted)] cursor-not-allowed"
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Publishing...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Publish Blog
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div
        className="bg-[var(--surface)] rounded-3xl w-full max-w-4xl shadow-2xl shadow-black/50 animate-scaleIn overflow-hidden max-h-[95vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border)]">
          <button
            onClick={() => {
              clearAutoSave();
              handleClose();
            }}
            className="text-[var(--muted)] hover:text-[var(--foreground)] font-medium transition-colors"
          >
            Cancel
          </button>
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-[var(--accent)]" />
            <span className="font-bold text-lg text-[var(--foreground)]">
              Create Blog Post
            </span>
          </div>
          <button
            onClick={() => setIsFullPreview(true)}
            className="flex items-center gap-1 text-[var(--muted)] hover:text-[var(--foreground)] font-medium transition-colors"
          >
            <Eye size={18} />
            Preview
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Cover Image
            </label>
            <div className="relative">
              {coverImage ? (
                <div className="relative w-full h-48 rounded-xl overflow-hidden group">
                  <Image
                    src={coverImage}
                    alt="Cover preview"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <label className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white cursor-pointer transition-colors">
                      Change
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverImageUpload}
                        className="hidden"
                      />
                    </label>
                    <button
                      onClick={() => setCoverImage("")}
                      className="px-4 py-2 bg-red-500/50 hover:bg-red-500/70 rounded-lg text-white transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[var(--border)] rounded-xl hover:border-[var(--accent)] cursor-pointer transition-colors">
                  <Image
                    src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect width='18' height='18' x='3' y='3' rx='2' ry='2'/%3E%3Ccircle cx='9' cy='9' r='2'/%3E%3Cpath d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'/%3E%3C/svg%3E"
                    alt=""
                    width={32}
                    height={32}
                    className="mb-2 opacity-50"
                  />
                  <span className="text-sm text-[var(--muted)]">
                    Click to upload cover image
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your blog title..."
              className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-lg font-semibold text-[var(--foreground)] placeholder-[var(--muted)] outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    category === cat
                      ? "bg-[var(--accent)] text-white"
                      : "bg-[var(--background)] text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
                  }`}
                  type="button"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Excerpt (optional) */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Excerpt{" "}
              <span className="text-[var(--muted)] font-normal">
                (optional - auto-generated if empty)
              </span>
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="A brief summary of your blog post..."
              rows={2}
              className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder-[var(--muted)] outline-none focus:ring-2 focus:ring-[var(--accent)] resize-none transition-all"
            />
          </div>

          {/* Content - Markdown Editor */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Content <span className="text-red-500">*</span>
            </label>
            <MarkdownEditor
              ref={editorRef}
              value={content}
              onChange={setContent}
              placeholder="Write your blog content here... 

You can use Markdown syntax:
- **Bold** text with **
- *Italic* text with *
- # Headings with #
- [Links](url) 
- ![Images](url)
- `Code` with backticks
- And much more!

You can also drag and drop markdown files or images directly into the editor."
              minHeight="400px"
              onImageUpload={handleImageUpload}
              autoSaveKey="blog-draft-content"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-5 border-t border-[var(--border)] bg-[var(--background)]/50">
          <div className="flex items-center gap-4 text-sm text-[var(--muted)]">
            <span>
              {content.split(/\s+/).filter(Boolean).length} words
            </span>
            <span>•</span>
            <span>
              ~{Math.max(1, Math.ceil(content.split(/\s+/).filter(Boolean).length / 200))} min read
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsFullPreview(true)}
              className="px-4 py-2 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] rounded-xl transition-colors"
            >
              Preview
            </button>
            <button
              onClick={handleSubmit}
              disabled={!title.trim() || !content.trim() || isSubmitting}
              className={`px-6 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                title.trim() && content.trim() && !isSubmitting
                  ? "bg-[var(--accent)] text-[var(--background)] shadow-lg shadow-[var(--accent)]/30 hover:shadow-[var(--accent)]/40"
                  : "bg-[var(--border)] text-[var(--muted)] cursor-not-allowed"
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Publishing...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Publish
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
