import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { CodeNode, CodeHighlightNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { TableNode, TableCellNode, TableRowNode } from '@lexical/table';
import { HashtagNode } from '@lexical/hashtag';
import { OverflowNode } from '@lexical/overflow';
import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';
import { EditorState, SerializedEditorState, $getRoot } from 'lexical';
import { $convertToMarkdownString } from '@lexical/markdown';
import { Settings } from 'lucide-react';

import { defaultTheme, editorStyles } from '../themes';
import { ImageNode } from '../plugins/ImageNode';
import { HorizontalRuleNode as CustomHRNode } from '../plugins/HorizontalRuleNode';
import { ImagePlugin } from '../plugins/ImagePlugin';
import { ToolbarPlugin } from '../plugins/ToolbarPlugin';
import { MarkdownPlugin, BLOG_TRANSFORMERS } from '../plugins/MarkdownPlugin';
import { MetadataPopup } from './MetadataPopup';
import {
  calculateReadingTime,
  getWordCount,
  getCharCount,
  debounce,
} from '../utils';
import type { BlogEditorProps, BlogMetadata, EditorTheme } from '../types';

const defaultMetadata: BlogMetadata = {
  title: '',
  description: '',
  keywords: [],
  author: '',
  category: '',
  slug: '',
  excerpt: '',
  isPublished: false,
};

function Placeholder({ text }: { text: string }): React.JSX.Element {
  return <div className="blog-editor-placeholder">{text}</div>;
}

export function BlogEditor({
  initialContent = '',
  initialState,
  placeholder = 'Start writing your blog post...',
  initialMetadata,
  onChange,
  onMetadataChange,
  onSave,
  onImageUpload,
  onFileUpload,
  fullPage = false,
  theme: customTheme,
  readOnly = false,
  autoSaveInterval,
  maxLength,
  showWordCount = true,
  showCharCount = false,
  showReadingTime = true,
  className = '',
}: BlogEditorProps): React.JSX.Element {
  const [metadata, setMetadata] = useState<BlogMetadata>({
    ...defaultMetadata,
    ...initialMetadata,
  });
  const [showMetadata, setShowMetadata] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [content, setContent] = useState(initialContent);
  const [editorState, setEditorState] = useState<EditorState | null>(null);

  // Merge themes
  const mergedTheme = useMemo(
    (): EditorTheme => ({
      ...defaultTheme,
      ...customTheme,
    }),
    [customTheme]
  );

  // Initial editor config
  const initialConfig = useMemo(
    () => ({
      namespace: 'BlogEditor',
      theme: mergedTheme,
      onError: (error: Error) => {
        console.error('Lexical error:', error);
      },
      nodes: [
        HeadingNode,
        QuoteNode,
        ListNode,
        ListItemNode,
        CodeNode,
        CodeHighlightNode,
        LinkNode,
        AutoLinkNode,
        TableNode,
        TableCellNode,
        TableRowNode,
        HashtagNode,
        OverflowNode,
        HorizontalRuleNode,
        CustomHRNode,
        ImageNode,
      ],
      editable: !readOnly,
      editorState: initialState
        ? JSON.stringify(initialState)
        : undefined,
    }),
    [mergedTheme, readOnly, initialState]
  );

  // Handle content changes
  const handleChange = useCallback(
    (state: EditorState) => {
      setEditorState(state);
      state.read(() => {
        const root = $getRoot();
        const textContent = root.getTextContent();
        
        // Update counts
        const words = getWordCount(textContent);
        const chars = getCharCount(textContent);
        const reading = calculateReadingTime(textContent);
        
        setWordCount(words);
        setCharCount(chars);
        setReadingTime(reading);
        setMetadata((prev) => ({ ...prev, readingTime: reading }));

        // Convert to markdown
        const markdown = $convertToMarkdownString(BLOG_TRANSFORMERS);
        setContent(markdown);

        if (onChange) {
          onChange(markdown, state);
        }
      });
    },
    [onChange]
  );

  // Handle metadata changes
  const handleMetadataChange = useCallback(
    (newMetadata: BlogMetadata) => {
      setMetadata(newMetadata);
      if (onMetadataChange) {
        onMetadataChange(newMetadata);
      }
    },
    [onMetadataChange]
  );

  // Auto-save functionality
  useEffect(() => {
    if (!autoSaveInterval || !onSave || !editorState) return;

    const debouncedSave = debounce(() => {
      if (editorState) {
        onSave(content, metadata, editorState.toJSON() as SerializedEditorState);
      }
    }, autoSaveInterval);

    debouncedSave();

    return () => {
      // Cleanup is handled by debounce
    };
  }, [content, metadata, editorState, autoSaveInterval, onSave]);

  return (
    <>
      {/* Inject styles */}
      <style>{editorStyles}</style>

      <div
        className={`blog-editor-container ${fullPage ? 'full-page' : ''} ${className}`}
      >
        <LexicalComposer initialConfig={initialConfig}>
          {!readOnly && (
            <ToolbarPlugin
              onImageUpload={onImageUpload}
              onFileUpload={onFileUpload}
              disabled={readOnly}
            />
          )}

          <div style={{ position: 'relative' }}>
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  className="blog-editor-root"
                  style={{
                    borderRadius: readOnly ? '0.5rem' : '0 0 0.5rem 0.5rem',
                  }}
                />
              }
              placeholder={<Placeholder text={placeholder} />}
              ErrorBoundary={LexicalErrorBoundary}
            />
          </div>

          <HistoryPlugin />
          <AutoFocusPlugin />
          <LinkPlugin />
          <ListPlugin />
          <CheckListPlugin />
          <TabIndentationPlugin />
          <ImagePlugin />
          <MarkdownPlugin initialContent={initialContent} />
          <OnChangePlugin onChange={handleChange} />
        </LexicalComposer>

        {/* Status bar */}
        {(showWordCount || showCharCount || showReadingTime) && (
          <div className="blog-editor-status-bar">
            <div style={{ display: 'flex', gap: '1rem' }}>
              {showWordCount && <span>{wordCount} words</span>}
              {showCharCount && (
                <span>
                  {charCount}
                  {maxLength ? `/${maxLength}` : ''} characters
                </span>
              )}
              {showReadingTime && <span>{readingTime} min read</span>}
            </div>
            {onSave && (
              <button
                type="button"
                onClick={() => {
                  if (editorState) {
                    onSave(
                      content,
                      metadata,
                      editorState.toJSON() as SerializedEditorState
                    );
                  }
                }}
                style={{
                  background: 'var(--accent, #4a4a4a)',
                  color: 'var(--background, #ffffff)',
                  border: 'none',
                  padding: '0.375rem 0.75rem',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                }}
              >
                Save
              </button>
            )}
          </div>
        )}

        {/* Metadata button */}
        <button
          type="button"
          className="blog-editor-metadata-button"
          onClick={() => setShowMetadata(true)}
          title="Blog settings"
          aria-label="Open blog settings"
        >
          <Settings size={24} />
        </button>

        {/* Metadata popup */}
        <MetadataPopup
          isOpen={showMetadata}
          onClose={() => setShowMetadata(false)}
          metadata={metadata}
          onMetadataChange={handleMetadataChange}
          onImageUpload={onImageUpload}
        />
      </div>
    </>
  );
}
