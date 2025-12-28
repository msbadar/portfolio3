import type { EditorTheme } from '../types';

export const defaultTheme: EditorTheme = {
  root: 'blog-editor-root',
  paragraph: 'blog-editor-paragraph',
  heading: {
    h1: 'blog-editor-h1',
    h2: 'blog-editor-h2',
    h3: 'blog-editor-h3',
    h4: 'blog-editor-h4',
    h5: 'blog-editor-h5',
    h6: 'blog-editor-h6',
  },
  list: {
    nested: {
      listitem: 'blog-editor-nested-listitem',
    },
    ol: 'blog-editor-ol',
    ul: 'blog-editor-ul',
    listitem: 'blog-editor-listitem',
  },
  quote: 'blog-editor-quote',
  code: 'blog-editor-code',
  codeHighlight: {
    atrule: 'blog-editor-tokenAttr',
    attr: 'blog-editor-tokenAttr',
    boolean: 'blog-editor-tokenProperty',
    builtin: 'blog-editor-tokenSelector',
    cdata: 'blog-editor-tokenComment',
    char: 'blog-editor-tokenSelector',
    class: 'blog-editor-tokenFunction',
    'class-name': 'blog-editor-tokenFunction',
    comment: 'blog-editor-tokenComment',
    constant: 'blog-editor-tokenProperty',
    deleted: 'blog-editor-tokenProperty',
    doctype: 'blog-editor-tokenComment',
    entity: 'blog-editor-tokenOperator',
    function: 'blog-editor-tokenFunction',
    important: 'blog-editor-tokenVariable',
    inserted: 'blog-editor-tokenSelector',
    keyword: 'blog-editor-tokenAttr',
    namespace: 'blog-editor-tokenVariable',
    number: 'blog-editor-tokenProperty',
    operator: 'blog-editor-tokenOperator',
    prolog: 'blog-editor-tokenComment',
    property: 'blog-editor-tokenProperty',
    punctuation: 'blog-editor-tokenPunctuation',
    regex: 'blog-editor-tokenVariable',
    selector: 'blog-editor-tokenSelector',
    string: 'blog-editor-tokenSelector',
    symbol: 'blog-editor-tokenProperty',
    tag: 'blog-editor-tokenProperty',
    url: 'blog-editor-tokenOperator',
    variable: 'blog-editor-tokenVariable',
  },
  text: {
    bold: 'blog-editor-text-bold',
    italic: 'blog-editor-text-italic',
    underline: 'blog-editor-text-underline',
    strikethrough: 'blog-editor-text-strikethrough',
    code: 'blog-editor-text-code',
    highlight: 'blog-editor-text-highlight',
    subscript: 'blog-editor-text-subscript',
    superscript: 'blog-editor-text-superscript',
  },
  link: 'blog-editor-link',
  image: 'blog-editor-image',
  table: 'blog-editor-table',
  tableCell: 'blog-editor-tableCell',
  tableCellHeader: 'blog-editor-tableCellHeader',
  hr: 'blog-editor-hr',
};

