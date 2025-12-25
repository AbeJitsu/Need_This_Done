'use client';

import { useState } from 'react';
import MediaLibrary from '@/components/media/MediaLibrary';
import { MediaItem } from '@/lib/media-types';

// ============================================================================
// ImageField - Custom Puck Field for Image Selection
// ============================================================================
// Renders a button that opens the MediaLibrary modal for image selection

interface ImageFieldProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
}

export default function ImageField({ value, onChange, label }: ImageFieldProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (media: MediaItem | MediaItem[]) => {
    const selected = Array.isArray(media) ? media[0] : media;
    if (selected?.url) {
      onChange(selected.url);
    }
  };

  const handleClear = () => {
    onChange('');
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}

      {value ? (
        <div className="relative group">
          <img
            src={value}
            alt="Selected image"
            className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
          />
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="px-3 py-1.5 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg"
            >
              Change
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-full h-32 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-purple-400 dark:hover:border-purple-500 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        >
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Click to select image
          </span>
        </button>
      )}

      <MediaLibrary
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSelect={handleSelect}
        title="Select Image"
      />
    </div>
  );
}
