'use client';

import { useEffect } from 'react';
import { useInlineEdit } from '@/context/InlineEditContext';

// ============================================================================
// Puck Page Wrapper - Sets page context for inline editing
// ============================================================================
// What: Wrapper that sets the current page slug in InlineEditContext
// Why: AdminEditBar needs to know which page is being viewed to enable editing
// How: Sets pageSlug and pageData in context on mount, clears on unmount

interface PuckPageWrapperProps {
  slug: string;
  pageData: Record<string, unknown>;
  children: React.ReactNode;
}

export default function PuckPageWrapper({ slug, pageData, children }: PuckPageWrapperProps) {
  const { setPageSlug, setPageData } = useInlineEdit();

  useEffect(() => {
    // Set the page context when this page mounts
    setPageSlug(slug);
    setPageData(pageData);

    // Clear when unmounting (navigating away)
    return () => {
      setPageSlug(null);
      setPageData(null);
    };
  }, [slug, pageData, setPageSlug, setPageData]);

  return <>{children}</>;
}
