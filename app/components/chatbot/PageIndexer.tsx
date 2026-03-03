'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import {
  extractPageContent,
  generateContentHash,
  shouldIndexPage,
  getPageType,
} from '@/lib/chatbot';
import { useIndexingOptional } from './IndexingContext';

// ============================================================================
// Page Indexer Component
// ============================================================================
// What: Indexes pages for the chatbot's knowledge base when content changes
// Why: Keeps the chatbot up-to-date without manual intervention
// How: Compares content hash against localStorage cache. Only calls API
//      when the hash changes — meaning the page was actually edited.

const HASH_CACHE_KEY = 'page-indexer-hashes';

/**
 * Read the hash cache from localStorage.
 * Returns a map of pathname → contentHash.
 */
function getHashCache(): Record<string, string> {
  try {
    const raw = localStorage.getItem(HASH_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Write a single hash entry to the cache.
 */
function setHashCache(pathname: string, hash: string) {
  try {
    const cache = getHashCache();
    cache[pathname] = hash;
    localStorage.setItem(HASH_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // localStorage might be full or unavailable — ignore
  }
}

/**
 * Invisible component that handles automatic page indexing.
 *
 * On page load:
 * 1. Checks if the page should be indexed (excludes admin, auth, etc.)
 * 2. Extracts content from the DOM and generates a hash
 * 3. Compares the hash against a localStorage cache
 * 4. If the hash matches the cache → content hasn't changed → done (no API calls)
 * 5. If the hash differs → content changed → check server, re-index if needed
 */
export default function PageIndexer() {
  const pathname = usePathname();
  const hasIndexedRef = useRef(false);
  const previousPathnameRef = useRef<string>('');

  // Get indexing context for status updates (optional - may not be in provider)
  const indexing = useIndexingOptional();

  // Reset indexing flag when pathname changes
  useEffect(() => {
    if (pathname !== previousPathnameRef.current) {
      hasIndexedRef.current = false;
      previousPathnameRef.current = pathname;
      indexing?.setStatus('unknown');
    }
  }, [pathname, indexing]);

  useEffect(() => {
    if (hasIndexedRef.current) return;

    if (!shouldIndexPage(pathname)) {
      indexing?.setStatus('not_indexed');
      return;
    }

    const indexPage = async () => {
      if (hasIndexedRef.current) return;
      hasIndexedRef.current = true;

      indexing?.setStatus('checking');

      try {
        // ==================================================================
        // Step 1: Extract content and generate hash (local, no API call)
        // ==================================================================
        const { text, title, metadata } = extractPageContent();

        if (!text || text.length < 100) {
          indexing?.setStatus('not_indexed');
          return;
        }

        const contentHash = await generateContentHash(text);

        // ==================================================================
        // Step 2: Compare hash against localStorage cache
        // ==================================================================
        // If the hash matches what we saw last time, the page hasn't changed.
        // Skip all API calls — no need to bother the server.
        const cachedHash = getHashCache()[pathname];

        if (cachedHash === contentHash) {
          indexing?.setStatus('indexed');
          return;
        }

        // ==================================================================
        // Step 3: Hash differs — check with the server
        // ==================================================================
        const checkUrl = `/api/embeddings/check?page_url=${encodeURIComponent(
          pathname
        )}&content_hash=${contentHash}`;

        const checkResponse = await fetch(checkUrl);

        if (!checkResponse.ok) {
          if (checkResponse.status === 401 || checkResponse.status === 403) {
            // Not an admin — silently skip (indexing is admin-only)
            // Still cache the hash so we don't re-check next visit
            setHashCache(pathname, contentHash);
            indexing?.setStatus('not_indexed');
            return;
          }
          indexing?.setStatus('error');
          indexing?.setErrorMessage('Failed to check indexing status');
          return;
        }

        const { indexed } = await checkResponse.json();

        if (indexed) {
          // Server already has this version — update local cache and done
          setHashCache(pathname, contentHash);
          indexing?.setStatus('indexed');
          return;
        }

        // ==================================================================
        // Step 4: Content changed and server needs re-indexing
        // ==================================================================
        indexing?.setStatus('indexing');

        const pageType = getPageType(pathname);

        const indexResponse = await fetch('/api/embeddings/index', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            page_url: pathname,
            page_title: title,
            page_type: pageType,
            content: text,
            content_hash: contentHash,
            metadata,
          }),
        });

        if (indexResponse.ok) {
          // Success — cache the hash so we don't re-index next visit
          setHashCache(pathname, contentHash);
          indexing?.setStatus('indexed');
          indexing?.setLastIndexedAt(new Date().toISOString());
        } else if (indexResponse.status === 401 || indexResponse.status === 403) {
          // Not an admin — cache hash to avoid repeated attempts
          setHashCache(pathname, contentHash);
          indexing?.setStatus('not_indexed');
        } else {
          const error = await indexResponse.json();
          console.warn(`[PageIndexer] Failed to index ${pathname}:`, error);
          indexing?.setStatus('error');
          indexing?.setErrorMessage(error.error || 'Failed to index page');
        }
      } catch (error) {
        console.error(`[PageIndexer] Error indexing ${pathname}:`, error);
        indexing?.setStatus('error');
        indexing?.setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
      }
    };

    // Wait for page to fully load before extracting content
    let cleanup: (() => void) | undefined;

    if (document.readyState === 'complete') {
      const timeoutId = setTimeout(indexPage, 5000);
      cleanup = () => clearTimeout(timeoutId);
    } else {
      const handleLoad = () => setTimeout(indexPage, 5000);
      window.addEventListener('load', handleLoad);
      cleanup = () => window.removeEventListener('load', handleLoad);
    }

    return cleanup;
  }, [pathname, indexing]);

  return null;
}
