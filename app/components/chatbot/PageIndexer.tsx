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
// What: Automatically indexes pages for the chatbot's knowledge base
// Why: Keeps the chatbot up-to-date without manual intervention
// How: Runs on page load, checks if indexing needed, triggers if so

/**
 * Invisible component that handles automatic page indexing.
 *
 * On every page load:
 * 1. Checks if the page should be indexed (excludes admin, auth, etc.)
 * 2. Extracts content from the DOM
 * 3. Generates a hash of the content
 * 4. Checks if already indexed with this hash
 * 5. If not indexed (or content changed), triggers indexing
 *
 * Also updates the IndexingContext (if available) with the current status
 * for the debug indicator.
 *
 * Add to layout.tsx to enable site-wide automatic indexing:
 * ```tsx
 * import PageIndexer from '@/components/chatbot/PageIndexer';
 *
 * // In your layout:
 * <PageIndexer />
 * ```
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
      // Reset status when navigating to a new page
      indexing?.setStatus('unknown');
    }
  }, [pathname, indexing]);

  useEffect(() => {
    // Skip if already indexed this page load
    if (hasIndexedRef.current) return;

    // Skip pages that shouldn't be indexed
    if (!shouldIndexPage(pathname)) {
      indexing?.setStatus('not_indexed');
      return;
    }

    // Wait for page to fully load before extracting content
    const indexPage = async () => {
      // Prevent multiple indexing attempts
      if (hasIndexedRef.current) return;
      hasIndexedRef.current = true;

      indexing?.setStatus('checking');

      try {
        // ====================================================================
        // Step 1: Extract content from the page
        // ====================================================================
        const { text, title, metadata } = extractPageContent();

        // Skip if not enough content
        if (!text || text.length < 100) {
          console.debug(`[PageIndexer] Skipping ${pathname}: not enough content (${text.length} chars)`);
          indexing?.setStatus('not_indexed');
          indexing?.setErrorMessage('Not enough content to index');
          return;
        }

        console.debug(`[PageIndexer] Extracted ${text.length} characters from ${pathname}`);

        // ====================================================================
        // Step 2: Generate content hash
        // ====================================================================
        const contentHash = await generateContentHash(text);

        // ====================================================================
        // Step 3: Check if already indexed with this hash
        // ====================================================================
        const checkUrl = `/api/embeddings/check?page_url=${encodeURIComponent(
          pathname
        )}&content_hash=${contentHash}`;

        const checkResponse = await fetch(checkUrl);

        if (!checkResponse.ok) {
          console.warn(`[PageIndexer] Failed to check indexing status for ${pathname}`);
          indexing?.setStatus('error');
          indexing?.setErrorMessage('Failed to check indexing status');
          return;
        }

        const { indexed } = await checkResponse.json();

        // Skip if already indexed with same content
        if (indexed) {
          console.debug(`[PageIndexer] ${pathname} already indexed (hash matches)`);
          indexing?.setStatus('indexed');
          return;
        }

        // ====================================================================
        // Step 4: Index the page
        // ====================================================================
        console.debug(`[PageIndexer] Indexing ${pathname}...`);
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
          const result = await indexResponse.json();
          console.debug(
            `[PageIndexer] Successfully indexed ${pathname}: ${result.chunks_indexed} chunk(s)`
          );
          indexing?.setStatus('indexed');
          indexing?.setLastIndexedAt(new Date().toISOString());
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

    // ========================================================================
    // Wait for page to be fully loaded before indexing
    // ========================================================================
    // This ensures all dynamic content is rendered
    let cleanup: (() => void) | undefined;

    if (document.readyState === 'complete') {
      // Wait for dynamic content to load (e.g., Medusa API calls, async data fetching)
      // Pages like /pricing fetch products via useEffect, so we need sufficient time
      // for the API call to complete AND React to re-render the content
      const timeoutId = setTimeout(indexPage, 3000);
      cleanup = () => clearTimeout(timeoutId);
    } else {
      // Wait for load event
      const handleLoad = () => {
        setTimeout(indexPage, 3000);
      };
      window.addEventListener('load', handleLoad);
      cleanup = () => window.removeEventListener('load', handleLoad);
    }

    return cleanup;
  }, [pathname, indexing]);

  // This component doesn't render anything
  return null;
}
