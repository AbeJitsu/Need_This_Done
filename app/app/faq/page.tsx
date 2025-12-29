import { getDefaultContent } from '@/lib/default-page-content';
import type { FAQPageContent } from '@/lib/page-content-types';
import FAQPageClient from '@/components/faq/FAQPageClient';

export const dynamic = 'force-dynamic';

// ============================================================================
// FAQ Page - Common Questions
// ============================================================================
// Answers common questions clients might have about the service.
// Content is fetched from the database (if customized) or uses defaults.
//
// INLINE EDITING: This page supports inline editing for admins.
// Click the floating pencil button to open the edit sidebar,
// then click on any section to edit its content directly.

export const metadata = {
  title: 'FAQ - NeedThisDone',
  description: 'Frequently asked questions about our services.',
};

// ============================================================================
// Content Fetching
// ============================================================================

async function getContent(): Promise<FAQPageContent> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/page-content/faq`, {
      next: { revalidate: 60 },
    });

    if (response.ok) {
      const data = await response.json();
      return data.content as FAQPageContent;
    }
  } catch (error) {
    console.error('Failed to fetch FAQ content:', error);
  }

  return getDefaultContent('faq') as FAQPageContent;
}

// ============================================================================
// Page Component
// ============================================================================

export default async function FAQPage() {
  const content = await getContent();

  return <FAQPageClient content={content} />;
}
