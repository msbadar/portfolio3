import { useState, useCallback } from 'react';
import type { BlogMetadata } from '../types';
import { EditorState, SerializedEditorState } from 'lexical';

interface UseBlogEditorReturn {
  content: string;
  metadata: BlogMetadata;
  editorState: SerializedEditorState | null;
  isDirty: boolean;
  setContent: (content: string) => void;
  setMetadata: (metadata: BlogMetadata) => void;
  handleChange: (content: string, state: EditorState) => void;
  handleMetadataChange: (metadata: BlogMetadata) => void;
  handleSave: (content: string, metadata: BlogMetadata, state: SerializedEditorState) => void;
  reset: () => void;
}

interface UseBlogEditorOptions {
  initialContent?: string;
  initialMetadata?: Partial<BlogMetadata>;
  onSave?: (content: string, metadata: BlogMetadata, state: SerializedEditorState) => void | Promise<void>;
}

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

/**
 * Custom hook for managing blog editor state
 */
export function useBlogEditor(options: UseBlogEditorOptions = {}): UseBlogEditorReturn {
  const { initialContent = '', initialMetadata, onSave } = options;

  const [content, setContent] = useState(initialContent);
  const [metadata, setMetadata] = useState<BlogMetadata>({
    ...defaultMetadata,
    ...initialMetadata,
  });
  const [editorState, setEditorState] = useState<SerializedEditorState | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const handleChange = useCallback((newContent: string, state: EditorState) => {
    setContent(newContent);
    setEditorState(state.toJSON() as SerializedEditorState);
    setIsDirty(true);
  }, []);

  const handleMetadataChange = useCallback((newMetadata: BlogMetadata) => {
    setMetadata(newMetadata);
    setIsDirty(true);
  }, []);

  const handleSave = useCallback(
    async (saveContent: string, saveMetadata: BlogMetadata, state: SerializedEditorState) => {
      if (onSave) {
        await onSave(saveContent, saveMetadata, state);
      }
      setIsDirty(false);
    },
    [onSave]
  );

  const reset = useCallback(() => {
    setContent(initialContent);
    setMetadata({ ...defaultMetadata, ...initialMetadata });
    setEditorState(null);
    setIsDirty(false);
  }, [initialContent, initialMetadata]);

  return {
    content,
    metadata,
    editorState,
    isDirty,
    setContent,
    setMetadata,
    handleChange,
    handleMetadataChange,
    handleSave,
    reset,
  };
}
