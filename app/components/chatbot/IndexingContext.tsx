'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// ============================================================================
// Indexing Context
// ============================================================================
// What: Shares page indexing state across chatbot components
// Why: Enables debug visibility into whether pages are indexed
// How: React context with state for indexing status

export type IndexingStatus = 'unknown' | 'checking' | 'indexed' | 'indexing' | 'not_indexed' | 'error';

interface IndexingContextValue {
  status: IndexingStatus;
  setStatus: (status: IndexingStatus) => void;
  errorMessage: string | null;
  setErrorMessage: (message: string | null) => void;
  lastIndexedAt: string | null;
  setLastIndexedAt: (date: string | null) => void;
  forceReindex: () => Promise<void>;
  isDevMode: boolean;
}

const IndexingContext = createContext<IndexingContextValue | null>(null);

/**
 * Provider for indexing state.
 * Wrap your chatbot components with this to enable debug features.
 */
export function IndexingProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<IndexingStatus>('unknown');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastIndexedAt, setLastIndexedAt] = useState<string | null>(null);

  // Check if we're in development mode
  const isDevMode = process.env.NODE_ENV === 'development';

  // Force re-index the current page
  const forceReindex = useCallback(async () => {
    if (typeof window === 'undefined') return;

    setStatus('indexing');
    setErrorMessage(null);

    try {
      // Get page content (simplified extraction)
      const mainContent = document.querySelector('main') || document.body;
      const text = mainContent.textContent || '';
      const title = document.title;
      const pathname = window.location.pathname;

      // Generate a simple hash
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const contentHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      // Call the index API
      const response = await fetch('/api/embeddings/index', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_url: pathname,
          page_title: title,
          page_type: 'static',
          content: text,
          content_hash: contentHash,
        }),
      });

      if (response.ok) {
        setStatus('indexed');
        setLastIndexedAt(new Date().toISOString());
      } else {
        const error = await response.json();
        setStatus('error');
        setErrorMessage(error.error || 'Failed to index page');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
    }
  }, []);

  return (
    <IndexingContext.Provider
      value={{
        status,
        setStatus,
        errorMessage,
        setErrorMessage,
        lastIndexedAt,
        setLastIndexedAt,
        forceReindex,
        isDevMode,
      }}
    >
      {children}
    </IndexingContext.Provider>
  );
}

/**
 * Hook to access indexing state.
 * Must be used within an IndexingProvider.
 */
export function useIndexing() {
  const context = useContext(IndexingContext);
  if (!context) {
    throw new Error('useIndexing must be used within an IndexingProvider');
  }
  return context;
}

/**
 * Optional hook that returns null if not in a provider.
 * Use this for components that might be rendered outside the provider.
 */
export function useIndexingOptional() {
  return useContext(IndexingContext);
}
