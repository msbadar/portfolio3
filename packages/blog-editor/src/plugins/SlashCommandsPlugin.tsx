import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_HIGH,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_ESCAPE_COMMAND,
  KEY_TAB_COMMAND,
  TextNode,
  $isTextNode,
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

interface SlashCommand {
  icon: React.ReactNode;
  label: string;
  description: string;
  keywords: string[];
  onSelect: () => void;
}

function SlashCommandsMenu({
  editor,
  anchorElem,
  onImageUpload,
}: {
  editor: ReturnType<typeof useLexicalComposerContext>[0];
  anchorElem: HTMLElement;
  onImageUpload?: (file: File) => Promise<{ url: string; alt?: string }>;
}): React.JSX.Element {
  const menuRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filterText, setFilterText] = useState('');
  const [triggerNode, setTriggerNode] = useState<TextNode | null>(null);

  const closeMenu = useCallback(() => {
    setIsVisible(false);
    setFilterText('');
    setTriggerNode(null);
  }, []);

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
    closeMenu();
  };

  const removeSlashCommand = useCallback(() => {
    if (!triggerNode) return;
    
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      const currentNode = selection.anchor.getNode();
      if (!$isTextNode(currentNode)) return;

      const textContent = currentNode.getTextContent();
      const slashIndex = textContent.lastIndexOf('/');
      
      if (slashIndex >= 0) {
        // Remove the slash and any filter text
        const newText = textContent.substring(0, slashIndex);
        currentNode.setTextContent(newText);
        selection.anchor.set(currentNode.getKey(), newText.length, 'text');
        selection.focus.set(currentNode.getKey(), newText.length, 'text');
      }
    });
  }, [editor, triggerNode]);

  const createSlashCommands = useCallback((): SlashCommand[] => [
    {
      icon: <Type size={18} />,
      label: 'Text',
      description: 'Plain text paragraph',
      keywords: ['paragraph', 'text', 'plain'],
      onSelect: () => {
        removeSlashCommand();
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createParagraphNode());
          }
        });
        closeMenu();
      },
    },
    {
      icon: <Heading1 size={18} />,
      label: 'Heading 1',
      description: 'Large section heading',
      keywords: ['h1', 'heading', 'title', 'large'],
      onSelect: () => {
        removeSlashCommand();
        editor.update(() => {
          const selection = $getSelection();
          $setBlocksType(selection, () => $createHeadingNode('h1'));
        });
        closeMenu();
      },
    },
    {
      icon: <Heading2 size={18} />,
      label: 'Heading 2',
      description: 'Medium section heading',
      keywords: ['h2', 'heading', 'subtitle', 'medium'],
      onSelect: () => {
        removeSlashCommand();
        editor.update(() => {
          const selection = $getSelection();
          $setBlocksType(selection, () => $createHeadingNode('h2'));
        });
        closeMenu();
      },
    },
    {
      icon: <Heading3 size={18} />,
      label: 'Heading 3',
      description: 'Small section heading',
      keywords: ['h3', 'heading', 'small'],
      onSelect: () => {
        removeSlashCommand();
        editor.update(() => {
          const selection = $getSelection();
          $setBlocksType(selection, () => $createHeadingNode('h3'));
        });
        closeMenu();
      },
    },
    {
      icon: <List size={18} />,
      label: 'Bullet List',
      description: 'Create a bullet list',
      keywords: ['bullet', 'list', 'unordered', 'ul'],
      onSelect: () => {
        removeSlashCommand();
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
        closeMenu();
      },
    },
    {
      icon: <ListOrdered size={18} />,
      label: 'Numbered List',
      description: 'Create a numbered list',
      keywords: ['numbered', 'list', 'ordered', 'ol'],
      onSelect: () => {
        removeSlashCommand();
        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
        closeMenu();
      },
    },
    {
      icon: <CheckSquare size={18} />,
      label: 'To-do List',
      description: 'Track tasks with a to-do list',
      keywords: ['todo', 'checklist', 'checkbox', 'task'],
      onSelect: () => {
        removeSlashCommand();
        editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
        closeMenu();
      },
    },
    {
      icon: <Quote size={18} />,
      label: 'Quote',
      description: 'Capture a quote',
      keywords: ['quote', 'blockquote', 'cite'],
      onSelect: () => {
        removeSlashCommand();
        editor.update(() => {
          const selection = $getSelection();
          $setBlocksType(selection, () => $createQuoteNode());
        });
        closeMenu();
      },
    },
    {
      icon: <Code size={18} />,
      label: 'Code',
      description: 'Capture a code snippet',
      keywords: ['code', 'snippet', 'pre'],
      onSelect: () => {
        removeSlashCommand();
        editor.update(() => {
          const selection = $getSelection();
          $setBlocksType(selection, () => $createCodeNode());
        });
        closeMenu();
      },
    },
    {
      icon: <Image size={18} />,
      label: 'Image',
      description: 'Upload an image',
      keywords: ['image', 'picture', 'photo', 'upload'],
      onSelect: () => {
        removeSlashCommand();
        imageInputRef.current?.click();
      },
    },
    {
      icon: <Minus size={18} />,
      label: 'Divider',
      description: 'Visual divider line',
      keywords: ['divider', 'horizontal', 'rule', 'line', 'hr'],
      onSelect: () => {
        removeSlashCommand();
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const node = $createHorizontalRuleNode();
            selection.insertNodes([node]);
          }
        });
        closeMenu();
      },
    },
  ], [editor, closeMenu, removeSlashCommand]);

  const slashCommands = createSlashCommands();

  const filteredCommands = filterText
    ? slashCommands.filter(
        (cmd) =>
          cmd.label.toLowerCase().includes(filterText.toLowerCase()) ||
          cmd.keywords.some((k) => k.includes(filterText.toLowerCase()))
      )
    : slashCommands;

  // Listen for text changes to detect slash commands
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
          if (isVisible) closeMenu();
          return;
        }

        const anchorNode = selection.anchor.getNode();
        if (!$isTextNode(anchorNode)) {
          if (isVisible) closeMenu();
          return;
        }

        const textContent = anchorNode.getTextContent();
        const anchorOffset = selection.anchor.offset;
        
        // Find the last slash before cursor
        const textBeforeCursor = textContent.substring(0, anchorOffset);
        const lastSlashIndex = textBeforeCursor.lastIndexOf('/');

        if (lastSlashIndex === -1) {
          if (isVisible) closeMenu();
          return;
        }

        // Check if slash is at start of line or after a space
        const charBeforeSlash = lastSlashIndex > 0 ? textBeforeCursor[lastSlashIndex - 1] : '';
        if (lastSlashIndex > 0 && charBeforeSlash !== ' ' && charBeforeSlash !== '\n') {
          if (isVisible) closeMenu();
          return;
        }

        // Get filter text after slash
        const filter = textBeforeCursor.substring(lastSlashIndex + 1);
        
        // Don't show if there's a space in the filter (command is complete)
        if (filter.includes(' ')) {
          if (isVisible) closeMenu();
          return;
        }

        setFilterText(filter);
        setTriggerNode(anchorNode);

        // Position menu
        const rootElement = editor.getRootElement();
        if (rootElement) {
          const nativeSelection = window.getSelection();
          if (nativeSelection && nativeSelection.rangeCount > 0) {
            const range = nativeSelection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            const anchorRect = anchorElem.getBoundingClientRect();

            setMenuPosition({
              top: rect.bottom - anchorRect.top + 4,
              left: rect.left - anchorRect.left,
            });
          }
        }

        setIsVisible(true);
        setSelectedIndex(0);
      });
    });
  }, [editor, anchorElem, isVisible, closeMenu]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isVisible) return;

    return mergeRegister(
      editor.registerCommand(
        KEY_ARROW_DOWN_COMMAND,
        (event) => {
          event.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
          return true;
        },
        COMMAND_PRIORITY_HIGH
      ),
      editor.registerCommand(
        KEY_ARROW_UP_COMMAND,
        (event) => {
          event.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
          return true;
        },
        COMMAND_PRIORITY_HIGH
      ),
      editor.registerCommand(
        KEY_ENTER_COMMAND,
        (event) => {
          if (filteredCommands[selectedIndex]) {
            event?.preventDefault();
            filteredCommands[selectedIndex].onSelect();
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_HIGH
      ),
      editor.registerCommand(
        KEY_TAB_COMMAND,
        (event) => {
          if (filteredCommands[selectedIndex]) {
            event.preventDefault();
            filteredCommands[selectedIndex].onSelect();
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_HIGH
      ),
      editor.registerCommand(
        KEY_ESCAPE_COMMAND,
        () => {
          closeMenu();
          return true;
        },
        COMMAND_PRIORITY_HIGH
      )
    );
  }, [editor, isVisible, selectedIndex, filteredCommands, closeMenu]);

  // Close menu when clicking outside
  useEffect(() => {
    if (!isVisible) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isVisible, closeMenu]);

  if (!isVisible || filteredCommands.length === 0) {
    return (
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleImageUpload}
      />
    );
  }

  return createPortal(
    <>
      <div
        ref={menuRef}
        className="blog-editor-slash-menu"
        style={{
          top: menuPosition.top,
          left: menuPosition.left,
        }}
      >
        <div className="blog-editor-slash-menu-header">
          Basic blocks
        </div>
        <div className="blog-editor-slash-menu-list">
          {filteredCommands.map((command, index) => (
            <button
              key={command.label}
              className={`blog-editor-slash-menu-item ${index === selectedIndex ? 'selected' : ''}`}
              onClick={command.onSelect}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="blog-editor-slash-menu-icon">{command.icon}</div>
              <div className="blog-editor-slash-menu-content">
                <div className="blog-editor-slash-menu-label">{command.label}</div>
                <div className="blog-editor-slash-menu-description">{command.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleImageUpload}
      />
    </>,
    anchorElem
  );
}

interface SlashCommandsPluginProps {
  onImageUpload?: (file: File) => Promise<{ url: string; alt?: string }>;
}

export function SlashCommandsPlugin({ onImageUpload }: SlashCommandsPluginProps): React.JSX.Element | null {
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

  return <SlashCommandsMenu editor={editor} anchorElem={floatingAnchorElem} onImageUpload={onImageUpload} />;
}
