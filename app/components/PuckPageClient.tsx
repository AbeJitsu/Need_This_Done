'use client';

import { usePageViewTracking } from '@/hooks/usePageViewTracking';

// ============================================================================
// Puck Page Client Component
// ============================================================================
// What: Client-side wrapper for Puck pages that handles analytics tracking
// Why: Server components can't use hooks, so we need a client boundary
// How: Renders children and tracks page view on mount

interface PuckPageClientProps {
  slug: string;
  pageId?: string;
  children: React.ReactNode;
}

export function PuckPageClient({ slug, pageId, children }: PuckPageClientProps) {
  // Track the page view
  usePageViewTracking(slug, { pageId });

  return <>{children}</>;
}

export default PuckPageClient;
