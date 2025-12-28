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
    <div className={`border border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden bg-white dark:bg-gray-800 ${className}`}>
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
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md">
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
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
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
          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {children}
    </button>
  );
}

// ============================================================================
// Icons
// ============================================================================

function BoldIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
      <path d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
    </svg>
  );
}

function ItalicIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <line x1="19" y1="4" x2="10" y2="4" />
      <line x1="14" y1="20" x2="5" y2="20" />
      <line x1="15" y1="4" x2="9" y2="20" />
    </svg>
  );
}

function UnderlineIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path d="M6 3v7a6 6 0 006 6 6 6 0 006-6V3" />
      <line x1="4" y1="21" x2="20" y2="21" />
    </svg>
  );
}

function StrikeIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <line x1="4" y1="12" x2="20" y2="12" />
      <path d="M17.5 7.5c0-2.5-2-4-5-4-2.5 0-5 1-5 4 0 2 1 3 4 4" />
      <path d="M12 12c3 1 5 2 5 4.5 0 2-2 4-5 4-2.5 0-5-1.5-5-4" />
    </svg>
  );
}

function BulletListIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <line x1="9" y1="6" x2="20" y2="6" />
      <line x1="9" y1="12" x2="20" y2="12" />
      <line x1="9" y1="18" x2="20" y2="18" />
      <circle cx="5" cy="6" r="1" fill="currentColor" />
      <circle cx="5" cy="12" r="1" fill="currentColor" />
      <circle cx="5" cy="18" r="1" fill="currentColor" />
    </svg>
  );
}

function OrderedListIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <line x1="10" y1="6" x2="21" y2="6" />
      <line x1="10" y1="12" x2="21" y2="12" />
      <line x1="10" y1="18" x2="21" y2="18" />
      <text x="4" y="8" fontSize="8" fill="currentColor">1</text>
      <text x="4" y="14" fontSize="8" fill="currentColor">2</text>
      <text x="4" y="20" fontSize="8" fill="currentColor">3</text>
    </svg>
  );
}

function AlignLeftIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="15" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function AlignCenterIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="6" y1="12" x2="18" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function AlignRightIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="9" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function QuoteIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <polyline points="16,18 22,12 16,6" />
      <polyline points="8,6 2,12 8,18" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21,15 16,10 5,21" />
    </svg>
  );
}

function UndoIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <polyline points="1,4 1,10 7,10" />
      <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
    </svg>
  );
}

function RedoIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <polyline points="23,4 23,10 17,10" />
      <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
    </svg>
  );
}
