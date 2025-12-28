"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Icons } from "@/components/ui/Icons";
import { AppProvider, useApp } from "@/context/AppContext";
import { AvatarMenu } from "@/components/AvatarMenu";
import { ToastContainer } from "@/components/ui/Toast";
import { useBlogs } from "@/hooks/useBlogs";
import { useUsers } from "@/hooks/useUsers";
import api from "@/services/api";
import type { Blog } from "@/types";

const Card = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) => (
  <div className="bg-[var(--surface)] rounded-2xl p-6 shadow-card border border-[var(--border)]/60">
    <div className="flex items-start justify-between gap-3 mb-4">
      <div>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-[var(--muted)]">{description}</p>
        )}
      </div>
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

const Field = ({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) => (
  <label className="block space-y-2">
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-[var(--foreground)]">
        {label}
      </span>
      {hint && <span className="text-xs text-[var(--muted)]">{hint}</span>}
    </div>
    {children}
  </label>
);

const DomainCard = ({
  initialDomain,
  saving,
  onSave,
}: {
  initialDomain: string;
  saving: boolean;
  onSave: (domain: string) => void;
}) => {
  const [domain, setDomain] = useState(initialDomain);

  return (
    <Card
      title="Domain"
      description="Set the domain where your blog and profile are available."
    >
      <Field
        label="Custom domain"
        hint="Use your own domain or subdomain (e.g. stories.example.com)"
      >
        <input
          type="text"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="myportfolio.com"
          className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)]/50 transition-all"
        />
      </Field>
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--muted)]">
          This value is also sent as <code>X-Site</code> when calling the API.
        </p>
        <button
          onClick={() => onSave(domain)}
          disabled={saving}
          className={`px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all ${
            saving
              ? "bg-[var(--border)] text-[var(--muted)] cursor-not-allowed"
              : "bg-[var(--accent)] text-[var(--background)] hover:shadow-lg hover:shadow-[var(--accent)]/30"
          }`}
        >
          {saving && Icons.loader()}
          {saving ? "Saving..." : "Save domain"}
        </button>
      </div>
    </Card>
  );
};

type BlogFormValues = {
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
};

const BlogDetailsForm = ({
  blog,
  saving,
  onSave,
}: {
  blog: Blog;
  saving: boolean;
  onSave: (values: BlogFormValues) => void;
}) => {
  const [form, setForm] = useState<BlogFormValues>(() => ({
    title: blog.title || "",
    excerpt: blog.excerpt || "",
    category: blog.category || "",
    readTime: blog.readTime || "",
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Title">
          <input
            type="text"
            value={form.title}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, title: e.target.value }))
            }
            className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)]/50 transition-all"
            placeholder="Blog title"
          />
        </Field>
        <Field label="Category">
          <input
            type="text"
            value={form.category}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, category: e.target.value }))
            }
            className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)]/50 transition-all"
            placeholder="Design, Engineering, Culture..."
          />
        </Field>
      </div>

      <Field label="Excerpt" hint="Shown on previews and cards">
        <textarea
          value={form.excerpt}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, excerpt: e.target.value }))
          }
          rows={3}
          className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)]/50 transition-all resize-none"
          placeholder="Short summary for this blog post"
        />
      </Field>

      <Field label="Read time" hint="e.g. 5 min read">
        <input
          type="text"
          value={form.readTime}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, readTime: e.target.value }))
          }
          className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)]/50 transition-all"
          placeholder="5 min read"
        />
      </Field>

      <div className="flex items-center justify-end">
        <button
          onClick={() => onSave(form)}
          disabled={saving}
          className={`px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all ${
            saving
              ? "bg-[var(--border)] text-[var(--muted)] cursor-not-allowed"
              : "bg-[var(--accent)] text-[var(--background)] hover:shadow-lg hover:shadow-[var(--accent)]/30"
          }`}
        >
          {saving && Icons.loader()}
          {saving ? "Saving..." : "Save blog details"}
        </button>
      </div>
    </div>
  );
};

