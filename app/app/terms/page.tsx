import type { TermsPageContent } from '@/lib/page-content-types';
import { defaultTermsContent } from '@/lib/default-page-content';
import TermsPageClient from '@/components/terms/TermsPageClient';

// ============================================================================
// Terms of Service Page
// ============================================================================
// Required for Google Cloud Console production verification.
// Uses the site's color system for consistent styling and dark mode support.
//
// INLINE EDITING: This page supports inline editing for admins.
// Click the floating pencil button to open the edit sidebar,
// then click on any section to edit its content directly.

export const metadata = {
  title: 'Terms of Service - NeedThisDone',
  description: 'Terms for project requests, the $500 targeted fix, and proposal-based automation system setup.',
  alternates: { canonical: '/terms' },
  openGraph: {
    title: 'Terms of Service - NeedThisDone',
    description: 'Terms for project requests, the $500 targeted fix, and proposal-based automation system setup.',
    type: 'website',
  },
};

// ============================================================================
// Page Component
// ============================================================================

export default function TermsPage() {
  const content = defaultTermsContent as TermsPageContent;

  return <TermsPageClient initialContent={content} />;
}
