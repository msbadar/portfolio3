import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  TRANSFORMERS,
  TextMatchTransformer,
  ElementTransformer,
  Transformer,
} from '@lexical/markdown';
import { useEffect, useCallback } from 'react';
import { $getRoot, COMMAND_PRIORITY_EDITOR, createCommand, LexicalCommand } from 'lexical';
import { $createImageNode, ImageNode } from './ImageNode';
import { $createHorizontalRuleNode, HorizontalRuleNode } from './HorizontalRuleNode';

// Custom transformer for images
const IMAGE_TRANSFORMER: TextMatchTransformer = {
  dependencies: [ImageNode],
  export: (node) => {
    if (node instanceof ImageNode) {
      const altText = node.getAltText() || '';
      const src = node.getSrc();
      return `![${altText}](${src})`;
    }
    return null;
  },
  importRegExp: /!\[([^\]]*)\]\(([^)]+)\)/,
  regExp: /!\[([^\]]*)\]\(([^)]+)\)$/,
  replace: (textNode, match) => {
    const [, altText, src] = match;
    const imageNode = $createImageNode({ src, altText });
    textNode.replace(imageNode);
  },
  trigger: ')',
  type: 'text-match',
};

// Custom transformer for horizontal rules
const HORIZONTAL_RULE_TRANSFORMER: ElementTransformer = {
  dependencies: [HorizontalRuleNode],
  export: (node) => {
    if (node instanceof HorizontalRuleNode) {
      return '---';
    }
    return null;
  },
  regExp: /^(---|\*\*\*|___)$/,
  replace: (parentNode) => {
    const hrNode = $createHorizontalRuleNode();
    parentNode.replace(hrNode);
  },
  type: 'element',
};

// Combine all transformers
export const BLOG_TRANSFORMERS: Transformer[] = [
  IMAGE_TRANSFORMER,
  HORIZONTAL_RULE_TRANSFORMER,
  ...TRANSFORMERS,
];

export const IMPORT_MARKDOWN_COMMAND: LexicalCommand<string> = createCommand('IMPORT_MARKDOWN_COMMAND');
export const EXPORT_MARKDOWN_COMMAND: LexicalCommand<void> = createCommand('EXPORT_MARKDOWN_COMMAND');

interface MarkdownPluginProps {
  initialContent?: string;
  onExport?: (markdown: string) => void;
}

export function MarkdownPlugin({
  initialContent,
  onExport,
}: MarkdownPluginProps): null {
  const [editor] = useLexicalComposerContext();

  // Initialize content from markdown
  useEffect(() => {
    if (initialContent) {
      // Use a small delay to ensure the editor is fully mounted
      const timer = setTimeout(() => {
        editor.update(() => {
          const root = $getRoot();
          root.clear();
          $convertFromMarkdownString(initialContent, BLOG_TRANSFORMERS);
        });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [editor, initialContent]);

  // Register import command
  useEffect(() => {
    return editor.registerCommand<string>(
      IMPORT_MARKDOWN_COMMAND,
      (markdown) => {
        editor.update(() => {
          const root = $getRoot();
          root.clear();
          $convertFromMarkdownString(markdown, BLOG_TRANSFORMERS);
        });
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor]);

  // Register export command
  useEffect(() => {
    return editor.registerCommand(
      EXPORT_MARKDOWN_COMMAND,
      () => {
        editor.getEditorState().read(() => {
          const markdown = $convertToMarkdownString(BLOG_TRANSFORMERS);
          if (onExport) {
            onExport(markdown);
          }
        });
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor, onExport]);

  return null;
}

/**
 * Hook to get markdown content from the editor
 */
export function useMarkdownExport(): () => string {
  const [editor] = useLexicalComposerContext();

  return useCallback(() => {
    let markdown = '';
    editor.getEditorState().read(() => {
      markdown = $convertToMarkdownString(BLOG_TRANSFORMERS);
    });
    return markdown;
  }, [editor]);
}

/**
 * Hook to import markdown content into the editor
 */
export function useMarkdownImport(): (markdown: string) => void {
  const [editor] = useLexicalComposerContext();

  return useCallback(
    (markdown: string) => {
      editor.update(() => {
        const root = $getRoot();
        root.clear();
        $convertFromMarkdownString(markdown, BLOG_TRANSFORMERS);
      });
    },
    [editor]
  );
}
