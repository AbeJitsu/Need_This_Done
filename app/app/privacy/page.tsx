import { getDefaultContent } from '@/lib/default-page-content';
import type { PrivacyPageContent } from '@/lib/page-content-types';
import PrivacyPageClient from '@/components/privacy/PrivacyPageClient';

// ============================================================================
// Privacy Policy Page
// ============================================================================
// Required for Google Cloud Console production verification.
// Uses the site's color system for consistent styling and dark mode support.
//
// INLINE EDITING: This page supports inline editing for admins.
// Click the floating pencil button to open the edit sidebar,
// then click on any section to edit its content directly.

export const metadata = {
  title: 'Privacy Policy - NeedThisDone',
  description: 'How we collect, use, and protect your personal information.',
};

// ============================================================================
// Content Fetching
// ============================================================================

async function getContent(): Promise<PrivacyPageContent> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/page-content/privacy`, {
      next: { revalidate: 60 },
    });

    if (response.ok) {
      const data = await response.json();
      return data.content as PrivacyPageContent;
    }
  } catch (error) {
    console.error('Failed to fetch privacy content:', error);
  }

  return getDefaultContent('privacy') as PrivacyPageContent;
}

// ============================================================================
// Page Component
// ============================================================================

export default async function PrivacyPage() {
  const content = await getContent();

  return <PrivacyPageClient initialContent={content} />;
}
