'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { MediaItem, MediaListResponse, MEDIA_FOLDERS, formatFileSize } from '@/lib/media-types';
import ImageUpload from './ImageUpload';
import { alertColors } from '@/lib/colors';

// ============================================================================
// MediaLibrary Component - Image Browser & Picker Modal
// ============================================================================
// A full-featured media library for browsing, uploading, and selecting images

interface MediaLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: MediaItem | MediaItem[]) => void;
  multiple?: boolean;
  folder?: string;
  title?: string;
}

export default function MediaLibrary({
  isOpen,
  onClose,
  onSelect,
  multiple = false,
  folder: initialFolder,
  title = 'Media Library',
}: MediaLibraryProps) {
  // ============================================================================
  // State
  // ============================================================================

  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [folder, setFolder] = useState(initialFolder || 'all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [showUpload, setShowUpload] = useState(false);

  // ============================================================================
  // Data Fetching
  // ============================================================================

  const fetchMedia = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (folder !== 'all') params.set('folder', folder);
      if (search) params.set('search', search);
      params.set('page', reset ? '1' : String(page));
      params.set('pageSize', '24');

      const response = await fetch(`/api/media?${params}`);
      const data: MediaListResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.media ? 'Failed to fetch' : 'Failed to fetch media');
      }

      setMedia(prev => reset ? data.media : [...prev, ...data.media]);
      setHasMore(data.hasMore);
      setTotal(data.total);
      if (reset) setPage(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load media');
    } finally {
      setLoading(false);
    }
  }, [folder, search, page]);

  // Initial fetch and refetch on filter changes
  useEffect(() => {
    if (isOpen) {
      fetchMedia(true);
      setSelectedIds(new Set());
    }
  }, [isOpen, folder, search, fetchMedia]);

  // Load more
  useEffect(() => {
    if (page > 1 && isOpen) {
      fetchMedia(false);
    }
  }, [page, isOpen, fetchMedia]);

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleSelect = useCallback((item: MediaItem) => {
    if (multiple) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        if (next.has(item.id)) {
          next.delete(item.id);
        } else {
          next.add(item.id);
        }
        return next;
      });
    } else {
      setSelectedIds(new Set([item.id]));
    }
  }, [multiple]);

  const handleConfirm = useCallback(() => {
    const selected = media.filter(m => selectedIds.has(m.id));
    if (selected.length === 0) return;

    if (multiple) {
      onSelect(selected);
    } else {
      onSelect(selected[0]);
    }
    onClose();
  }, [media, selectedIds, multiple, onSelect, onClose]);

  const handleUpload = useCallback((newMedia: MediaItem) => {
    setMedia(prev => [newMedia, ...prev]);
    setTotal(prev => prev + 1);
    if (!multiple) {
      setSelectedIds(new Set([newMedia.id]));
    }
  }, [multiple]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Delete this image? This cannot be undone.')) return;

    try {
      const response = await fetch(`/api/media/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');

      setMedia(prev => prev.filter(m => m.id !== id));
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setTotal(prev => prev - 1);
    } catch (err) {
      alert('Failed to delete image');
    }
  }, []);

  // ============================================================================
  // Render
  // ============================================================================

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* ================================================================
            Header
            ================================================================ */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ================================================================
            Toolbar
            ================================================================ */}
        <div className="flex flex-wrap items-center gap-3 px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search images..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Folder Filter */}
          <select
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Folders</option>
            {MEDIA_FOLDERS.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>

          {/* Upload Toggle */}
          <button
            onClick={() => setShowUpload(!showUpload)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              showUpload
                ? 'bg-purple-600 text-white'
                : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Upload
          </button>
        </div>

        {/* ================================================================
            Upload Zone (collapsible)
            ================================================================ */}
        {showUpload && (
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <ImageUpload
              folder={folder === 'all' ? 'general' : folder}
              onUpload={handleUpload}
              onError={(err) => setError(err)}
              multiple
            />
          </div>
        )}

        {/* ================================================================
            Media Grid
            ================================================================ */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className={`mb-4 p-4 ${alertColors.error.bg} ${alertColors.error.border} ${alertColors.error.text} rounded-lg`}>
              {error}
            </div>
          )}

          {loading && media.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
            </div>
          ) : media.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-500 dark:text-gray-400 mb-2">No images found</p>
              <button
                onClick={() => setShowUpload(true)}
                className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
              >
                Upload your first image
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {media.map((item) => {
                  const isSelected = selectedIds.has(item.id);
                  return (
                    <div
                      key={item.id}
                      className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer"
                      onClick={() => handleSelect(item)}
                    >
                      {/* Image */}
                      {item.url && (
                        <Image
                          src={item.url}
                          alt={item.alt_text || item.filename}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                          unoptimized
                        />
                      )}

                      {/* Selection overlay */}
                      <div className={`absolute inset-0 transition-all ${
                        isSelected
                          ? 'bg-purple-600/30 ring-2 ring-purple-500 ring-inset'
                          : 'bg-black/0 group-hover:bg-black/20'
                      }`}>
                        {/* Checkbox */}
                        <div className={`absolute top-2 left-2 w-5 h-5 rounded flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-purple-600 text-white'
                            : 'bg-white/80 text-transparent group-hover:text-gray-400'
                        }`}>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>

                        {/* Delete button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id);
                          }}
                          className="absolute top-2 right-2 p-1 rounded bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      {/* Info on hover */}
                      <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-xs text-white truncate">{item.original_filename}</p>
                        <p className="text-xs text-white/70">{formatFileSize(item.size_bytes)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Load More */}
              {hasMore && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={loading}
                    className="px-6 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Loading...' : `Load More (${total - media.length} remaining)`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* ================================================================
            Footer
            ================================================================ */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {selectedIds.size > 0
              ? `${selectedIds.size} selected`
              : `${total} image${total !== 1 ? 's' : ''}`
            }
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedIds.size === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {multiple ? `Select (${selectedIds.size})` : 'Select'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
