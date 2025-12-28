// Main component exports
export { BlogEditor } from './components/BlogEditor';
export { MetadataPopup } from './components/MetadataPopup';

// Hook exports
export { useBlogEditor } from './hooks';

// Plugin exports
export {
  ImageNode,
  $createImageNode,
  $isImageNode,
  HorizontalRuleNode,
  $createHorizontalRuleNode,
  $isHorizontalRuleNode,
  ImagePlugin,
  INSERT_IMAGE_COMMAND,
  FloatingToolbarPlugin,
  PlusButtonPlugin,
  SlashCommandsPlugin,
  MarkdownPlugin,
  useMarkdownExport,
  useMarkdownImport,
  BLOG_TRANSFORMERS,
  IMPORT_MARKDOWN_COMMAND,
  EXPORT_MARKDOWN_COMMAND,
} from './plugins';

export type {
  ImagePayload,
  SerializedImageNode,
  SerializedHorizontalRuleNode,
} from './plugins';

// Theme exports
export { defaultTheme, editorStyles } from './themes';

// Type exports
export type {
  BlogMetadata,
  ImageUploadResult,
  FileUploadResult,
  EditorTheme,
  BlogEditorProps,
  ToolbarProps,
  MetadataPopupProps,
  ImageNodePayload,
  FileNodePayload,
  HeadingTagType,
  BlockFormatType,
} from './types';

// Utility exports
export {
  calculateReadingTime,
  getWordCount,
  getCharCount,
  generateSlug,
  formatFileSize,
  isValidImageType,
  isValidFileSize,
  readFileAsDataURL,
  debounce,
  sanitizeHtml,
  extractTextFromHtml,
} from './utils';
