import type { PrivacyPageContent } from '@/lib/page-content-types';
import { defaultPrivacyContent } from '@/lib/default-page-content';
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
  alternates: { canonical: '/privacy' },
  openGraph: {
    title: 'Privacy Policy - NeedThisDone',
    description: 'How we collect, use, and protect your personal information.',
    type: 'website',
  },
};

// ============================================================================
// Page Component
// ============================================================================

export default function PrivacyPage() {
  const content = defaultPrivacyContent as PrivacyPageContent;

  return <PrivacyPageClient initialContent={content} />;
}
