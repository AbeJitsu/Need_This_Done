import { fetchPageContent } from '@/lib/fetch-page-content';
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
// Page Component
// ============================================================================

export default async function FAQPage() {
  const content = await fetchPageContent<FAQPageContent>('faq');

  return <FAQPageClient content={content} />;
}
