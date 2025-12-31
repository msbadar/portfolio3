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
import { EditorState, SerializedEditorState, $getRoot } from 'lexical';
import { $convertToMarkdownString } from '@lexical/markdown';
import { ArrowLeft, Settings } from 'lucide-react';

import { defaultTheme } from '../themes';
import { ImageNode } from '../plugins/ImageNode';
import { HorizontalRuleNode as CustomHRNode } from '../plugins/HorizontalRuleNode';
import { ImagePlugin } from '../plugins/ImagePlugin';
import { FloatingToolbarPlugin } from '../plugins/FloatingToolbarPlugin';
import { PlusButtonPlugin } from '../plugins/PlusButtonPlugin';
import { SlashCommandsPlugin } from '../plugins/SlashCommandsPlugin';
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
  onBack,
  onImageUpload,
  onFileUpload: _onFileUpload,
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
    <div
      className={`blog-editor-container ${fullPage ? 'full-page' : ''} ${className}`}
    >
      {/* Status bar */}
      <div className="blog-editor-status-bar">
        <div className="blog-editor-status-bar-left">
          {onBack && (
              <button
                type="button"
                className="blog-editor-status-bar-button"
                onClick={onBack}
                title="Go back"
                aria-label="Go back"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <button
              type="button"
              className="blog-editor-status-bar-button"
              onClick={() => setShowMetadata(true)}
              title="Blog settings"
              aria-label="Open blog settings"
            >
              <Settings size={18} />
            </button>
        </div>
        {(showWordCount || showCharCount || showReadingTime) && (
          <div className="blog-editor-status-bar-stats">
            {showWordCount && <span>{wordCount} words</span>}
              {showCharCount && (
                <span>
                  {charCount}
                  {maxLength ? `/${maxLength}` : ''} characters
                </span>
              )}
            {showReadingTime && <span>{readingTime} min read</span>}
          </div>
        )}
        {onSave && (
          <button
            type="button"
            className="blog-editor-save-button"
            onClick={() => {
              if (editorState) {
                onSave(
                  content,
                  metadata,
                  editorState.toJSON() as SerializedEditorState
                );
              }
            }}
          >
            Save
          </button>
        )}
        </div>

        <LexicalComposer initialConfig={initialConfig}>
          <div className="blog-editor-content-wrapper">
            <RichTextPlugin
              contentEditable={
                <ContentEditable className="blog-editor-root" />
              }
              placeholder={<Placeholder text={placeholder} />}
              ErrorBoundary={LexicalErrorBoundary}
            />
            {!readOnly && (
              <>
                <FloatingToolbarPlugin />
                <PlusButtonPlugin onImageUpload={onImageUpload} />
                <SlashCommandsPlugin onImageUpload={onImageUpload} />
              </>
            )}
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

      {/* Metadata popup */}
      <MetadataPopup
        isOpen={showMetadata}
        onClose={() => setShowMetadata(false)}
        metadata={metadata}
        onMetadataChange={handleMetadataChange}
        onImageUpload={onImageUpload}
      />
    </div>
  );
}
