'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useInlineEdit } from '@/context/InlineEditContext';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Color } from '@tiptap/extension-color';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';

// ============================================================================
// Inline Text Editor - Edit text exactly where it lives
// ============================================================================
// Uses data-edit-path attributes to know what to edit.
// Click element → TipTap appears at that position → type → click away = save

export default function InlineTextEditor() {
  const { isEditMode, activeEdit, saveEdit, cancelEdit } = useInlineEdit();
  const editorRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 200 });
  const [hrefValue, setHrefValue] = useState('');

  // TipTap editor - immediatelyRender: false required for SSR/Next.js
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Underline,
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'outline-none min-w-[100px] p-2',
      },
    },
  });

  // Handle save
  const handleSave = useCallback(() => {
    if (!editor || !activeEdit) return;

    const newContent = editor.getHTML();
    // Strip wrapping <p> tags for simple text
    const cleanContent = newContent
      .replace(/^<p>/, '')
      .replace(/<\/p>$/, '')
      .trim();

    // Pass href if this is a link edit
    saveEdit(cleanContent, activeEdit.hrefFieldPath ? hrefValue : undefined);
  }, [editor, activeEdit, saveEdit, hrefValue]);

  // When activeEdit changes, position the editor and set content
  useEffect(() => {
    if (!activeEdit || !editor) return;

    // Position editor at the element
    const rect = activeEdit.element.getBoundingClientRect();
    setPosition({
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
      width: Math.max(rect.width, 200),
    });

    // Hide the original element
    activeEdit.element.style.visibility = 'hidden';

    // Set content and focus
    editor.commands.setContent(activeEdit.originalContent);
    setTimeout(() => {
      editor.commands.focus('end');
    }, 10);

    // Initialize href if this is a link
    if (activeEdit.originalHref) {
      setHrefValue(activeEdit.originalHref);
    } else {
      setHrefValue('');
    }

    // Cleanup: restore element visibility
    return () => {
      activeEdit.element.style.visibility = 'visible';
    };
  }, [activeEdit, editor]);

  // Handle ESC to cancel
  useEffect(() => {
    if (!activeEdit) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        cancelEdit();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeEdit, cancelEdit]);

  // Handle click outside to save
  useEffect(() => {
    if (!activeEdit) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (editorRef.current && !editorRef.current.contains(e.target as Node)) {
        handleSave();
      }
    };

    // Add delay to prevent immediate close
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [activeEdit, handleSave]);

  // Don't render if not in edit mode or no active edit
  if (!isEditMode || !activeEdit) return null;

  // Show loading state while editor initializes
  if (!editor) {
    return (
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[10000] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl px-4 py-2">
        <span className="text-sm text-gray-500">Loading editor...</span>
      </div>
    );
  }

  return (
    <>
      {/* Editor positioned at the original element */}
      <div
        ref={editorRef}
        data-admin-ui="true"
        className="fixed z-[9999] bg-white dark:bg-gray-800 border-2 border-blue-500 rounded shadow-lg"
        style={{
          top: position.top,
          left: position.left,
          minWidth: position.width,
        }}
      >
        <EditorContent editor={editor} />
      </div>

      {/* Floating toolbar */}
      <div
        data-admin-ui="true"
        className="fixed top-4 left-1/2 -translate-x-1/2 z-[10000] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl flex items-center gap-1 px-3 py-2"
      >
        <span className="text-xs text-gray-500 dark:text-gray-400 mr-2 font-medium">
          {activeEdit.fullPath}
        </span>

        <div className="w-px h-5 bg-gray-300 dark:bg-gray-600" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Bold"
        >
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italic"
        >
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          title="Underline"
        >
          <span className="underline">U</span>
        </ToolbarButton>

        {/* Show href input for links */}
        {activeEdit.hrefFieldPath && (
          <>
            <div className="w-px h-5 bg-gray-300 dark:bg-gray-600" />
            <label className="text-xs text-gray-500 dark:text-gray-400">Link:</label>
            <input
              type="text"
              value={hrefValue}
              onChange={(e) => setHrefValue(e.target.value)}
              placeholder="/path or https://..."
              className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 w-40"
            />
          </>
        )}

        <div className="w-px h-5 bg-gray-300 dark:bg-gray-600" />

        <button
          onClick={cancelEdit}
          className="px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 font-medium"
        >
          Save
        </button>
      </div>
    </>
  );
}

// Toolbar button component
function ToolbarButton({
  children,
  onClick,
  active,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`
        w-7 h-7 flex items-center justify-center rounded text-sm font-medium
        transition-colors
        ${active
          ? 'bg-blue-500 text-white'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
        }
      `}
    >
      {children}
    </button>
  );
}
