import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { $isListNode, ListNode } from '@lexical/list';
import { $isHeadingNode, $createHeadingNode, $createQuoteNode, HeadingTagType } from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';
import {
  $findMatchingParent,
  $getNearestNodeOfType,
  mergeRegister,
} from '@lexical/utils';
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from 'lexical';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Link,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Highlighter,
} from 'lucide-react';
import type { BlockFormatType } from '../types';

function setFloatingElemPosition(
  targetRect: DOMRect | null,
  floatingElem: HTMLElement,
  anchorElem: HTMLElement
): void {
  const scrollerElem = anchorElem.parentElement;

  if (targetRect === null || !scrollerElem) {
    floatingElem.style.opacity = '0';
    floatingElem.style.transform = 'translate(-10000px, -10000px)';
    return;
  }

  const floatingElemRect = floatingElem.getBoundingClientRect();
  const anchorElementRect = anchorElem.getBoundingClientRect();

  let top = targetRect.top - floatingElemRect.height - 10;
  let left = targetRect.left + (targetRect.width - floatingElemRect.width) / 2;

  // Keep within viewport horizontally
  if (left < 10) {
    left = 10;
  } else if (left + floatingElemRect.width > window.innerWidth - 10) {
    left = window.innerWidth - floatingElemRect.width - 10;
  }

  // If not enough space above, show below
  if (top < 10) {
    top = targetRect.bottom + 10;
  }

  // Make position relative to anchor element if it's positioned
  top -= anchorElementRect.top;
  left -= anchorElementRect.left;

  floatingElem.style.opacity = '1';
  floatingElem.style.transform = `translate(${left}px, ${top}px)`;
}

function FloatingToolbar({
  editor,
  anchorElem,
}: {
  editor: ReturnType<typeof useLexicalComposerContext>[0];
  anchorElem: HTMLElement;
}): React.JSX.Element {
  const popupRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [isHighlight, setIsHighlight] = useState(false);
  const [blockType, setBlockType] = useState<BlockFormatType>('paragraph');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const linkInputRef = useRef<HTMLInputElement>(null);

  const updatePopup = useCallback(() => {
    const selection = $getSelection();

    const popupElem = popupRef.current;
    const nativeSelection = window.getSelection();

    if (popupElem === null) {
      return;
    }

    const rootElement = editor.getRootElement();
    if (
      selection !== null &&
      nativeSelection !== null &&
      !nativeSelection.isCollapsed &&
      rootElement !== null &&
      rootElement.contains(nativeSelection.anchorNode)
    ) {
      const rangeRect = getDOMRangeRect(nativeSelection, rootElement);
      setFloatingElemPosition(rangeRect, popupElem, anchorElem);
      setIsVisible(true);
    } else {
      setIsVisible(false);
      setShowLinkInput(false);
      setLinkUrl('');
    }

    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsStrikethrough(selection.hasFormat('strikethrough'));
      setIsCode(selection.hasFormat('code'));
      setIsHighlight(selection.hasFormat('highlight'));

      // Check for link
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }

      // Check block type
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

      if ($isListNode(element)) {
        const parentList = $getNearestNodeOfType<ListNode>(anchorNode, ListNode);
        const type = parentList ? parentList.getListType() : element.getListType();
        setBlockType(type as BlockFormatType);
      } else {
        const type = $isHeadingNode(element)
          ? element.getTag()
          : element.getType();
        setBlockType(type as BlockFormatType);
      }
    }
  }, [editor, anchorElem]);

  useEffect(() => {
    document.addEventListener('selectionchange', () => {
      editor.getEditorState().read(() => {
        updatePopup();
      });
    });
  }, [editor, updatePopup]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(() => {
        editor.getEditorState().read(() => {
          updatePopup();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updatePopup();
          return false;
        },
        COMMAND_PRIORITY_LOW
      )
    );
  }, [editor, updatePopup]);

  const formatHeading = (headingSize: HeadingTagType) => {
    if (blockType !== headingSize) {
      editor.update(() => {
        const selection = $getSelection();
        $setBlocksType(selection, () => $createHeadingNode(headingSize));
      });
    } else {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createParagraphNode());
        }
      });
    }
  };

  const formatQuote = () => {
    if (blockType !== 'quote') {
      editor.update(() => {
        const selection = $getSelection();
        $setBlocksType(selection, () => $createQuoteNode());
      });
    } else {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createParagraphNode());
        }
      });
    }
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

  return createPortal(
    <div
      ref={popupRef}
      className="blog-editor-floating-toolbar"
      style={{
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none',
      }}
    >
      {showLinkInput ? (
        <div className="blog-editor-floating-link-input">
          <input
            ref={linkInputRef}
            type="text"
            placeholder="Enter URL..."
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                confirmLink();
              }
              if (e.key === 'Escape') {
                setShowLinkInput(false);
                setLinkUrl('');
              }
            }}
          />
          <button onClick={confirmLink} className="blog-editor-floating-link-btn">
            Add
          </button>
        </div>
      ) : (
        <>
          {/* Text formatting */}
          <ToolbarButton
            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
            active={isBold}
            title="Bold"
          >
            <Bold size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
            active={isItalic}
            title="Italic"
          >
            <Italic size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
            active={isUnderline}
            title="Underline"
          >
            <Underline size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')}
            active={isStrikethrough}
            title="Strikethrough"
          >
            <Strikethrough size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')}
            active={isCode}
            title="Code"
          >
            <Code size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'highlight')}
            active={isHighlight}
            title="Highlight"
          >
            <Highlighter size={16} />
          </ToolbarButton>

          <Divider />

          {/* Block formatting */}
          <ToolbarButton
            onClick={() => formatHeading('h1')}
            active={blockType === 'h1'}
            title="Heading 1"
          >
            <Heading1 size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => formatHeading('h2')}
            active={blockType === 'h2'}
            title="Heading 2"
          >
            <Heading2 size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => formatHeading('h3')}
            active={blockType === 'h3'}
            title="Heading 3"
          >
            <Heading3 size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={formatQuote}
            active={blockType === 'quote'}
            title="Quote"
          >
            <Quote size={16} />
          </ToolbarButton>

          <Divider />

          {/* Link */}
          <ToolbarButton
            onClick={insertLink}
            active={isLink}
            title="Link"
          >
            <Link size={16} />
          </ToolbarButton>
        </>
      )}
    </div>,
    anchorElem
  );
}

