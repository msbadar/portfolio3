# @portfolio/blog-editor

A comprehensive, Medium-like blog editor built with [Lexical](https://lexical.dev/) for React/Next.js applications. This package provides a full-featured editor with markdown support, image uploading, and rich text formatting.

## Features

- 📝 **Rich Text Editing** - Full WYSIWYG editor with formatting toolbar
- 📖 **Markdown Support** - Import and export markdown content
- 🖼️ **Image Support** - Upload, embed, and resize images
- 📁 **File Uploads** - Attach files to your blog posts
- 📊 **Word/Character Count** - Real-time statistics and reading time estimation
- 📱 **Responsive Design** - Works on desktop and mobile
- 🎨 **Customizable Themes** - Style the editor to match your application
- 🔧 **Full Page Mode** - Distraction-free writing experience
- ⚙️ **Metadata Popup** - Set blog title, description, keywords, SEO settings, and more
- 💾 **Auto-save** - Automatic saving with customizable intervals

## Installation

```bash
pnpm add @portfolio/blog-editor
```

## Peer Dependencies

Make sure you have the following peer dependencies installed:

```bash
pnpm add react react-dom
```

## Basic Usage

```tsx
import { BlogEditor } from '@portfolio/blog-editor';
import '@portfolio/blog-editor/styles';

function MyBlogPage() {
  const handleSave = (content, metadata, editorState) => {
    console.log('Saving:', { content, metadata });
    // Save to your backend
  };

  return (
    <BlogEditor
      placeholder="Start writing your amazing blog post..."
      onSave={handleSave}
      showWordCount={true}
      showReadingTime={true}
    />
  );
}
```

## Full Page Editor

For a distraction-free writing experience:

```tsx
import { BlogEditor } from '@portfolio/blog-editor';

function FullPageEditor() {
  return (
    <BlogEditor
      fullPage={true}
      placeholder="Write your story..."
      initialMetadata={{
        title: 'My Blog Post',
        author: 'John Doe',
      }}
    />
  );
}
```

## With Image Upload Handler

```tsx
import { BlogEditor, ImageUploadResult } from '@portfolio/blog-editor';

function EditorWithImageUpload() {
  const handleImageUpload = async (file: File): Promise<ImageUploadResult> => {
    // Upload to your server or cloud storage
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json();
    
    return {
      url: data.url,
      alt: file.name,
      width: data.width,
      height: data.height,
    };
  };

  return (
    <BlogEditor
      onImageUpload={handleImageUpload}
      onSave={(content, metadata) => {
        console.log({ content, metadata });
      }}
    />
  );
}
```

## Using the Hook

For more control over the editor state:

```tsx
import { BlogEditor, useBlogEditor } from '@portfolio/blog-editor';

function ControlledEditor() {
  const {
    content,
    metadata,
    isDirty,
    handleChange,
    handleMetadataChange,
    handleSave,
    reset,
  } = useBlogEditor({
    initialContent: '# Hello World',
    initialMetadata: {
      title: 'My Post',
      description: 'A great blog post',
      keywords: ['blog', 'editor'],
    },
    onSave: async (content, metadata, state) => {
      await saveToServer(content, metadata);
    },
  });

  return (
    <div>
      <BlogEditor
        initialContent={content}
        initialMetadata={metadata}
        onChange={handleChange}
        onMetadataChange={handleMetadataChange}
        onSave={handleSave}
      />
      {isDirty && <span>Unsaved changes</span>}
      <button onClick={reset}>Reset</button>
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialContent` | `string` | `''` | Initial markdown content |
| `initialState` | `SerializedEditorState` | `undefined` | Initial Lexical editor state (JSON) |
| `placeholder` | `string` | `'Start writing...'` | Placeholder text |
| `initialMetadata` | `Partial<BlogMetadata>` | `{}` | Initial blog metadata |
| `onChange` | `(content: string, state: EditorState) => void` | `undefined` | Content change handler |
| `onMetadataChange` | `(metadata: BlogMetadata) => void` | `undefined` | Metadata change handler |
| `onSave` | `(content: string, metadata: BlogMetadata, state: SerializedEditorState) => void` | `undefined` | Save handler |
| `onImageUpload` | `(file: File) => Promise<ImageUploadResult>` | `undefined` | Image upload handler |
| `onFileUpload` | `(file: File) => Promise<FileUploadResult>` | `undefined` | File upload handler |
| `fullPage` | `boolean` | `false` | Enable full page mode |
| `theme` | `Partial<EditorTheme>` | `{}` | Custom theme overrides |
| `readOnly` | `boolean` | `false` | Read-only mode |
| `autoSaveInterval` | `number` | `undefined` | Auto-save interval in ms |
| `maxLength` | `number` | `undefined` | Maximum character count |
| `showWordCount` | `boolean` | `true` | Show word count |
| `showCharCount` | `boolean` | `false` | Show character count |
| `showReadingTime` | `boolean` | `true` | Show estimated reading time |
| `className` | `string` | `''` | Additional CSS class |

## Blog Metadata Structure

```typescript
interface BlogMetadata {
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
```

## Toolbar Features

The editor includes a comprehensive toolbar with:

- **Text Formatting**: Bold, Italic, Underline, Strikethrough, Code, Highlight, Subscript, Superscript
- **Block Types**: Paragraph, Heading 1-3, Bullet List, Numbered List, Check List, Quote
- **Insert Elements**: Links, Images, Horizontal Rule, Files
- **Alignment**: Left, Center, Right, Justify
- **History**: Undo/Redo

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + B` | Bold |
| `Ctrl/Cmd + I` | Italic |
| `Ctrl/Cmd + U` | Underline |
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Y` | Redo |
| `Tab` | Indent |
| `Shift + Tab` | Outdent |

## Theming

Customize the editor appearance by passing a custom theme:

```tsx
import { BlogEditor, EditorTheme } from '@portfolio/blog-editor';

const customTheme: Partial<EditorTheme> = {
  root: 'my-custom-root-class',
  paragraph: 'my-paragraph-class',
  heading: {
    h1: 'my-h1-class',
    h2: 'my-h2-class',
    h3: 'my-h3-class',
  },
  text: {
    bold: 'my-bold-class',
    italic: 'my-italic-class',
  },
};

<BlogEditor theme={customTheme} />
```

The editor also respects CSS custom properties:

```css
:root {
  --background: #ffffff;
  --foreground: #1a1a1a;
  --accent: #4a4a4a;
  --surface: #f8f8f8;
  --surface-hover: #f0f0f0;
  --border: #e0e0e0;
  --muted: #737373;
}
```

## Utilities

The package also exports useful utility functions:

```tsx
import {
  calculateReadingTime,
  getWordCount,
  getCharCount,
  generateSlug,
  formatFileSize,
  isValidImageType,
} from '@portfolio/blog-editor';

// Calculate reading time from word count
const readTime = calculateReadingTime(text); // Returns minutes

// Generate URL-friendly slug
const slug = generateSlug('My Blog Post Title'); // 'my-blog-post-title'

// Format file size
const size = formatFileSize(1024); // '1 KB'
```

## License

MIT
