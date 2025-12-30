import { getDefaultContent } from '@/lib/default-page-content';
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
};

// ============================================================================
// Content Fetching
// ============================================================================

async function getContent(): Promise<TermsPageContent> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/page-content/terms`, {
      next: { revalidate: 60 },
    });

    if (response.ok) {
      const data = await response.json();
      return data.content as TermsPageContent;
    }
  } catch (error) {
    console.error('Failed to fetch terms content:', error);
  }

  return getDefaultContent('terms') as TermsPageContent;
}

// ============================================================================
// Page Component
// ============================================================================

export default async function TermsPage() {
  const content = await getContent();

  return <TermsPageClient initialContent={content} />;
}
