import { fetchPageContent } from '@/lib/fetch-page-content';
import type { FAQPageContent } from '@/lib/page-content-types';
import FAQPageClient from '@/components/faq/FAQPageClient';
import { FAQPageJsonLd } from '@/components/seo/JsonLd';

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
  description: 'Answers to common questions about our web development, automation, and AI services — pricing, timelines, process, and support.',
  alternates: { canonical: '/faq' },
  openGraph: {
    title: 'FAQ - NeedThisDone',
    description: 'Common questions about our web development, automation, and AI services.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image' as const,
    title: 'FAQ - NeedThisDone',
    description: 'Common questions about our web development, automation, and AI services.',
  },
};

// ============================================================================
// Page Component
// ============================================================================

export default async function FAQPage() {
  const content = await fetchPageContent<FAQPageContent>('faq');

  return (
    <>
      <FAQPageJsonLd />
      <FAQPageClient content={content} />
    </>
  );
}
