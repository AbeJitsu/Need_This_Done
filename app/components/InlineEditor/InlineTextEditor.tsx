'use client';

// ============================================================================
// InlineTextEditor - Notion-style Inline WYSIWYG Editor
// ============================================================================
// What: TipTap editor that appears inline where you click
// Why: Edit text directly on the page without opening a sidebar
// How: Positioned absolutely at click location with floating toolbar

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import MediaLibrary from '@/components/media/MediaLibrary';
import { MediaItem } from '@/lib/media-types';
import { uiChromeBg, toggleButtonColors, hoverBgColors, accentColors } from '@/lib/colors';
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  LinkIcon,
  ImageIcon,
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
} from '@/components/editor/EditorIcons';

// ============================================================================
// Types
// ============================================================================

interface InlineTextEditorProps {
  /** Initial content (HTML or plain text) */
  content: string;
  /** Called when content changes */
  onChange: (html: string) => void;
  /** Called when editing is complete (blur or Enter for single-line) */
  onSave: () => void;
  /** Called when editing is cancelled (ESC) */
  onCancel: () => void;
  /** Position to render the editor */
  position: { x: number; y: number; width: number };
  /** Whether to show rich text tools or plain text only */
  isRichMode?: boolean;
  /** Toggle between rich and plain mode */
  onToggleMode?: () => void;
  /** Placeholder text */
  placeholder?: string;
  /** Whether this is a single-line field (title) or multi-line (description) */
  singleLine?: boolean;
}

// ============================================================================
// Color Palette for Text Colors
// ============================================================================

const textColorPalette = [
  { name: 'Default', value: '' },
  { name: 'Purple', value: accentColors.purple.text.split(' ')[0].replace('text-', '') },
  { name: 'Blue', value: accentColors.blue.text.split(' ')[0].replace('text-', '') },
  { name: 'Green', value: accentColors.green.text.split(' ')[0].replace('text-', '') },
  { name: 'Gold', value: accentColors.gold.text.split(' ')[0].replace('text-', '') },
  { name: 'Teal', value: accentColors.teal.text.split(' ')[0].replace('text-', '') },
  { name: 'Red', value: '#dc2626' },
];

// Map Tailwind color names to hex for TipTap
const tailwindToHex: Record<string, string> = {
  'purple-600': '#9333ea',
  'blue-600': '#2563eb',
  'green-600': '#16a34a',
  'gold-600': '#a36b00',
  'teal-600': '#0d9488',
};

// ============================================================================
// Main Component
// ============================================================================

