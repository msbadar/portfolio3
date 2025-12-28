"use client";

import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link2,
  Image as ImageIcon,
  Table,
  Minus,
  Eye,
  Edit3,
  Upload,
  FileText,
  Check,
  X,
} from "lucide-react";
import { Markdown } from "./Markdown";

export interface MarkdownEditorRef {
  getValue: () => string;
  setValue: (value: string) => void;
  insertText: (text: string) => void;
  focus: () => void;
}

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  className?: string;
  onImageUpload?: (file: File) => Promise<string>;
  autoSaveKey?: string;
  autoSaveInterval?: number;
}

interface ToolbarButton {
  icon: React.ReactNode;
  label: string;
  action: () => void;
  shortcut?: string;
}

export const MarkdownEditor = forwardRef<MarkdownEditorRef, MarkdownEditorProps>(
  (
    {
      value,
      onChange,
      placeholder = "Write your content here... (Markdown supported)",
      minHeight = "300px",
      className = "",
      onImageUpload,
      autoSaveKey,
      autoSaveInterval = 30000,
    },
    ref
  ) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const [isPreview, setIsPreview] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [linkUrl, setLinkUrl] = useState("");
    const [linkText, setLinkText] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [imageAlt, setImageAlt] = useState("");
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      getValue: () => value,
      setValue: (newValue: string) => onChange(newValue),
      insertText: (text: string) => insertAtCursor(text),
      focus: () => textareaRef.current?.focus(),
    }));

    // Auto-save functionality
    useEffect(() => {
      if (!autoSaveKey) return;

      const savedContent = localStorage.getItem(autoSaveKey);
      if (savedContent && !value) {
        onChange(savedContent);
      }
    }, [autoSaveKey, onChange, value]);

    useEffect(() => {
      if (!autoSaveKey || !value) return;

      const saveTimer = setInterval(() => {
        localStorage.setItem(autoSaveKey, value);
        setLastSaved(new Date());
      }, autoSaveInterval);

      return () => clearInterval(saveTimer);
    }, [autoSaveKey, value, autoSaveInterval]);

    // Insert text at cursor position
    const insertAtCursor = useCallback(
      (text: string, selectRange?: { start: number; end: number }) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newValue =
          value.substring(0, start) + text + value.substring(end);

        onChange(newValue);

        // Set cursor position after state update
        requestAnimationFrame(() => {
          textarea.focus();
          if (selectRange) {
            textarea.setSelectionRange(
              start + selectRange.start,
              start + selectRange.end
            );
          } else {
            const newPosition = start + text.length;
            textarea.setSelectionRange(newPosition, newPosition);
          }
        });
      },
      [value, onChange]
    );

    // Wrap selected text with markdown syntax
    const wrapSelection = useCallback(
      (before: string, after: string = before) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = value.substring(start, end);

        if (selectedText) {
          const newValue =
            value.substring(0, start) +
            before +
            selectedText +
            after +
            value.substring(end);
          onChange(newValue);

          requestAnimationFrame(() => {
            textarea.focus();
            textarea.setSelectionRange(
              start + before.length,
              end + before.length
            );
          });
        } else {
          const placeholder = "text";
          insertAtCursor(before + placeholder + after, {
            start: before.length,
            end: before.length + placeholder.length,
          });
        }
      },
      [value, onChange, insertAtCursor]
    );

    // Insert at line start
    const insertAtLineStart = useCallback(
      (prefix: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const lineStart = value.lastIndexOf("\n", start - 1) + 1;
        const newValue =
          value.substring(0, lineStart) + prefix + value.substring(lineStart);

        onChange(newValue);

        requestAnimationFrame(() => {
          textarea.focus();
          textarea.setSelectionRange(
            start + prefix.length,
            start + prefix.length
          );
        });
      },
      [value, onChange]
    );

    // Toolbar actions
    const toolbarButtons: ToolbarButton[] = [
      {
        icon: <Bold size={16} />,
        label: "Bold",
        action: () => wrapSelection("**"),
        shortcut: "Ctrl+B",
      },
      {
        icon: <Italic size={16} />,
        label: "Italic",
        action: () => wrapSelection("_"),
        shortcut: "Ctrl+I",
      },
      {
        icon: <Strikethrough size={16} />,
        label: "Strikethrough",
        action: () => wrapSelection("~~"),
      },
      { type: "separator" } as unknown as ToolbarButton,
      {
        icon: <Heading1 size={16} />,
        label: "Heading 1",
        action: () => insertAtLineStart("# "),
      },
      {
        icon: <Heading2 size={16} />,
        label: "Heading 2",
        action: () => insertAtLineStart("## "),
      },
      {
        icon: <Heading3 size={16} />,
        label: "Heading 3",
        action: () => insertAtLineStart("### "),
      },
      { type: "separator" } as unknown as ToolbarButton,
      {
        icon: <List size={16} />,
        label: "Bullet List",
        action: () => insertAtLineStart("- "),
      },
      {
        icon: <ListOrdered size={16} />,
        label: "Numbered List",
        action: () => insertAtLineStart("1. "),
      },
      {
        icon: <Quote size={16} />,
        label: "Quote",
        action: () => insertAtLineStart("> "),
      },
      { type: "separator" } as unknown as ToolbarButton,
      {
        icon: <Code size={16} />,
        label: "Code",
        action: () => wrapSelection("`"),
        shortcut: "Ctrl+`",
      },
      {
        icon: <FileText size={16} />,
        label: "Code Block",
        action: () => wrapSelection("```\n", "\n```"),
      },
      { type: "separator" } as unknown as ToolbarButton,
      {
        icon: <Link2 size={16} />,
        label: "Insert Link",
        action: () => setShowLinkModal(true),
        shortcut: "Ctrl+K",
      },
      {
        icon: <ImageIcon size={16} />,
        label: "Insert Image",
        action: () => setShowImageModal(true),
      },
      {
        icon: <Table size={16} />,
        label: "Insert Table",
        action: () =>
          insertAtCursor(
            "\n| Header 1 | Header 2 | Header 3 |\n| -------- | -------- | -------- |\n| Cell 1   | Cell 2   | Cell 3   |\n| Cell 4   | Cell 5   | Cell 6   |\n"
          ),
      },
      {
        icon: <Minus size={16} />,
        label: "Horizontal Rule",
        action: () => insertAtCursor("\n---\n"),
      },
    ];

    // Handle keyboard shortcuts
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (!textareaRef.current || document.activeElement !== textareaRef.current)
          return;

        if (e.ctrlKey || e.metaKey) {
          switch (e.key.toLowerCase()) {
            case "b":
              e.preventDefault();
              wrapSelection("**");
              break;
            case "i":
              e.preventDefault();
              wrapSelection("_");
              break;
            case "k":
              e.preventDefault();
              setShowLinkModal(true);
              break;
            case "`":
              e.preventDefault();
              wrapSelection("`");
              break;
          }
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [wrapSelection]);

    // Handle file drop
    const handleDrop = useCallback(
      async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);

        for (const file of files) {
          if (file.name.endsWith(".md") || file.type === "text/markdown") {
            // Handle markdown file upload
            const reader = new FileReader();
            reader.onload = (event) => {
              const content = event.target?.result as string;
              onChange(content);
            };
            reader.readAsText(file);
          } else if (file.type.startsWith("image/")) {
            // Handle image upload
            if (onImageUpload) {
              setIsUploading(true);
              try {
                const url = await onImageUpload(file);
                insertAtCursor(`![${file.name}](${url})\n`);
              } catch {
                // Handle error silently - user will notice upload didn't work
              } finally {
                setIsUploading(false);
              }
            } else {
              // Create data URL for local preview
              const reader = new FileReader();
              reader.onload = (event) => {
                const dataUrl = event.target?.result as string;
                insertAtCursor(`![${file.name}](${dataUrl})\n`);
              };
              reader.readAsDataURL(file);
            }
          }
        }
      },
      [onChange, onImageUpload, insertAtCursor]
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
    }, []);

    // Handle markdown file upload via button
    const handleMarkdownFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        onChange(content);
      };
      reader.readAsText(file);

      // Reset input
      e.target.value = "";
    };

    // Handle image file upload via button
    const handleImageFileUpload = async (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (onImageUpload) {
        setIsUploading(true);
        try {
          const url = await onImageUpload(file);
          insertAtCursor(`![${file.name}](${url})\n`);
        } catch {
          // Handle error silently
        } finally {
          setIsUploading(false);
        }
      } else {
        // Create data URL for local preview
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          insertAtCursor(`![${file.name}](${dataUrl})\n`);
        };
        reader.readAsDataURL(file);
      }

      // Reset input
      e.target.value = "";
    };

    // Insert link
    const insertLink = () => {
      if (linkUrl) {
        const text = linkText || linkUrl;
        insertAtCursor(`[${text}](${linkUrl})`);
      }
      setShowLinkModal(false);
      setLinkUrl("");
      setLinkText("");
    };

    // Insert image
    const insertImage = () => {
      if (imageUrl) {
        const alt = imageAlt || "image";
        insertAtCursor(`![${alt}](${imageUrl})\n`);
      }
      setShowImageModal(false);
      setImageUrl("");
      setImageAlt("");
    };

    return (
      <div className={`markdown-editor ${className}`}>
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 p-2 bg-[var(--surface)] border border-[var(--border)] rounded-t-xl">
          {toolbarButtons.map((btn, index) => {
            if ((btn as unknown as { type?: string }).type === "separator") {
              return (
                <div
                  key={`sep-${index}`}
                  className="w-px h-5 bg-[var(--border)] mx-1"
                />
              );
            }
            return (
              <button
                key={btn.label}
                onClick={btn.action}
                title={btn.shortcut ? `${btn.label} (${btn.shortcut})` : btn.label}
                className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors"
                type="button"
              >
                {btn.icon}
              </button>
            );
          })}

          <div className="flex-1" />

          {/* Upload buttons */}
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Upload Markdown File"
            className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors"
            type="button"
          >
            <Upload size={16} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,text/markdown"
            onChange={handleMarkdownFileUpload}
            className="hidden"
          />

          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageFileUpload}
            className="hidden"
          />

          {/* Preview toggle */}
          <button
            onClick={() => setIsPreview(!isPreview)}
            title={isPreview ? "Edit" : "Preview"}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg transition-colors ${
              isPreview
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
            }`}
            type="button"
          >
            {isPreview ? <Edit3 size={16} /> : <Eye size={16} />}
            <span className="text-xs font-medium">
              {isPreview ? "Edit" : "Preview"}
            </span>
          </button>
        </div>

        {/* Editor / Preview Area */}
        <div
          className={`relative border border-t-0 border-[var(--border)] overflow-hidden ${
            isDragging ? "ring-2 ring-[var(--accent)] bg-[var(--accent)]/5" : ""
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {isPreview ? (
            <div
              className="p-4 bg-[var(--background)] overflow-auto"
              style={{ minHeight }}
            >
              {value ? (
                <Markdown content={value} />
              ) : (
                <p className="text-[var(--muted)] italic">Nothing to preview</p>
              )}
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full p-4 bg-[var(--background)] text-[var(--foreground)] resize-none outline-none font-mono text-sm leading-relaxed"
              style={{ minHeight }}
            />
          )}

          {/* Drag overlay */}
          {isDragging && (
            <div className="absolute inset-0 flex items-center justify-center bg-[var(--accent)]/10 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-2 text-[var(--accent)]">
                <Upload size={32} />
                <span className="font-medium">
                  Drop files here (Markdown or Images)
                </span>
              </div>
            </div>
          )}

          {/* Upload indicator */}
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[var(--background)]/80">
              <div className="flex items-center gap-2 text-[var(--accent)]">
                <div className="animate-spin w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full" />
                <span className="font-medium">Uploading...</span>
              </div>
            </div>
          )}
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between px-3 py-2 text-xs text-[var(--muted)] border border-t-0 border-[var(--border)] rounded-b-xl bg-[var(--surface)]/50">
          <div className="flex items-center gap-4">
            <span>{value.length} characters</span>
            <span>{value.split(/\s+/).filter(Boolean).length} words</span>
            <span>{value.split("\n").length} lines</span>
          </div>
          {lastSaved && (
            <span>Auto-saved at {lastSaved.toLocaleTimeString()}</span>
          )}
        </div>

        {/* Link Modal */}
        {showLinkModal && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowLinkModal(false)}
          >
            <div
              className="bg-[var(--surface)] rounded-xl p-6 w-full max-w-md shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4 text-[var(--foreground)]">
                Insert Link
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--muted)] mb-1">
                    Link Text
                  </label>
                  <input
                    type="text"
                    value={linkText}
                    onChange={(e) => setLinkText(e.target.value)}
                    placeholder="Display text"
                    className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--muted)] mb-1">
                    URL
                  </label>
                  <input
                    type="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    autoFocus
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowLinkModal(false)}
                  className="px-4 py-2 rounded-lg text-[var(--muted)] hover:bg-[var(--surface-hover)] transition-colors"
                  type="button"
                >
                  Cancel
                </button>
                <button
                  onClick={insertLink}
                  disabled={!linkUrl}
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  type="button"
                >
                  <Check size={16} />
                  Insert
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Image Modal */}
        {showImageModal && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowImageModal(false)}
          >
            <div
              className="bg-[var(--surface)] rounded-xl p-6 w-full max-w-md shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4 text-[var(--foreground)]">
                Insert Image
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--muted)] mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.png"
                    className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--muted)] mb-1">
                    Alt Text
                  </label>
                  <input
                    type="text"
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                    placeholder="Image description"
                    className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm text-[var(--muted)] mb-2">Or upload an image</p>
                  <button
                    onClick={() => imageInputRef.current?.click()}
                    className="flex items-center gap-2 mx-auto px-4 py-2 bg-[var(--surface-hover)] rounded-lg text-[var(--foreground)] hover:bg-[var(--border)] transition-colors"
                    type="button"
                  >
                    <Upload size={16} />
                    Upload Image
                  </button>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowImageModal(false)}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg text-[var(--muted)] hover:bg-[var(--surface-hover)] transition-colors"
                  type="button"
                >
                  <X size={16} />
                  Cancel
                </button>
                <button
                  onClick={insertImage}
                  disabled={!imageUrl}
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  type="button"
                >
                  <Check size={16} />
                  Insert
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

MarkdownEditor.displayName = "MarkdownEditor";