export const editorStyles = `
/* Root editor styles */
.blog-editor-container {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: var(--foreground, #1a1a1a);
  background: var(--background, #ffffff);
}

.blog-editor-container.full-page {
  min-height: 100vh;
  padding: 2rem;
}

.blog-editor-root {
  min-height: 300px;
  padding: 1rem;
  outline: none;
  border: 1px solid var(--border, #e0e0e0);
  border-radius: 0.5rem;
  background: var(--surface, #f8f8f8);
}

.blog-editor-root:focus {
  border-color: var(--accent, #4a4a4a);
}

.blog-editor-container.full-page .blog-editor-root {
  min-height: calc(100vh - 200px);
  border: none;
  border-radius: 0;
  background: transparent;
  max-width: 65ch;
  margin: 0 auto;
  padding: 2rem 0;
}

/* Typography */
.blog-editor-paragraph {
  margin: 0 0 1rem 0;
  line-height: 1.7;
}

.blog-editor-h1 {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.03em;
  margin: 2rem 0 1rem;
}

.blog-editor-h2 {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -0.02em;
  margin: 1.75rem 0 0.875rem;
}

.blog-editor-h3 {
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: -0.015em;
  margin: 1.5rem 0 0.75rem;
}

.blog-editor-h4 {
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.5;
  letter-spacing: -0.01em;
  margin: 1.25rem 0 0.625rem;
}

.blog-editor-h5 {
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.5;
  margin: 1rem 0 0.5rem;
}

.blog-editor-h6 {
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.5;
  margin: 1rem 0 0.5rem;
  color: var(--muted, #737373);
}

/* Lists */
.blog-editor-ul {
  list-style-type: disc;
  padding-left: 1.5rem;
  margin: 1rem 0;
}

.blog-editor-ol {
  list-style-type: decimal;
  padding-left: 1.5rem;
  margin: 1rem 0;
}

.blog-editor-listitem {
  margin: 0.25rem 0;
  line-height: 1.6;
}

.blog-editor-nested-listitem {
  list-style-type: none;
}

/* Quote */
.blog-editor-quote {
  border-left: 4px solid var(--accent, #4a4a4a);
  padding-left: 1rem;
  margin: 1.5rem 0;
  font-style: italic;
  color: var(--muted, #737373);
}

/* Code */
.blog-editor-code {
  font-family: 'Fira Code', 'Monaco', 'Menlo', monospace;
  background: var(--surface, #f8f8f8);
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1rem 0;
  font-size: 0.875rem;
  line-height: 1.5;
  display: block;
  white-space: pre;
}

/* Code highlighting */
.blog-editor-tokenComment { color: #6a9955; }
.blog-editor-tokenPunctuation { color: #d4d4d4; }
.blog-editor-tokenProperty { color: #9cdcfe; }
.blog-editor-tokenSelector { color: #ce9178; }
.blog-editor-tokenOperator { color: #d4d4d4; }
.blog-editor-tokenAttr { color: #569cd6; }
.blog-editor-tokenVariable { color: #dcdcaa; }
.blog-editor-tokenFunction { color: #dcdcaa; }

/* Text formatting */
.blog-editor-text-bold { font-weight: 700; }
.blog-editor-text-italic { font-style: italic; }
.blog-editor-text-underline { text-decoration: underline; }
.blog-editor-text-strikethrough { text-decoration: line-through; }
.blog-editor-text-code {
  font-family: 'Fira Code', 'Monaco', 'Menlo', monospace;
  background: var(--surface-hover, #f0f0f0);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
}
.blog-editor-text-highlight {
  background: #fef08a;
  padding: 0 0.125rem;
}
.blog-editor-text-subscript { vertical-align: sub; font-size: 0.75em; }
.blog-editor-text-superscript { vertical-align: super; font-size: 0.75em; }

/* Link */
.blog-editor-link {
  color: var(--accent, #4a4a4a);
  text-decoration: underline;
  cursor: pointer;
}

.blog-editor-link:hover {
  text-decoration: none;
}

/* Image */
.blog-editor-image {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
  margin: 1.5rem 0;
  display: block;
}

/* Horizontal rule */
.blog-editor-hr {
  border: none;
  border-top: 1px solid var(--border, #e0e0e0);
  margin: 2rem 0;
}

/* Table */
.blog-editor-table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
}

.blog-editor-tableCell {
  border: 1px solid var(--border, #e0e0e0);
  padding: 0.75rem;
  text-align: left;
}

.blog-editor-tableCellHeader {
  background: var(--surface, #f8f8f8);
  font-weight: 600;
}

/* Toolbar styles */
.blog-editor-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  padding: 0.5rem;
  border: 1px solid var(--border, #e0e0e0);
  border-bottom: none;
  border-radius: 0.5rem 0.5rem 0 0;
  background: var(--background, #ffffff);
  position: sticky;
  top: 0;
  z-index: 10;
}

.blog-editor-toolbar-divider {
  width: 1px;
  height: 24px;
  background: var(--border, #e0e0e0);
  margin: 0 0.25rem;
  align-self: center;
}

.blog-editor-toolbar-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 0.375rem;
  cursor: pointer;
  color: var(--foreground, #1a1a1a);
  transition: all 0.15s ease;
}

.blog-editor-toolbar-button:hover {
  background: var(--surface-hover, #f0f0f0);
}

.blog-editor-toolbar-button.active {
  background: var(--accent, #4a4a4a);
  color: var(--background, #ffffff);
}

.blog-editor-toolbar-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.blog-editor-toolbar-select {
  height: 32px;
  padding: 0 0.5rem;
  border: 1px solid var(--border, #e0e0e0);
  border-radius: 0.375rem;
  background: var(--background, #ffffff);
  font-size: 0.875rem;
  cursor: pointer;
  color: var(--foreground, #1a1a1a);
}

.blog-editor-toolbar-select:hover {
  border-color: var(--accent, #4a4a4a);
}

/* Status bar */
.blog-editor-status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  margin-top: 0.5rem;
  border-radius: 0.5rem;
  background: var(--surface, #f8f8f8);
  font-size: 0.75rem;
  color: var(--muted, #737373);
}

/* Metadata button */
.blog-editor-metadata-button {
  position: fixed;
  right: 1.5rem;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--accent, #4a4a4a);
  color: var(--background, #ffffff);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
  z-index: 50;
}

.blog-editor-metadata-button:hover {
  transform: translateY(-50%) scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

/* Metadata popup */
.blog-editor-metadata-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1rem;
}

.blog-editor-metadata-popup {
  background: var(--background, #ffffff);
  border-radius: 1rem;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.2s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.blog-editor-metadata-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border, #e0e0e0);
}

.blog-editor-metadata-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.blog-editor-metadata-close {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: var(--surface, #f8f8f8);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--foreground, #1a1a1a);
  transition: background 0.15s ease;
}

.blog-editor-metadata-close:hover {
  background: var(--surface-hover, #f0f0f0);
}

.blog-editor-metadata-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.blog-editor-metadata-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.blog-editor-metadata-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--foreground, #1a1a1a);
}

.blog-editor-metadata-input {
  padding: 0.75rem;
  border: 1px solid var(--border, #e0e0e0);
  border-radius: 0.5rem;
  font-size: 0.9375rem;
  background: var(--background, #ffffff);
  color: var(--foreground, #1a1a1a);
  transition: border-color 0.15s ease;
}

.blog-editor-metadata-input:focus {
  outline: none;
  border-color: var(--accent, #4a4a4a);
}

.blog-editor-metadata-textarea {
  min-height: 100px;
  resize: vertical;
}

.blog-editor-metadata-keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.blog-editor-metadata-keyword {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: var(--surface, #f8f8f8);
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.blog-editor-metadata-keyword-remove {
  width: 16px;
  height: 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted, #737373);
  padding: 0;
}

.blog-editor-metadata-keyword-remove:hover {
  color: var(--foreground, #1a1a1a);
}

/* Image upload area */
.blog-editor-image-upload {
  border: 2px dashed var(--border, #e0e0e0);
  border-radius: 0.5rem;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.blog-editor-image-upload:hover {
  border-color: var(--accent, #4a4a4a);
  background: var(--surface, #f8f8f8);
}

.blog-editor-image-upload.has-image {
  padding: 0;
  border: none;
}

.blog-editor-image-preview {
  max-width: 100%;
  border-radius: 0.5rem;
}

/* Image node wrapper */
.blog-editor-image-wrapper {
  position: relative;
  display: inline-block;
  max-width: 100%;
  margin: 1rem 0;
}

.blog-editor-image-wrapper img {
  max-width: 100%;
  height: auto;
  display: block;
  border-radius: 0.5rem;
}

.blog-editor-image-caption {
  text-align: center;
  font-size: 0.875rem;
  color: var(--muted, #737373);
  margin-top: 0.5rem;
  font-style: italic;
}

.blog-editor-image-resizer {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 12px;
  height: 12px;
  background: var(--accent, #4a4a4a);
  border-radius: 2px;
  cursor: se-resize;
}

/* Placeholder */
.blog-editor-placeholder {
  color: var(--muted, #737373);
  position: absolute;
  top: 1rem;
  left: 1rem;
  pointer-events: none;
  user-select: none;
}

.blog-editor-container.full-page .blog-editor-placeholder {
  top: 2rem;
  left: 0;
}

/* Link editor popup */
.blog-editor-link-editor {
  position: absolute;
  z-index: 100;
  background: var(--background, #ffffff);
  border: 1px solid var(--border, #e0e0e0);
  border-radius: 0.5rem;
  padding: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  gap: 0.5rem;
}

.blog-editor-link-editor input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid var(--border, #e0e0e0);
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.blog-editor-link-editor button {
  padding: 0.5rem 1rem;
  background: var(--accent, #4a4a4a);
  color: var(--background, #ffffff);
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
}

/* Floating inline toolbar (Notion/Medium style) */
.blog-editor-floating-toolbar {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 6px 8px;
  background: var(--foreground, #1a1a1a);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  z-index: 1000;
  transition: opacity 0.15s ease;
  will-change: transform;
}

.blog-editor-floating-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  color: var(--background, #ffffff);
  transition: all 0.1s ease;
}

.blog-editor-floating-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.blog-editor-floating-btn.active {
  background: rgba(255, 255, 255, 0.25);
  color: #fff;
}

.blog-editor-floating-divider {
  width: 1px;
  height: 20px;
  background: rgba(255, 255, 255, 0.2);
  margin: 0 4px;
}

.blog-editor-floating-link-input {
  display: flex;
  align-items: center;
  gap: 6px;
}

.blog-editor-floating-link-input input {
  width: 200px;
  padding: 6px 10px;
  border: none;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.15);
  color: var(--background, #ffffff);
  font-size: 13px;
  outline: none;
}

.blog-editor-floating-link-input input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.blog-editor-floating-link-input input:focus {
  background: rgba(255, 255, 255, 0.2);
}

.blog-editor-floating-link-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.2);
  color: var(--background, #ffffff);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.1s ease;
}

.blog-editor-floating-link-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}
`;