export default function InlineTextEditor({
  content,
  onChange,
  onSave,
  onCancel,
  position,
  isRichMode = true,
  onToggleMode,
  placeholder = 'Type here...',
  singleLine = false,
}: InlineTextEditorProps) {
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  // ============================================================================
  // Editor Setup
  // ============================================================================

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        // Disable hard breaks for single-line fields
        hardBreak: singleLine ? false : undefined,
      }),
      Image.configure({
        HTMLAttributes: { class: 'max-w-full h-auto rounded-lg' },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-purple-600 dark:text-purple-400 underline hover:text-purple-800',
        },
      }),
      Placeholder.configure({ placeholder }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
      TextStyle,
      Color,
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      handleKeyDown: (_view, event) => {
        // ESC to cancel
        if (event.key === 'Escape') {
          event.preventDefault();
          onCancel();
          return true;
        }
        // Enter to save for single-line fields
        if (singleLine && event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          onSave();
          return true;
        }
        return false;
      },
    },
  });

  // Focus editor on mount
  useEffect(() => {
    if (editor) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        editor.commands.focus('end');
      }, 50);
    }
  }, [editor]);

  // Handle click outside to save
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInsideEditor = editorRef.current?.contains(target);
      const isInsideToolbar = toolbarRef.current?.contains(target);
      const isInsideModal = (event.target as HTMLElement)?.closest('[role="dialog"]');

      if (!isInsideEditor && !isInsideToolbar && !isInsideModal) {
        onSave();
      }
    };

    // Delay adding listener to prevent immediate trigger
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onSave]);

  // ============================================================================
  // Media Handler
  // ============================================================================

  const handleMediaSelect = useCallback((media: MediaItem | MediaItem[]) => {
    if (!editor) return;
    const item = Array.isArray(media) ? media[0] : media;
    if (item?.url) {
      editor.chain().focus().setImage({ src: item.url, alt: item.alt_text || '' }).run();
    }
    setIsMediaOpen(false);
  }, [editor]);

  // ============================================================================
  // Link Handler
  // ============================================================================

  const handleSetLink = useCallback(() => {
    if (!editor) return;
    if (linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    }
    setIsLinkModalOpen(false);
    setLinkUrl('');
  }, [editor, linkUrl]);

  const openLinkModal = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href || '';
    setLinkUrl(previousUrl);
    setIsLinkModalOpen(true);
  }, [editor]);

  // ============================================================================
  // Color Handler
  // ============================================================================

  const setTextColor = useCallback((color: string) => {
    if (!editor) return;
    if (color === '') {
      editor.chain().focus().unsetColor().run();
    } else {
      // Convert Tailwind class to hex if needed
      const hexColor = tailwindToHex[color] || color;
      editor.chain().focus().setColor(hexColor).run();
    }
    setShowColorPicker(false);
  }, [editor]);

  // ============================================================================
  // Calculate Toolbar Position
  // ============================================================================

  const getToolbarPosition = () => {
    // Position toolbar above the editor
    const toolbarHeight = 44;
    const gap = 8;
    let top = position.y - toolbarHeight - gap;

    // If too close to top, position below
    if (top < 10) {
      top = position.y + 100; // Below editor
    }

    return {
      top,
      left: position.x,
      width: Math.max(position.width, 400),
    };
  };

  // ============================================================================
  // Render
  // ============================================================================

  if (!editor) return null;

  const toolbarPos = getToolbarPosition();

  return (
    <>
      {/* Editor Container - positioned at click location */}
      <div
        ref={editorRef}
        className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        style={{
          top: position.y,
          left: position.x,
          width: position.width,
          minWidth: 200,
          maxWidth: '90vw',
        }}
      >
        <EditorContent
          editor={editor}
          className={`
            prose prose-sm dark:prose-invert max-w-none p-3
            focus:outline-none [&_.ProseMirror]:outline-none
            [&_.ProseMirror]:min-h-[${singleLine ? '24px' : '60px'}]
            [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-gray-400
            [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]
            [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left
            [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none
            [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0
          `}
        />

        {/* Hint bar */}
        <div className="px-3 py-1.5 text-xs text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-700 flex justify-between">
          <span>ESC to cancel</span>
          <span>{singleLine ? 'Enter to save' : 'Click outside to save'}</span>
        </div>
      </div>

      {/* Floating Toolbar - rendered in portal */}
      {isRichMode && typeof window !== 'undefined' && createPortal(
        <div
          ref={toolbarRef}
          className={`fixed z-[60] flex items-center gap-1 p-1.5 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 ${uiChromeBg.toolbar}`}
          style={{
            top: toolbarPos.top,
            left: toolbarPos.left,
          }}
        >
          {/* Mode Toggle */}
          {onToggleMode && (
            <>
              <ToolbarButton
                onClick={onToggleMode}
                title="Switch to plain text"
                active={false}
              >
                <span className="text-xs font-medium">Aa</span>
              </ToolbarButton>
              <ToolbarDivider />
            </>
          )}

          {/* Text Formatting */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            title="Bold (Cmd+B)"
          >
            <BoldIcon />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            title="Italic (Cmd+I)"
          >
            <ItalicIcon />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive('underline')}
            title="Underline (Cmd+U)"
          >
            <UnderlineIcon />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Color Picker */}
          <div className="relative">
            <ToolbarButton
              onClick={() => setShowColorPicker(!showColorPicker)}
              title="Text color"
              active={showColorPicker}
            >
              <ColorIcon />
            </ToolbarButton>
            {showColorPicker && (
              <div className="absolute top-full left-0 mt-1 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 flex gap-1">
                {textColorPalette.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setTextColor(color.value)}
                    className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
                    style={{
                      backgroundColor: color.value === '' ? 'transparent' : (tailwindToHex[color.value] || color.value),
                    }}
                    title={color.name}
                  >
                    {color.value === '' && <span className="text-xs">A</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <ToolbarDivider />

          {/* Alignment */}
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            active={editor.isActive({ textAlign: 'left' })}
            title="Align left"
          >
            <AlignLeftIcon />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            active={editor.isActive({ textAlign: 'center' })}
            title="Align center"
          >
            <AlignCenterIcon />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            active={editor.isActive({ textAlign: 'right' })}
            title="Align right"
          >
            <AlignRightIcon />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Links & Media */}
          <ToolbarButton
            onClick={openLinkModal}
            active={editor.isActive('link')}
            title="Add link (Cmd+K)"
          >
            <LinkIcon />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => setIsMediaOpen(true)}
            title="Insert image"
          >
            <ImageIcon />
          </ToolbarButton>
        </div>,
        document.body
      )}

      {/* Plain Text Mode Indicator */}
      {!isRichMode && onToggleMode && typeof window !== 'undefined' && createPortal(
        <div
          ref={toolbarRef}
          className={`fixed z-[60] flex items-center gap-1 p-1.5 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 ${uiChromeBg.toolbar}`}
          style={{
            top: toolbarPos.top,
            left: toolbarPos.left,
          }}
        >
          <ToolbarButton
            onClick={onToggleMode}
            title="Switch to rich text"
            active={false}
          >
            <span className="text-xs font-medium px-1">Rich Text</span>
          </ToolbarButton>
        </div>,
        document.body
      )}

      {/* Media Library Modal */}
      <MediaLibrary
        isOpen={isMediaOpen}
        onClose={() => setIsMediaOpen(false)}
        onSelect={handleMediaSelect}
        title="Insert Image"
      />

      {/* Link Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsLinkModalOpen(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md" role="dialog">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {linkUrl ? 'Edit Link' : 'Add Link'}
            </h3>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSetLink();
                if (e.key === 'Escape') setIsLinkModalOpen(false);
              }}
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setIsLinkModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              {editor?.getAttributes('link').href && (
                <button
                  onClick={() => {
                    editor?.chain().focus().unsetLink().run();
                    setIsLinkModalOpen(false);
                  }}
                  className={`px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 ${hoverBgColors.red} rounded-lg transition-colors`}
                >
                  Remove
                </button>
              )}
              <button
                onClick={handleSetLink}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
              >
                {linkUrl ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ============================================================================
// Toolbar Helpers
// ============================================================================

function ToolbarDivider() {
  return <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-0.5" />;
}

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
}

function ToolbarButton({ onClick, active, disabled, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        p-1.5 rounded text-sm font-medium transition-colors
        ${active
          ? toggleButtonColors.purple.inactive
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {children}
    </button>
  );
}

function ColorIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path d="M12 2L2 22h20L12 2z" />
      <path d="M12 6v10" strokeLinecap="round" />
    </svg>
  );
}
