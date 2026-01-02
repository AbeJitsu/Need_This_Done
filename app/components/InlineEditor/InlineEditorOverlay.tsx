'use client';

// ============================================================================
// InlineEditorOverlay - Renders the inline text editor when active
// ============================================================================
// What: Overlay component that shows the InlineTextEditor based on context state
// Why: Decouples the editor rendering from the context provider
// How: Listens to inlineEditorState and renders InlineTextEditor accordingly

import { useInlineEdit } from '@/context/InlineEditContext';
import InlineTextEditor from './InlineTextEditor';

export default function InlineEditorOverlay() {
  const {
    inlineEditorState,
    closeInlineEditor,
    toggleInlineEditorMode,
    updateInlineEditorContent,
    updateField,
  } = useInlineEdit();

  // Don't render anything if editor is not open
  if (!inlineEditorState?.isOpen) {
    return null;
  }

  const handleChange = (html: string) => {
    updateInlineEditorContent(html);
  };

  const handleSave = () => {
    // Update the field with the new content
    updateField(
      inlineEditorState.sectionKey,
      inlineEditorState.fieldPath,
      inlineEditorState.content
    );
    closeInlineEditor();
  };

  const handleCancel = () => {
    // Just close without saving
    closeInlineEditor();
  };

  return (
    <InlineTextEditor
      content={inlineEditorState.content}
      onChange={handleChange}
      onSave={handleSave}
      onCancel={handleCancel}
      position={inlineEditorState.position}
      isRichMode={inlineEditorState.isRichMode}
      onToggleMode={toggleInlineEditorMode}
      singleLine={inlineEditorState.singleLine}
      placeholder="Type here..."
    />
  );
}
