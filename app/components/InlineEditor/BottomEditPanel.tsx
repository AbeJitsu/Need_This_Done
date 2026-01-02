'use client';

import { useState, useCallback, useEffect } from 'react';
import { useInlineEdit } from '@/context/InlineEditContext';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Color } from '@tiptap/extension-color';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import TextStyle from '@tiptap/extension-text-style';

// ============================================================================
// Bottom Edit Panel - Unified editing experience
// ============================================================================
// Slides up from bottom when content is selected
// Full-width WYSIWYG editing in one place
// Resizable panel height

interface BottomEditPanelProps {
  minHeight?: number;
  defaultHeight?: number;
  maxHeight?: number;
}

export default function BottomEditPanel({
  minHeight = 150,
  defaultHeight = 250,
  maxHeight = 500,
}: BottomEditPanelProps) {
  const {
    isEditMode,
    selectedSection,
    selectedItem,
    pageContent,
    updateField,
    selectSection,
    selectItem,
  } = useInlineEdit();

  const [panelHeight, setPanelHeight] = useState(defaultHeight);
  const [isDragging, setIsDragging] = useState(false);

  // Get the current selection (section or item)
  const selection = selectedItem || selectedSection;
  const isOpen = isEditMode && selection !== null;

  // Get current field value for editing
  const getFieldValue = (fieldName: string): string => {
    if (!selection?.content) return '';
    const value = selection.content[fieldName];
    return typeof value === 'string' ? value : '';
  };

  // TipTap editor for rich text
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
    immediatelyRender: false, // Prevent SSR hydration mismatch
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[60px] p-3',
      },
    },
  });

  // Update editor content when selection changes
  useEffect(() => {
    if (editor && selection?.content) {
      // Find the first text field to edit
      const textField = findMainTextField(selection.content);
      if (textField) {
        editor.commands.setContent(textField.value || '');
      }
    }
  }, [editor, selection]);

  // Find the main text field (description, content, etc.)
  const findMainTextField = (content: Record<string, unknown>): { key: string; value: string } | null => {
    const textFields = ['description', 'content', 'text', 'body', 'details'];
    for (const field of textFields) {
      if (typeof content[field] === 'string') {
        return { key: field, value: content[field] as string };
      }
    }
    return null;
  };

  // Handle resize drag
  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newHeight = window.innerHeight - e.clientY;
      setPanelHeight(Math.min(maxHeight, Math.max(minHeight, newHeight)));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, minHeight, maxHeight]);

  // Handle field updates
  const handleFieldChange = (fieldName: string, value: string) => {
    if (!selection) return;

    const sectionKey = selectedItem?.sectionKey || selectedSection?.sectionKey;
    if (!sectionKey) return;

    if (selectedItem) {
      // Update item field
      const fieldPath = `${selectedItem.arrayField}.${selectedItem.index}.${fieldName}`;
      updateField(sectionKey, fieldPath, value);
    } else if (selectedSection) {
      // Update section field
      updateField(sectionKey, fieldName, value);
    }
  };

  // Save and close
  const handleSave = () => {
    // Content is already being saved via updateField
    // Just close the panel
    selectSection(null);
    selectItem(null);
  };

  // Discard changes
  const handleDiscard = () => {
    selectSection(null);
    selectItem(null);
  };

  if (!isOpen) return null;

  const label = selectedItem?.label || selectedSection?.label || 'Edit Content';

  return (
    <div
      data-admin-ui="true"
      className={`
        fixed bottom-0 left-0 right-0 z-50
        bg-white dark:bg-gray-900
        border-t-2 border-blue-500
        shadow-[0_-4px_20px_rgba(0,0,0,0.15)]
        transition-transform duration-300 ease-out
        ${isOpen ? 'translate-y-0' : 'translate-y-full'}
      `}
      style={{ height: panelHeight }}
    >
      {/* Resize handle */}
      <div
        onMouseDown={handleMouseDown}
        className={`
          absolute top-0 left-0 right-0 h-2 cursor-ns-resize
          bg-gradient-to-b from-blue-500/20 to-transparent
          hover:from-blue-500/40
          ${isDragging ? 'from-blue-500/60' : ''}
        `}
      >
        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-gray-400 dark:bg-gray-600 rounded-full" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 mt-2">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Editing:</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDiscard}
            className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            Discard
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="flex h-[calc(100%-52px)] overflow-hidden">
        {/* Fields sidebar */}
        <div className="w-64 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
          <div className="space-y-4">
            {selection?.content && Object.entries(selection.content).map(([key, value]) => {
              if (typeof value !== 'string') return null;
              if (['description', 'content', 'text', 'body', 'details'].includes(key)) return null;

              return (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    {formatFieldName(key)}
                  </label>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleFieldChange(key, e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* WYSIWYG editor area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleBold().run()}
              active={editor?.isActive('bold')}
              title="Bold"
            >
              <span className="font-bold">B</span>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              active={editor?.isActive('italic')}
              title="Italic"
            >
              <span className="italic">I</span>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleUnderline().run()}
              active={editor?.isActive('underline')}
              title="Underline"
            >
              <span className="underline">U</span>
            </ToolbarButton>
            <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />
            <ToolbarButton
              onClick={() => editor?.chain().focus().setTextAlign('left').run()}
              active={editor?.isActive({ textAlign: 'left' })}
              title="Align Left"
            >
              ←
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor?.chain().focus().setTextAlign('center').run()}
              active={editor?.isActive({ textAlign: 'center' })}
              title="Align Center"
            >
              ↔
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor?.chain().focus().setTextAlign('right').run()}
              active={editor?.isActive({ textAlign: 'right' })}
              title="Align Right"
            >
              →
            </ToolbarButton>
          </div>

          {/* Editor content */}
          <div className="flex-1 overflow-y-auto p-4">
            <EditorContent
              editor={editor}
              className="min-h-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
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
        w-8 h-8 flex items-center justify-center rounded
        text-sm font-medium transition-colors
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

// Format field name for display
function formatFieldName(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
