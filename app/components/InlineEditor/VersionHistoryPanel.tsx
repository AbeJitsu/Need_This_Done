'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  formInputColors,
  headingColors,
  cardBgColors,
  cardBorderColors,
  getSolidButtonColors,
  accentColors,
} from '@/lib/colors';

// ============================================================================
// Version History Panel - View and restore previous versions
// ============================================================================
// What: Modal panel showing previous versions of page content
// Why: Allows clients to see what changed and restore previous versions
// How: Fetches from /api/page-content/[slug]/history, restores via /restore

interface VersionHistoryVersion {
  id: string;
  created_at: string;
  version_note: string | null;
  summary: string;
}

interface VersionHistoryPanelProps {
  pageSlug: string;
  isOpen: boolean;
  onClose: () => void;
  onRestore: () => void; // Called after successful restore to refresh content
}

export default function VersionHistoryPanel({
  pageSlug,
  isOpen,
  onClose,
  onRestore,
}: VersionHistoryPanelProps) {
  const [versions, setVersions] = useState<VersionHistoryVersion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  // Fetch version history
  const fetchHistory = useCallback(async () => {
    if (!pageSlug) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/page-content/${pageSlug}/history`);
      if (!response.ok) {
        throw new Error('Failed to fetch version history');
      }
      const data = await response.json();
      setVersions(data.versions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setIsLoading(false);
    }
  }, [pageSlug]);

  // Fetch on open
  useEffect(() => {
    if (isOpen && pageSlug) {
      fetchHistory();
    }
  }, [isOpen, pageSlug, fetchHistory]);

  // Handle restore
  const handleRestore = async (versionId: string) => {
    if (!confirm('Restore this version? Your current content will be saved to history first.')) {
      return;
    }

    setRestoringId(versionId);
    setError(null);

    try {
      const response = await fetch(`/api/page-content/${pageSlug}/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ versionId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to restore version');
      }

      // Success - refresh page to show restored content
      onRestore();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restore');
    } finally {
      setRestoringId(null);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    // Relative time for recent versions
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;

    // Absolute date for older versions
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={`
          relative w-full max-w-lg max-h-[80vh] mx-4
          ${cardBgColors.base} ${cardBorderColors.light}
          border rounded-xl shadow-2xl
          flex flex-col
          animate-in fade-in zoom-in-95 duration-200
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-title"
      >
        {/* Header */}
        <div className="flex-shrink-0 border-b border-gray-400 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2
                id="history-title"
                className={`text-lg font-semibold ${headingColors.primary}`}
              >
                Version History
              </h2>
              <p className={`text-sm ${formInputColors.helper} mt-0.5`}>
                {pageSlug === 'home' ? 'Homepage' : pageSlug.replace(/-/g, ' ')}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close version history"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <button
                type="button"
                onClick={fetchHistory}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium
                  ${getSolidButtonColors('blue').bg} ${getSolidButtonColors('blue').hover} ${getSolidButtonColors('blue').text}
                `}
              >
                Try Again
              </button>
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-4">
                <svg
                  className="w-12 h-12 mx-auto text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className={`text-lg font-medium ${headingColors.secondary}`}>
                No previous versions yet
              </p>
              <p className={`text-sm ${formInputColors.helper} mt-2`}>
                Versions are saved automatically when you save changes.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {versions.map((version, index) => (
                <div
                  key={version.id}
                  className={`
                    relative p-4 rounded-lg
                    border border-gray-400 dark:border-gray-700
                    hover:border-blue-300 dark:hover:border-blue-600
                    transition-colors group
                  `}
                >
                  {/* Version indicator */}
                  {index === 0 && (
                    <span className={`
                      absolute -top-2 left-3 px-2 py-0.5 text-xs font-medium rounded
                      ${accentColors.blue.bg} ${accentColors.blue.text}
                    `}>
                      Most Recent
                    </span>
                  )}

                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {/* Time */}
                      <p className={`text-sm font-medium ${headingColors.secondary}`}>
                        {formatDate(version.created_at)}
                      </p>

                      {/* Note */}
                      {version.version_note && (
                        <p className={`text-xs ${formInputColors.helper} mt-1`}>
                          {version.version_note}
                        </p>
                      )}

                      {/* Summary */}
                      <p className={`text-xs ${formInputColors.helper} mt-1 truncate`}>
                        {version.summary}
                      </p>
                    </div>

                    {/* Restore button */}
                    <button
                      type="button"
                      onClick={() => handleRestore(version.id)}
                      disabled={restoringId !== null}
                      className={`
                        ml-4 px-3 py-1.5 rounded-md text-sm font-medium
                        ${getSolidButtonColors('blue').bg} ${getSolidButtonColors('blue').hover} ${getSolidButtonColors('blue').text}
                        disabled:opacity-50 disabled:cursor-not-allowed
                        transition-all
                        opacity-0 group-hover:opacity-100 focus:opacity-100
                      `}
                    >
                      {restoringId === version.id ? (
                        <span className="flex items-center gap-1">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Restoring...
                        </span>
                      ) : (
                        'Restore'
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-gray-400 dark:border-gray-700 px-6 py-4">
          <p className={`text-xs ${formInputColors.helper} text-center`}>
            Up to 20 versions are kept. Older versions are automatically removed.
          </p>
        </div>
      </div>
    </div>
  );
}
