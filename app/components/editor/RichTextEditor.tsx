'use client';

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { useState, useCallback, useEffect } from 'react';
import MediaLibrary from '@/components/media/MediaLibrary';
import { MediaItem } from '@/lib/media-types';
import { uiChromeBg, toggleButtonColors, hoverBgColors, cardBgColors } from '@/lib/colors';
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  StrikeIcon,
  BulletListIcon,
  OrderedListIcon,
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
  QuoteIcon,
  CodeIcon,
  LinkIcon,
  ImageIcon,
  UndoIcon,
  RedoIcon,
} from './EditorIcons';

// ============================================================================
// RichTextEditor - Full-Featured WYSIWYG Editor
// ============================================================================
// A Tiptap-based rich text editor with formatting toolbar and media integration

interface RichTextEditorProps {
  content?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
}

export default function RichTextEditor({
  content = '',
  onChange,
  placeholder = 'Start writing...',
  className = '',
  editable = true,
}: RichTextEditorProps) {
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  // ============================================================================
  // Editor Setup
  // ============================================================================

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-purple-600 dark:text-purple-400 underline hover:text-purple-800 dark:hover:text-purple-300',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
    ],
    content,
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  // Sync content when it changes externally
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

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
  // Render
  // ============================================================================

  if (!editor) return null;

  return (
    <div className={`border border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden ${cardBgColors.base} ${className}`}>
      {/* ====================================================================
          Toolbar
          ==================================================================== */}
      {editable && (
        <Toolbar
          editor={editor}
          onMediaClick={() => setIsMediaOpen(true)}
          onLinkClick={openLinkModal}
        />
      )}

      {/* ====================================================================
          Editor Content
          ==================================================================== */}
      <EditorContent
        editor={editor}
        className="prose prose-sm sm:prose dark:prose-invert max-w-none p-4 min-h-[200px] focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[180px] [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-gray-400 [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0"
      />

      {/* ====================================================================
          Media Library Modal
          ==================================================================== */}
      <MediaLibrary
        isOpen={isMediaOpen}
        onClose={() => setIsMediaOpen(false)}
        onSelect={handleMediaSelect}
        title="Insert Image"
      />

      {/* ====================================================================
          Link Modal
          ==================================================================== */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsLinkModalOpen(false)} />
          <div className={`relative ${cardBgColors.base} rounded-xl shadow-xl p-6 w-full max-w-md`}>
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
    </div>
  );
}

// ============================================================================
// Toolbar Component
// ============================================================================

interface ToolbarProps {
  editor: Editor;
  onMediaClick: () => void;
  onLinkClick: () => void;
}

function Toolbar({ editor, onMediaClick, onLinkClick }: ToolbarProps) {
  return (
    <div className={`flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-700 ${uiChromeBg.toolbar}`}>
      {/* Text Formatting */}
      <ToolbarGroup>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Bold (Ctrl+B)"
        >
          <BoldIcon />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italic (Ctrl+I)"
        >
          <ItalicIcon />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          title="Strikethrough"
        >
          <StrikeIcon />
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarDivider />

      {/* Headings */}
      <ToolbarGroup>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          H1
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          H3
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarDivider />

      {/* Lists */}
      <ToolbarGroup>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <BulletListIcon />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Numbered List"
        >
          <OrderedListIcon />
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarDivider />

      {/* Text Alignment */}
      <ToolbarGroup>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          active={editor.isActive({ textAlign: 'left' })}
          title="Align Left"
        >
          <AlignLeftIcon />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          active={editor.isActive({ textAlign: 'center' })}
          title="Align Center"
        >
          <AlignCenterIcon />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          active={editor.isActive({ textAlign: 'right' })}
          title="Align Right"
        >
          <AlignRightIcon />
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarDivider />

      {/* Block Elements */}
      <ToolbarGroup>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="Quote"
        >
          <QuoteIcon />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive('codeBlock')}
          title="Code Block"
        >
          <CodeIcon />
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarDivider />

      {/* Links & Media */}
      <ToolbarGroup>
        <ToolbarButton
          onClick={onLinkClick}
          active={editor.isActive('link')}
          title="Add Link"
        >
          <LinkIcon />
        </ToolbarButton>
        <ToolbarButton
          onClick={onMediaClick}
          title="Insert Image"
        >
          <ImageIcon />
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarDivider />

      {/* Undo/Redo */}
      <ToolbarGroup>
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
        >
          <UndoIcon />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Shift+Z)"
        >
          <RedoIcon />
        </ToolbarButton>
      </ToolbarGroup>
    </div>
  );
}

// ============================================================================
// Toolbar Helpers
// ============================================================================

function ToolbarGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center">{children}</div>;
}

function ToolbarDivider() {
  return <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />;
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
        p-2 rounded-lg text-sm font-medium transition-colors
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

