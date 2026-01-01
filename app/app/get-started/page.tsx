import { getDefaultContent } from '@/lib/default-page-content';
import type { GetStartedPageContent } from '@/lib/page-content-types';
import GetStartedPageClient from '@/components/get-started/GetStartedPageClient';

export const dynamic = 'force-dynamic';

// ============================================================================
// Get Started Page - Choose Your Path
// ============================================================================
// What: Page to help visitors choose their next step
// Why: Visitors may either want a quote or consultation, or already have a quote
// How: Two main path cards + authorization form for those with quotes
//
// INLINE EDITING: This page supports inline editing for admins.
// Click the floating pencil button to open the edit sidebar,
// then click on any section to edit its content directly.

export const metadata = {
  title: 'Get Started - NeedThisDone',
  description: 'Choose your path to getting started. Get a free quote, book a paid consultation, or authorize an existing quote.',
};

// ============================================================================
// Content Fetching
// ============================================================================

async function getContent(): Promise<GetStartedPageContent> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/page-content/get-started`, {
      next: { revalidate: 60 },
    });

    if (response.ok) {
      const data = await response.json();
      return data.content as GetStartedPageContent;
    }
  } catch (error) {
    console.error('Failed to fetch get-started content:', error);
  }

  return getDefaultContent('get-started') as GetStartedPageContent;
}

// ============================================================================
// Page Component
// ============================================================================

export default async function GetStartedPage() {
  const content = await getContent();

  return <GetStartedPageClient content={content} />;
}
