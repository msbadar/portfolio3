"use client";

import { useState } from "react";
import { BlogEditor, BlogMetadata } from "@portfolio/blog-editor";

export default function EditorPage() {
  const [savedContent, setSavedContent] = useState<string>("");
  const [savedMetadata, setSavedMetadata] = useState<BlogMetadata | null>(null);

  const handleSave = (
    content: string,
    metadata: BlogMetadata
  ) => {
    setSavedContent(content);
    setSavedMetadata(metadata);
    console.log("Blog saved:", { content, metadata });
    alert("Blog saved successfully! Check the console for details.");
  };

  const handleImageUpload = async (file: File) => {
    // In a real app, you would upload to a server
    // For demo, we'll use a data URL
    return new Promise<{ url: string; alt?: string; width?: number; height?: number }>(
      (resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.onload = () => {
            resolve({
              url: reader.result as string,
              alt: file.name,
              width: img.width,
              height: img.height,
            });
          };
          img.src = reader.result as string;
        };
        reader.readAsDataURL(file);
      }
    );
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">
            Blog Editor Demo
          </h1>
          <p className="text-[var(--muted)]">
            A comprehensive, Medium-like blog editor built with Lexical. Select text to see the inline formatting menu. Click the settings button on the right to add metadata.
          </p>
        </header>

        <BlogEditor
          placeholder="Start writing your amazing blog post..."
          initialContent={`# Welcome to the Blog Editor

This is a **comprehensive** blog editor with support for:

- Rich text formatting
- Markdown import/export
- Image uploads
- Code blocks
- And much more!

## Try it out

Select any text to see the inline formatting menu, or click the settings button on the right to add metadata like title, description, and keywords.`}
          initialMetadata={{
            title: "My Amazing Blog Post",
            description: "A demo of the blog editor capabilities",
            keywords: ["blog", "editor", "demo"],
            author: "Demo Author",
          }}
          onSave={handleSave}
          onImageUpload={handleImageUpload}
          showWordCount={true}
          showCharCount={true}
          showReadingTime={true}
          fullPage={false}
        />

        {savedContent && (
          <div className="mt-8 p-6 bg-[var(--surface)] rounded-xl border border-[var(--border)]">
            <h2 className="text-xl font-bold mb-4 text-[var(--foreground)]">
              Saved Content Preview
            </h2>
            {savedMetadata && (
              <div className="mb-4 p-4 bg-[var(--background)] rounded-lg">
                <h3 className="font-semibold text-[var(--foreground)]">
                  {savedMetadata.title || "Untitled"}
                </h3>
                <p className="text-sm text-[var(--muted)] mt-1">
                  {savedMetadata.description || "No description"}
                </p>
                {savedMetadata.keywords.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {savedMetadata.keywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="px-2 py-1 bg-[var(--surface)] rounded-md text-xs text-[var(--muted)]"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
            <pre className="text-sm bg-[var(--background)] p-4 rounded-lg overflow-x-auto text-[var(--foreground)]">
              {savedContent}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
