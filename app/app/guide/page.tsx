import { getDefaultContent } from '@/lib/default-page-content';
import type { GuidePageContent } from '@/lib/page-content-types';
import GuidePageClient from '@/components/guide/GuidePageClient';

// ============================================================================
// User Guide Page - Getting Started Information
// ============================================================================
// All content is loaded from JSON and is fully editable via the inline editor.
//
// INLINE EDITING: This page supports inline editing for admins.
// Click the floating pencil button to open the edit sidebar,
// then click on any section to edit its content directly.

export const metadata = {
  title: 'User Guide - NeedThisDone',
  description:
    'Learn how to browse services, book consultations, and get the most out of NeedThisDone.',
};

// ============================================================================
// Content Fetching
// ============================================================================

async function getContent(): Promise<GuidePageContent> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/page-content/guide`, {
      next: { revalidate: 60 },
    });

    if (response.ok) {
      const data = await response.json();
      return data.content as GuidePageContent;
    }
  } catch (error) {
    console.error('Failed to fetch guide content:', error);
  }

  return getDefaultContent('guide') as GuidePageContent;
}

// ============================================================================
// Page Component
// ============================================================================

export default async function GuidePage() {
  const content = await getContent();

  return <GuidePageClient initialContent={content} />;
}
