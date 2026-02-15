import { fetchPageContent } from '@/lib/fetch-page-content';
import type { TermsPageContent } from '@/lib/page-content-types';
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
  description: 'The agreement between you and NeedThisDone when using our services.',
  alternates: { canonical: '/terms' },
};

// ============================================================================
// Page Component
// ============================================================================

export default async function TermsPage() {
  const content = await fetchPageContent<TermsPageContent>('terms');

  return <TermsPageClient initialContent={content} />;
}
