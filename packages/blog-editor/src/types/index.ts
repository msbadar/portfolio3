import { LexicalEditor, SerializedEditorState, EditorState } from 'lexical';

export interface BlogMetadata {
  title: string;
  description: string;
  keywords: string[];
  author?: string;
  publishDate?: Date;
  coverImage?: string;
  slug?: string;
  category?: string;
  tags?: string[];
  excerpt?: string;
  isPublished?: boolean;
  readingTime?: number;
}

export interface ImageUploadResult {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface FileUploadResult {
  url: string;
  name: string;
  size: number;
  type: string;
}

export interface EditorTheme {
  root?: string;
  paragraph?: string;
  heading?: {
    h1?: string;
    h2?: string;
    h3?: string;
    h4?: string;
    h5?: string;
    h6?: string;
  };
  list?: {
    nested?: {
      listitem?: string;
    };
    ol?: string;
    ul?: string;
    listitem?: string;
  };
  quote?: string;
  code?: string;
  codeHighlight?: Record<string, string>;
  text?: {
    bold?: string;
    italic?: string;
    underline?: string;
    strikethrough?: string;
    code?: string;
    highlight?: string;
    subscript?: string;
    superscript?: string;
  };
  link?: string;
  image?: string;
  table?: string;
  tableCell?: string;
  tableCellHeader?: string;
  hr?: string;
}

export interface BlogEditorProps {
  /** Initial content in markdown format */
  initialContent?: string;
  /** Initial editor state (JSON) */
  initialState?: SerializedEditorState;
  /** Placeholder text */
  placeholder?: string;
  /** Initial metadata for the blog */
  initialMetadata?: Partial<BlogMetadata>;
  /** Called when content changes */
  onChange?: (content: string, editorState: EditorState) => void;
  /** Called when metadata changes */
  onMetadataChange?: (metadata: BlogMetadata) => void;
  /** Called when save is triggered */
  onSave?: (content: string, metadata: BlogMetadata, editorState: SerializedEditorState) => void;
  /** Called when back button is clicked */
  onBack?: () => void;
  /** Image upload handler */
  onImageUpload?: (file: File) => Promise<ImageUploadResult>;
  /** File upload handler */
  onFileUpload?: (file: File) => Promise<FileUploadResult>;
  /** Enable full page mode */
  fullPage?: boolean;
  /** Custom theme */
  theme?: Partial<EditorTheme>;
  /** Editor is read-only */
  readOnly?: boolean;
  /** Auto-save interval in milliseconds */
  autoSaveInterval?: number;
  /** Maximum character count */
  maxLength?: number;
  /** Show word count */
  showWordCount?: boolean;
  /** Show character count */
  showCharCount?: boolean;
  /** Show reading time */
  showReadingTime?: boolean;
  /** Custom CSS class for the editor container */
  className?: string;
}

export interface ToolbarProps {
  editor: LexicalEditor;
  disabled?: boolean;
}

export interface MetadataPopupProps {
  isOpen: boolean;
  onClose: () => void;
  metadata: BlogMetadata;
  onMetadataChange: (metadata: BlogMetadata) => void;
  onImageUpload?: (file: File) => Promise<ImageUploadResult>;
}

export interface ImageNodePayload {
  src: string;
  altText?: string;
  width?: number;
  height?: number;
  caption?: string;
}

export interface FileNodePayload {
  url: string;
  name: string;
  size: number;
  type: string;
}

export type HeadingTagType = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export type BlockFormatType = 
  | 'paragraph'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'bullet'
  | 'number'
  | 'check'
  | 'quote'
  | 'code';
