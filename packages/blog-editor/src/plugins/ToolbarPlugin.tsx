import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $isCodeNode, CODE_LANGUAGE_MAP } from '@lexical/code';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import {
  $isListNode,
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListNode,
} from '@lexical/list';
import { $isHeadingNode, $createHeadingNode, $createQuoteNode, HeadingTagType } from '@lexical/rich-text';
import {
  $getSelectionStyleValueForProperty,
  $isParentElementRTL,
} from '@lexical/selection';
import {
  $findMatchingParent,
  $getNearestNodeOfType,
  mergeRegister,
} from '@lexical/utils';
import {
  $createParagraphNode,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isRootOrShadowRoot,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  ElementFormatType,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
  $isNodeSelection,
  $insertNodes,
  LexicalNode,
  RangeSelection,
} from 'lexical';
import { $setBlocksType } from '@lexical/selection';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Link,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Minus,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Image,
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  Highlighter,
  Subscript,
  Superscript,
  FileUp,
} from 'lucide-react';
import { INSERT_IMAGE_COMMAND } from './ImagePlugin';
import { $createHorizontalRuleNode } from './HorizontalRuleNode';
import { isValidImageType, readFileAsDataURL } from '../utils';
import type { BlockFormatType, ImageUploadResult, FileUploadResult } from '../types';

const blockTypeToBlockName: Record<string, string> = {
  paragraph: 'Normal',
  h1: 'Heading 1',
  h2: 'Heading 2',
  h3: 'Heading 3',
  h4: 'Heading 4',
  h5: 'Heading 5',
  h6: 'Heading 6',
  bullet: 'Bulleted List',
  number: 'Numbered List',
  check: 'Check List',
  quote: 'Quote',
  code: 'Code Block',
};

interface ToolbarPluginProps {
  onImageUpload?: (file: File) => Promise<ImageUploadResult>;
  onFileUpload?: (file: File) => Promise<FileUploadResult>;
  disabled?: boolean;
}