const DashboardContent = () => {
  const { showToast } = useApp();
  const { users, fetchCurrentUser } = useUsers();
  const { blogs, fetchBlogs, updateBlog } = useBlogs();

  const [savingDomain, setSavingDomain] = useState(false);

  const [selectedBlogId, setSelectedBlogId] = useState<number | null>(null);
  const [savingBlog, setSavingBlog] = useState(false);

  useEffect(() => {
    fetchCurrentUser();
    fetchBlogs();
  }, [fetchCurrentUser, fetchBlogs]);

  const selectedBlog = useMemo(
    () => {
      if (blogs.data.length === 0) return null;
      if (selectedBlogId === null) return blogs.data[0];
      return (
        blogs.data.find((blog) => blog.id === selectedBlogId) || blogs.data[0]
      );
    },
    [blogs.data, selectedBlogId],
  );

  const handleSaveDomain = async (domainValue: string) => {
    const trimmed = domainValue.trim();
    if (!trimmed) {
      showToast("Please enter a domain name", "error");
      return;
    }

    setSavingDomain(true);
    try {
      await api.users.updateProfile({ link: trimmed });
      await fetchCurrentUser();
      showToast("Domain updated successfully", "success");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update domain";
      showToast(message, "error");
    }
    setSavingDomain(false);
  };

  const handleSaveBlog = async (form: BlogFormValues) => {
    if (!selectedBlog) {
      showToast("Select a blog to update", "error");
      return;
    }

    const payload = {
      title: form.title.trim(),
      excerpt: form.excerpt.trim(),
      category: form.category.trim(),
      readTime: form.readTime.trim(),
    };

    if (!payload.title) {
      showToast("Title is required", "error");
      return;
    }

    const requestData = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== ""),
    );

    setSavingBlog(true);
    try {
      await updateBlog(selectedBlog.id, requestData);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update blog";
      showToast(message, "error");
    }
    setSavingBlog(false);
  };

  const activeBlogId = selectedBlog?.id ?? blogs.data[0]?.id ?? null;
  const initialDomain = users.currentUser?.link || "";

  return (
    <>
      <AvatarMenu />
      <main className="flex-1 min-w-0 bg-[var(--background)] overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Link
              href="/settings"
              className="p-2 rounded-xl text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)] transition-all"
            >
              {Icons.back()}
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-[var(--foreground)]">
                Dashboard
              </h1>
              <p className="text-sm text-[var(--muted)]">
                Manage your site and blog presentation
              </p>
            </div>
          </div>

          {/* Domain Settings */}
          <DomainCard
            key={initialDomain}
            initialDomain={initialDomain}
            saving={savingDomain}
            onSave={handleSaveDomain}
          />

          {/* Blog Details */}
          <Card
            title="Blog details"
            description="Update how your blog posts appear on your site."
          >
            {blogs.loading ? (
              <p className="text-sm text-[var(--muted)]">Loading blogs...</p>
            ) : blogs.error ? (
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-rose-500">{blogs.error}</p>
                <button
                  onClick={fetchBlogs}
                  className="px-3 py-2 rounded-lg bg-[var(--surface-hover)] text-sm font-medium text-[var(--foreground)]"
                >
                  Retry
                </button>
              </div>
            ) : blogs.data.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">
                No blogs available yet. Publish a blog to edit its details.
              </p>
            ) : (
              <div className="space-y-4">
                <Field label="Select blog" hint="Choose a blog to update">
                  <select
                    value={activeBlogId}
                    onChange={(e) => setSelectedBlogId(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
                  >
                    {blogs.data.map((blog) => (
                      <option key={blog.id} value={blog.id}>
                        {blog.title}
                      </option>
                    ))}
                  </select>
                </Field>

                {selectedBlog && (
                  <BlogDetailsForm
                    key={selectedBlog.id}
                    blog={selectedBlog}
                    saving={savingBlog}
                    onSave={handleSaveBlog}
                  />
                )}
              </div>
            )}
          </Card>
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

export const DashboardPageClient = () => {
  return (
    <AppProvider>
      <div className="flex min-h-screen bg-[var(--background)] font-sans text-[var(--foreground)]">
        <DashboardContent />
        <ToastContainerWithContext />
      </div>
    </AppProvider>
  );
};
