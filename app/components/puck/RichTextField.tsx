'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

// ============================================================================
// RichTextField - Custom Puck Field for Rich Text Editing
// ============================================================================
// Renders a button that opens the RichTextEditor in a modal for editing

// Dynamic import to avoid SSR issues with Tiptap
const RichTextEditor = dynamic(
  () => import('@/components/editor/RichTextEditor'),
  { ssr: false, loading: () => <div className="h-32 bg-gray-100 dark:bg-gray-700 animate-pulse rounded-lg" /> }
);

interface RichTextFieldProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
}

export default function RichTextField({ value, onChange, label }: RichTextFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localValue, setLocalValue] = useState(value || '');

  const handleSave = () => {
    onChange(localValue);
    setIsOpen(false);
  };

  const handleOpen = () => {
    setLocalValue(value || '');
    setIsOpen(true);
  };

  // Strip HTML for preview
  const previewText = value
    ? value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 100)
    : '';

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}

      {/* Preview Button */}
      <button
        type="button"
        onClick={handleOpen}
        className="w-full text-left p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-purple-400 dark:hover:border-purple-500 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        {previewText ? (
          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
            {previewText}...
          </p>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-4 text-gray-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span className="text-sm">Click to add content</span>
          </div>
        )}
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Edit Content
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Editor */}
            <div className="flex-1 overflow-y-auto p-6">
              <RichTextEditor
                content={localValue}
                onChange={setLocalValue}
                placeholder="Write your content here..."
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