export function ToolbarPlugin({
  onImageUpload,
  onFileUpload,
  disabled = false,
}: ToolbarPluginProps): React.JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = useState(editor);
  const [blockType, setBlockType] = useState<BlockFormatType>('paragraph');
  const [, setSelectedElementKey] = useState<string | null>(null);
  const [, setFontSize] = useState<string>('16px');
  const [, setFontColor] = useState<string>('#000000');
  const [, setBgColor] = useState<string>('#ffffff');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isSubscript, setIsSubscript] = useState(false);
  const [isSuperscript, setIsSuperscript] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [isHighlight, setIsHighlight] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [, setIsRTL] = useState(false);
  const [, setCodeLanguage] = useState<string>('');
  const [elementFormat, setElementFormat] = useState<ElementFormatType>('left');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const linkInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      let element =
        anchorNode.getKey() === 'root'
          ? anchorNode
          : $findMatchingParent(anchorNode, (e) => {
              const parent = e.getParent();
              return parent !== null && $isRootOrShadowRoot(parent);
            });

      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow();
      }

      const elementKey = element.getKey();
      const elementDOM = activeEditor.getElementByKey(elementKey);

      // Update text format
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsStrikethrough(selection.hasFormat('strikethrough'));
      setIsSubscript(selection.hasFormat('subscript'));
      setIsSuperscript(selection.hasFormat('superscript'));
      setIsCode(selection.hasFormat('code'));
      setIsHighlight(selection.hasFormat('highlight'));
      setIsRTL($isParentElementRTL(selection));

      // Update links
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }

      // Update style values
      setFontSize(
        $getSelectionStyleValueForProperty(selection, 'font-size', '16px')
      );
      setFontColor(
        $getSelectionStyleValueForProperty(selection, 'color', '#000000')
      );
      setBgColor(
        $getSelectionStyleValueForProperty(selection, 'background-color', '#ffffff')
      );

      if (elementDOM !== null) {
        setSelectedElementKey(elementKey);
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType<ListNode>(anchorNode, ListNode);
          const type = parentList ? parentList.getListType() : element.getListType();
          setBlockType(type as BlockFormatType);
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType();
          if (type in blockTypeToBlockName) {
            setBlockType(type as BlockFormatType);
          }
          if ($isCodeNode(element)) {
            const language = element.getLanguage() as keyof typeof CODE_LANGUAGE_MAP;
            setCodeLanguage(language ? CODE_LANGUAGE_MAP[language] || language : '');
          }
        }
      }

      // Update element format
      const matchingParent = $findMatchingParent(
        anchorNode,
        (parentNode) => $isElementNode(parentNode) && !parentNode.isInline()
      );
      setElementFormat(
        ($isElementNode(matchingParent)
          ? matchingParent.getFormatType()
          : $isElementNode(element)
          ? element.getFormatType()
          : 'left') as ElementFormatType
      );
    }
  }, [activeEditor]);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, newEditor) => {
        $updateToolbar();
        setActiveEditor(newEditor);
        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );
  }, [editor, $updateToolbar]);

  useEffect(() => {
    return mergeRegister(
      activeEditor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      activeEditor.registerCommand<boolean>(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      ),
      activeEditor.registerCommand<boolean>(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      )
    );
  }, [activeEditor, $updateToolbar]);

  const formatParagraph = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
  };

  const formatHeading = (headingSize: HeadingTagType) => {
    if (blockType !== headingSize) {
      editor.update(() => {
        const selection = $getSelection();
        $setBlocksType(selection, () => $createHeadingNode(headingSize));
      });
    }
  };

  const formatBulletList = () => {
    if (blockType !== 'bullet') {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else {
      formatParagraph();
    }
  };

  const formatNumberedList = () => {
    if (blockType !== 'number') {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    } else {
      formatParagraph();
    }
  };

  const formatCheckList = () => {
    if (blockType !== 'check') {
      editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
    } else {
      formatParagraph();
    }
  };

  const formatQuote = () => {
    if (blockType !== 'quote') {
      editor.update(() => {
        const selection = $getSelection();
        $setBlocksType(selection, () => $createQuoteNode());
      });
    } else {
      formatParagraph();
    }
  };

  const insertHorizontalRule = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection) || $isNodeSelection(selection)) {
        $insertNodes([$createHorizontalRuleNode()]);
      }
    });
  };

  const insertLink = () => {
    if (!isLink) {
      setShowLinkInput(true);
      setTimeout(() => linkInputRef.current?.focus(), 0);
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  };

  const confirmLink = () => {
    if (linkUrl) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, sanitizeUrl(linkUrl));
    }
    setShowLinkInput(false);
    setLinkUrl('');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (!isValidImageType(file)) {
      alert('Please upload a valid image file (JPEG, PNG, GIF, WebP, or SVG)');
      return;
    }

    try {
      let imageUrl: string;
      let width: number | undefined;
      let height: number | undefined;

      if (onImageUpload) {
        const result = await onImageUpload(file);
        imageUrl = result.url;
        width = result.width;
        height = result.height;
      } else {
        imageUrl = await readFileAsDataURL(file);
      }

      editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
        src: imageUrl,
        altText: file.name,
        width,
        height,
      });
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload image. Please try again.');
    }

    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];

    if (onFileUpload) {
      try {
        const result = await onFileUpload(file);
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, result.url);
      } catch (error) {
        console.error('Failed to upload file:', error);
        alert('Failed to upload file. Please try again.');
      }
    } else {
      alert('File upload handler not configured.');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="blog-editor-toolbar">
      {/* Undo/Redo */}
      <ToolbarButton
        onClick={() => activeEditor.dispatchCommand(UNDO_COMMAND, undefined)}
        disabled={!canUndo || disabled}
        title="Undo (Ctrl+Z)"
      >
        <Undo size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => activeEditor.dispatchCommand(REDO_COMMAND, undefined)}
        disabled={!canRedo || disabled}
        title="Redo (Ctrl+Y)"
      >
        <Redo size={18} />
      </ToolbarButton>

      <Divider />

      {/* Block format */}
      <ToolbarButton
        onClick={formatParagraph}
        active={blockType === 'paragraph'}
        disabled={disabled}
        title="Normal text"
      >
        <Pilcrow size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => formatHeading('h1')}
        active={blockType === 'h1'}
        disabled={disabled}
        title="Heading 1"
      >
        <Heading1 size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => formatHeading('h2')}
        active={blockType === 'h2'}
        disabled={disabled}
        title="Heading 2"
      >
        <Heading2 size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => formatHeading('h3')}
        active={blockType === 'h3'}
        disabled={disabled}
        title="Heading 3"
      >
        <Heading3 size={18} />
      </ToolbarButton>

      <Divider />

      {/* Text format */}
      <ToolbarButton
        onClick={() => activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
        active={isBold}
        disabled={disabled}
        title="Bold (Ctrl+B)"
      >
        <Bold size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
        active={isItalic}
        disabled={disabled}
        title="Italic (Ctrl+I)"
      >
        <Italic size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
        active={isUnderline}
        disabled={disabled}
        title="Underline (Ctrl+U)"
      >
        <Underline size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')}
        active={isStrikethrough}
        disabled={disabled}
        title="Strikethrough"
      >
        <Strikethrough size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')}
        active={isCode}
        disabled={disabled}
        title="Inline code"
      >
        <Code size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'highlight')}
        active={isHighlight}
        disabled={disabled}
        title="Highlight"
      >
        <Highlighter size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'subscript')}
        active={isSubscript}
        disabled={disabled}
        title="Subscript"
      >
        <Subscript size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'superscript')}
        active={isSuperscript}
        disabled={disabled}
        title="Superscript"
      >
        <Superscript size={18} />
      </ToolbarButton>

      <Divider />

      {/* Lists and blocks */}
      <ToolbarButton
        onClick={formatBulletList}
        active={blockType === 'bullet'}
        disabled={disabled}
        title="Bullet list"
      >
        <List size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={formatNumberedList}
        active={blockType === 'number'}
        disabled={disabled}
        title="Numbered list"
      >
        <ListOrdered size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={formatCheckList}
        active={blockType === 'check'}
        disabled={disabled}
        title="Check list"
      >
        <CheckSquare size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={formatQuote}
        active={blockType === 'quote'}
        disabled={disabled}
        title="Quote"
      >
        <Quote size={18} />
      </ToolbarButton>

      <Divider />

      {/* Insert elements */}
      <div style={{ position: 'relative' }}>
        <ToolbarButton
          onClick={insertLink}
          active={isLink}
          disabled={disabled}
          title="Insert link"
        >
          <Link size={18} />
        </ToolbarButton>
        {showLinkInput && (
          <div className="blog-editor-link-editor">
            <input
              ref={linkInputRef}
              type="text"
              placeholder="Enter URL..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') confirmLink();
                if (e.key === 'Escape') {
                  setShowLinkInput(false);
                  setLinkUrl('');
                }
              }}
            />
            <button onClick={confirmLink}>Add</button>
          </div>
        )}
      </div>
      <ToolbarButton
        onClick={() => imageInputRef.current?.click()}
        disabled={disabled}
        title="Insert image"
      >
        <Image size={18} />
      </ToolbarButton>
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleImageUpload}
      />
      {onFileUpload && (
        <>
          <ToolbarButton
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            title="Upload file"
          >
            <FileUp size={18} />
          </ToolbarButton>
          <input
            ref={fileInputRef}
            type="file"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
        </>
      )}
      <ToolbarButton
        onClick={insertHorizontalRule}
        disabled={disabled}
        title="Horizontal rule"
      >
        <Minus size={18} />
      </ToolbarButton>

      <Divider />

      {/* Alignment */}
      <ToolbarButton
        onClick={() => activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')}
        active={elementFormat === 'left'}
        disabled={disabled}
        title="Align left"
      >
        <AlignLeft size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')}
        active={elementFormat === 'center'}
        disabled={disabled}
        title="Align center"
      >
        <AlignCenter size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')}
        active={elementFormat === 'right'}
        disabled={disabled}
        title="Align right"
      >
        <AlignRight size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify')}
        active={elementFormat === 'justify'}
        disabled={disabled}
        title="Justify"
      >
        <AlignJustify size={18} />
      </ToolbarButton>
    </div>
  );
}

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
}

function ToolbarButton({
  onClick,
  active = false,
  disabled = false,
  title,
  children,
}: ToolbarButtonProps): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`blog-editor-toolbar-button ${active ? 'active' : ''}`}
    >
      {children}
    </button>
  );
}

function Divider(): React.JSX.Element {
  return <div className="blog-editor-toolbar-divider" />;
}

function getSelectedNode(selection: RangeSelection): LexicalNode {
  const anchorNode = selection.anchor.getNode();
  const focusNode = selection.focus.getNode();
  if (anchorNode === focusNode) {
    return anchorNode;
  }
  const isBackward = selection.focus.offset < selection.anchor.offset;
  if (isBackward) {
    return focusNode;
  } else {
    return anchorNode;
  }
}

function sanitizeUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);
    if (!['http:', 'https:', 'mailto:', 'tel:'].includes(parsedUrl.protocol)) {
      return 'about:blank';
    }
    return url;
  } catch {
    // If URL parsing fails, assume it's a relative URL or just prepend https://
    if (url.startsWith('/') || url.startsWith('#')) {
      return url;
    }
    return `https://${url}`;
  }
}
