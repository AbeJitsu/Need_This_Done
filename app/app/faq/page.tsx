import type { FAQPageContent } from '@/lib/page-content-types';
import { defaultFAQContent } from '@/lib/default-page-content';
import FAQPageClient from '@/components/faq/FAQPageClient';
import { FAQPageJsonLd } from '@/components/seo/JsonLd';

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
  description: 'Answers about scope, cost, review, and what happens next.',
  alternates: { canonical: '/faq' },
  openGraph: {
    title: 'FAQ - NeedThisDone',
    description: 'Common questions about scope, payment, and what happens next.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image' as const,
    title: 'FAQ - NeedThisDone',
    description: 'Common questions about scope, payment, and what happens next.',
  },
};

// ============================================================================
// Page Component
// ============================================================================

export default function FAQPage() {
  const content = defaultFAQContent as FAQPageContent;

  return (
    <>
      <FAQPageJsonLd />
      <FAQPageClient content={content} />
    </>
  );
}
