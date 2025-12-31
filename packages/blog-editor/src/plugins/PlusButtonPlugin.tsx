import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
} from 'lexical';
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text';
import { $createCodeNode } from '@lexical/code';
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_CHECK_LIST_COMMAND,
} from '@lexical/list';
import { $setBlocksType } from '@lexical/selection';
import { mergeRegister } from '@lexical/utils';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Plus,
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Minus,
  Image,
} from 'lucide-react';
import { $createHorizontalRuleNode } from './HorizontalRuleNode';
import { INSERT_IMAGE_COMMAND } from './ImagePlugin';

interface BlockOption {
  icon: React.ReactNode;
  label: string;
  description: string;
  keywords: string[];
  onSelect: () => void;
}

function PlusButton({
  editor,
  anchorElem,
  onImageUpload,
}: {
  editor: ReturnType<typeof useLexicalComposerContext>[0];
  anchorElem: HTMLElement;
  onImageUpload?: (file: File) => Promise<{ url: string; alt?: string }>;
}): React.JSX.Element {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [buttonPosition, setButtonPosition] = useState({ top: 0 });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filterText, setFilterText] = useState('');

  const updateButtonPosition = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      const rootElement = editor.getRootElement();

      if (!$isRangeSelection(selection) || !rootElement) {
        setIsVisible(false);
        return;
      }

      const anchor = selection.anchor;
      const anchorNode = anchor.getNode();
      const topLevelElement = anchorNode.getTopLevelElement();

      if (!topLevelElement) {
        setIsVisible(false);
        return;
      }

      // Check if line is empty
      const textContent = topLevelElement.getTextContent();
      if (textContent.trim() !== '') {
        setIsVisible(false);
        return;
      }

      // Get DOM element for the node
      const key = topLevelElement.getKey();
      const domElement = editor.getElementByKey(key);

      if (!domElement) {
        setIsVisible(false);
        return;
      }

      const domRect = domElement.getBoundingClientRect();
      const anchorRect = anchorElem.getBoundingClientRect();

      setButtonPosition({
        top: domRect.top - anchorRect.top + (domRect.height / 2) - 14,
      });
      setIsVisible(true);
    });
  }, [editor, anchorElem]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(() => {
        updateButtonPosition();
      })
    );
  }, [editor, updateButtonPosition]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];

    try {
      let imageUrl: string;
      
      if (onImageUpload) {
        const result = await onImageUpload(file);
        imageUrl = result.url;
      } else {
        // Fallback to data URL
        imageUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      }

      editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
        src: imageUrl,
        altText: file.name,
      });
    } catch (error) {
      console.error('Failed to upload image:', error);
    }

    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
    setIsMenuOpen(false);
  };

  const blockOptions: BlockOption[] = [
    {
      icon: <Type size={18} />,
      label: 'Text',
      description: 'Plain text paragraph',
      keywords: ['paragraph', 'text', 'plain'],
      onSelect: () => {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createParagraphNode());
          }
        });
        setIsMenuOpen(false);
      },
    },
    {
      icon: <Heading1 size={18} />,
      label: 'Heading 1',
      description: 'Large section heading',
      keywords: ['h1', 'heading', 'title', 'large'],
      onSelect: () => {
        editor.update(() => {
          const selection = $getSelection();
          $setBlocksType(selection, () => $createHeadingNode('h1'));
        });
        setIsMenuOpen(false);
      },
    },
    {
      icon: <Heading2 size={18} />,
      label: 'Heading 2',
      description: 'Medium section heading',
      keywords: ['h2', 'heading', 'subtitle', 'medium'],
      onSelect: () => {
        editor.update(() => {
          const selection = $getSelection();
          $setBlocksType(selection, () => $createHeadingNode('h2'));
        });
        setIsMenuOpen(false);
      },
    },
    {
      icon: <Heading3 size={18} />,
      label: 'Heading 3',
      description: 'Small section heading',
      keywords: ['h3', 'heading', 'small'],
      onSelect: () => {
        editor.update(() => {
          const selection = $getSelection();
          $setBlocksType(selection, () => $createHeadingNode('h3'));
        });
        setIsMenuOpen(false);
      },
    },
    {
      icon: <List size={18} />,
      label: 'Bullet List',
      description: 'Create a bullet list',
      keywords: ['bullet', 'list', 'unordered', 'ul'],
      onSelect: () => {
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
        setIsMenuOpen(false);
      },
    },
    {
      icon: <ListOrdered size={18} />,
      label: 'Numbered List',
      description: 'Create a numbered list',
      keywords: ['numbered', 'list', 'ordered', 'ol'],
      onSelect: () => {
        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
        setIsMenuOpen(false);
      },
    },
    {
      icon: <CheckSquare size={18} />,
      label: 'To-do List',
      description: 'Track tasks with a to-do list',
      keywords: ['todo', 'checklist', 'checkbox', 'task'],
      onSelect: () => {
        editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
        setIsMenuOpen(false);
      },
    },
    {
      icon: <Quote size={18} />,
      label: 'Quote',
      description: 'Capture a quote',
      keywords: ['quote', 'blockquote', 'cite'],
      onSelect: () => {
        editor.update(() => {
          const selection = $getSelection();
          $setBlocksType(selection, () => $createQuoteNode());
        });
        setIsMenuOpen(false);
      },
    },
    {
      icon: <Code size={18} />,
      label: 'Code',
      description: 'Capture a code snippet',
      keywords: ['code', 'snippet', 'pre'],
      onSelect: () => {
        editor.update(() => {
          const selection = $getSelection();
          $setBlocksType(selection, () => $createCodeNode());
        });
        setIsMenuOpen(false);
      },
    },
    {
      icon: <Image size={18} />,
      label: 'Image',
      description: 'Upload an image',
      keywords: ['image', 'picture', 'photo', 'upload'],
      onSelect: () => {
        imageInputRef.current?.click();
      },
    },
    {
      icon: <Minus size={18} />,
      label: 'Divider',
      description: 'Visual divider line',
      keywords: ['divider', 'horizontal', 'rule', 'line', 'hr'],
      onSelect: () => {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const node = $createHorizontalRuleNode();
            selection.insertNodes([node]);
          }
        });
        setIsMenuOpen(false);
      },
    },
  ];

  const filteredOptions = filterText
    ? blockOptions.filter(
        (option) =>
          option.label.toLowerCase().includes(filterText.toLowerCase()) ||
          option.keywords.some((k) => k.includes(filterText.toLowerCase()))
      )
    : blockOptions;

  const openMenu = () => {
    const button = buttonRef.current;
    if (!button) return;

    const buttonRect = button.getBoundingClientRect();
    const anchorRect = anchorElem.getBoundingClientRect();

    // Menu dimensions (from CSS)
    const menuHeight = 400; // max-height
    const menuWidth = 280;
    const gap = 4;

    // Calculate initial position (below the button)
    let top = buttonRect.bottom - anchorRect.top + gap;
    let left = buttonRect.left - anchorRect.left;

    // Check if menu would go off the bottom of the viewport
    const spaceBelow = window.innerHeight - buttonRect.bottom;
    const spaceAbove = buttonRect.top;

    if (spaceBelow < menuHeight && spaceAbove > spaceBelow) {
      // Not enough space below, but more space above - position above the button
      top = buttonRect.top - anchorRect.top - menuHeight - gap;
    }

    // Check if menu would go off the right edge of the viewport
    const spaceRight = window.innerWidth - buttonRect.left;
    if (spaceRight < menuWidth) {
      // Adjust left position to keep menu in viewport
      left = buttonRect.right - anchorRect.left - menuWidth;
    }

    setMenuPosition({ top, left });
    setIsMenuOpen(true);
    setSelectedIndex(0);
    setFilterText('');
  };

  // Handle keyboard navigation when menu is open
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredOptions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredOptions.length) % filteredOptions.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        filteredOptions[selectedIndex]?.onSelect();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen, selectedIndex, filteredOptions]);

  // Close menu when clicking outside
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  return createPortal(
    <>
      <button
        ref={buttonRef}
        className="blog-editor-plus-button"
        style={{
          opacity: isVisible && !isMenuOpen ? 1 : 0,
          pointerEvents: isVisible ? 'auto' : 'none',
          top: buttonPosition.top,
        }}
        onClick={openMenu}
        title="Add block"
        aria-label="Add block"
      >
        <Plus size={18} />
      </button>

      {isMenuOpen && (
        <div
          ref={menuRef}
          className="blog-editor-block-menu"
          style={{
            top: menuPosition.top,
            left: menuPosition.left,
          }}
        >
          <div className="blog-editor-block-menu-header">
            Add block
          </div>
          <div className="blog-editor-block-menu-list">
            {filteredOptions.map((option, index) => (
              <button
                key={option.label}
                className={`blog-editor-block-menu-item ${index === selectedIndex ? 'selected' : ''}`}
                onClick={option.onSelect}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="blog-editor-block-menu-icon">{option.icon}</div>
                <div className="blog-editor-block-menu-content">
                  <div className="blog-editor-block-menu-label">{option.label}</div>
                  <div className="blog-editor-block-menu-description">{option.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="blog-editor-hidden-input"
        onChange={handleImageUpload}
      />
    </>,
    anchorElem
  );
}

interface PlusButtonPluginProps {
  onImageUpload?: (file: File) => Promise<{ url: string; alt?: string }>;
}

export function PlusButtonPlugin({ onImageUpload }: PlusButtonPluginProps): React.JSX.Element | null {
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

  return <PlusButton editor={editor} anchorElem={floatingAnchorElem} onImageUpload={onImageUpload} />;
}