function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`blog-editor-floating-btn ${active ? 'active' : ''}`}
    >
      {children}
    </button>
  );
}

function Divider(): React.JSX.Element {
  return <div className="blog-editor-floating-divider" />;
}

function getDOMRangeRect(
  nativeSelection: Selection,
  rootElement: HTMLElement
): DOMRect {
  const domRange = nativeSelection.getRangeAt(0);

  let rect;

  if (nativeSelection.anchorNode === rootElement) {
    let inner = rootElement;
    while (inner.firstElementChild != null) {
      inner = inner.firstElementChild as HTMLElement;
    }
    rect = inner.getBoundingClientRect();
  } else {
    rect = domRange.getBoundingClientRect();
  }

  return rect;
}

function getSelectedNode(selection: { anchor: { getNode: () => any }; focus: { getNode: () => any } }): any {
  const anchorNode = selection.anchor.getNode();
  const focusNode = selection.focus.getNode();
  if (anchorNode === focusNode) {
    return anchorNode;
  }
  return anchorNode;
}

function sanitizeUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);
    if (!['http:', 'https:', 'mailto:', 'tel:'].includes(parsedUrl.protocol)) {
      return 'about:blank';
    }
    return url;
  } catch {
    if (url.startsWith('/') || url.startsWith('#')) {
      return url;
    }
    return `https://${url}`;
  }
}

export function FloatingToolbarPlugin(): React.JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  const [floatingAnchorElem, setFloatingAnchorElem] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const rootElement = editor.getRootElement();
    if (rootElement !== null) {
      setFloatingAnchorElem(rootElement.parentElement);
    }
  }, [editor]);

  if (floatingAnchorElem === null) {
    return null;
  }

  return <FloatingToolbar editor={editor} anchorElem={floatingAnchorElem} />;
}
