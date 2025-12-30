import { fetchPageContent } from '@/lib/fetch-page-content';
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
// Page Component
// ============================================================================

export default async function GuidePage() {
  const content = await fetchPageContent<GuidePageContent>('guide');

  return <GuidePageClient initialContent={content} />;
}
