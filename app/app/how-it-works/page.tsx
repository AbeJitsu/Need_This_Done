import { getDefaultContent } from '@/lib/default-page-content';
import type { HowItWorksPageContent } from '@/lib/page-content-types';
import HowItWorksPageClient from '@/components/how-it-works/HowItWorksPageClient';

export const dynamic = 'force-dynamic';

// ============================================================================
// How It Works Page - The NeedThisDone Process
// ============================================================================
// Redesigned to feel inviting, supportive, and focused. Features:
// - Warm, benefit-focused headline
// - Trust badges for reassurance
// - Hero card for Step 1 (the clear starting point)
// - Condensed steps 2-4 in horizontal flow
// - Low-friction "Questions?" section for hesitant visitors
//
// INLINE EDITING: This page supports inline editing for admins.
// Click the floating pencil button to open the edit sidebar,
// then click on any section to edit its content directly.

export const metadata = {
  title: 'How It Works - NeedThisDone',
  description:
    'Our simple process for getting your tasks done. Tell us what you need, and we take it from there.',
};

// ============================================================================
// Content Fetching
// ============================================================================

async function getContent(): Promise<HowItWorksPageContent> {
  // Get defaults first to ensure we always have valid content
  const defaults = getDefaultContent('how-it-works') as HowItWorksPageContent;

  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/page-content/how-it-works`, {
      next: { revalidate: 60 },
    });

    if (response.ok) {
      const data = await response.json();
      // Ensure the fetched content has all required fields
      if (data?.content?.steps && data.content.header) {
        return data.content as HowItWorksPageContent;
      }
    }
  } catch (error) {
    console.error('Failed to fetch how-it-works content:', error);
  }

  return defaults;
}

// ============================================================================
// Page Component
// ============================================================================

export default async function HowItWorksPage() {
  const content = await getContent();

  return <HowItWorksPageClient content={content} />;
}
