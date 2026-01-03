'use client';

import { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import {
  MediaItem,
  MEDIA_VALIDATION,
  isValidMediaType,
  isValidMediaSize,
  formatFileSize,
} from '@/lib/media-types';
import { toggleButtonColors, softBgColors, cardBgColors } from '@/lib/colors';

// ============================================================================
// ImageUpload Component - Drag & Drop File Upload
// ============================================================================
// A beautiful, accessible drag-and-drop upload zone with progress indication

interface ImageUploadProps {
  onUpload: (media: MediaItem) => void;
  onError?: (error: string) => void;
  folder?: string;
  multiple?: boolean;
  maxFiles?: number;
  className?: string;
  compact?: boolean;
}

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  media?: MediaItem;
}

export default function ImageUpload({
  onUpload,
  onError,
  folder = 'general',
  multiple = false,
  maxFiles = 10,
  className = '',
  compact = false,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ============================================================================
  // File Validation
  // ============================================================================

  const validateFile = useCallback((file: File): string | null => {
    if (!isValidMediaType(file.type)) {
      return `Invalid file type: ${file.type}. Allowed: images only.`;
    }
    if (!isValidMediaSize(file.size)) {
      return `File too large: ${formatFileSize(file.size)}. Max: ${formatFileSize(MEDIA_VALIDATION.MAX_SIZE)}`;
    }
    return null;
  }, []);

  // ============================================================================
  // Upload Logic
  // ============================================================================

  const uploadFile = useCallback(async (uploadingFile: UploadingFile) => {
    const formData = new FormData();
    formData.append('file', uploadingFile.file);
    formData.append('folder', folder);

    try {
      setUploadingFiles(prev =>
        prev.map(f =>
          f.id === uploadingFile.id ? { ...f, status: 'uploading', progress: 10 } : f
        )
      );

      const response = await fetch('/api/media', {
        method: 'POST',
        body: formData,
      });

      // Simulate progress
      setUploadingFiles(prev =>
        prev.map(f =>
          f.id === uploadingFile.id ? { ...f, progress: 50 } : f
        )
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setUploadingFiles(prev =>
        prev.map(f =>
          f.id === uploadingFile.id
            ? { ...f, status: 'success', progress: 100, media: data.media }
            : f
        )
      );

      onUpload(data.media);

      // Remove from list after a delay
      setTimeout(() => {
        setUploadingFiles(prev => prev.filter(f => f.id !== uploadingFile.id));
      }, 2000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadingFiles(prev =>
        prev.map(f =>
          f.id === uploadingFile.id ? { ...f, status: 'error', error: errorMessage } : f
        )
      );
      onError?.(errorMessage);
    }
  }, [folder, onUpload, onError]);

  const handleFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files).slice(0, maxFiles);
    const newUploadingFiles: UploadingFile[] = [];

    for (const file of fileArray) {
      const validationError = validateFile(file);
      if (validationError) {
        onError?.(validationError);
        continue;
      }

      const uploadingFile: UploadingFile = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        file,
        progress: 0,
        status: 'pending',
      };
      newUploadingFiles.push(uploadingFile);
    }

    if (newUploadingFiles.length === 0) return;

    setUploadingFiles(prev => [...prev, ...newUploadingFiles]);

    // Start uploads
    for (const uploadingFile of newUploadingFiles) {
      uploadFile(uploadingFile);
    }
  }, [maxFiles, validateFile, uploadFile, onError]);

  // ============================================================================
  // Drag & Drop Handlers
  // ============================================================================

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set to false if we're leaving the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
    // Reset input so the same file can be selected again
    e.target.value = '';
  }, [handleFiles]);

  // ============================================================================
  // Render
  // ============================================================================

  if (compact) {
    return (
      <div className={className}>
        <input
          ref={fileInputRef}
          type="file"
          accept={MEDIA_VALIDATION.ALLOWED_TYPES.join(',')}
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={handleClick}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium ${toggleButtonColors.purple.inactive} ${toggleButtonColors.purple.inactiveHover} rounded-lg transition-colors`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Upload Image
        </button>

        {/* Compact progress indicator */}
        {uploadingFiles.length > 0 && (
          <div className="mt-2 space-y-1">
            {uploadingFiles.map(f => (
              <div key={f.id} className="flex items-center gap-2 text-xs">
                {f.status === 'uploading' && (
                  <svg className="w-3 h-3 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                {f.status === 'success' && (
                  <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {f.status === 'error' && (
                  <svg className="w-3 h-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                <span className="truncate text-gray-600 dark:text-gray-400">{f.file.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept={MEDIA_VALIDATION.ALLOWED_TYPES.join(',')}
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Drop Zone */}
      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`
          relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200
          ${isDragging
            ? `border-purple-500 ${softBgColors.purple}`
            : 'border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-gray-100 dark:hover:bg-gray-800'
          }
        `}
      >
        <div className="flex flex-col items-center justify-center py-10 px-6">
          <div className={`
            w-14 h-14 mb-4 rounded-xl flex items-center justify-center transition-colors
            ${isDragging
              ? softBgColors.purple
              : 'bg-gray-100 dark:bg-gray-700'
            }
          `}>
            <svg
              className={`w-7 h-7 ${isDragging ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400 dark:text-gray-500'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>

          <p className="text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
            {isDragging ? 'Drop images here' : 'Drag & drop images'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            or click to browse
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            PNG, JPG, GIF, WebP, SVG up to {formatFileSize(MEDIA_VALIDATION.MAX_SIZE)}
          </p>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadingFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          {uploadingFiles.map(f => (
            <div
              key={f.id}
              className={`flex items-center gap-3 p-3 ${cardBgColors.elevated} rounded-lg`}
            >
              {/* Thumbnail or icon */}
              <div className="relative w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                {f.media?.url ? (
                  <Image src={f.media.url} alt="" fill className="object-cover" unoptimized />
                ) : (
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>

              {/* File info and progress */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                  {f.file.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        f.status === 'error'
                          ? 'bg-red-500'
                          : f.status === 'success'
                          ? 'bg-green-500'
                          : 'bg-purple-500'
                      }`}
                      style={{ width: `${f.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-12 text-right">
                    {f.status === 'error' ? 'Error' : f.status === 'success' ? 'Done' : `${f.progress}%`}
                  </span>
                </div>
                {f.error && (
                  <p className="text-xs text-red-500 mt-1">{f.error}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
