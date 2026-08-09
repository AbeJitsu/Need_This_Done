import HomePageClient from '@/components/home/HomePageClient';

// ============================================================================
// Home Page - NeedThisDone Landing Page
// ============================================================================
// The main landing page that introduces the service and invites visitors
// to learn more or submit a project request.
//
// INLINE EDITING: This page supports inline editing for admins.
// Click the floating pencil button to open the edit sidebar,
// then click on any section to edit its content directly.

// Use Incremental Static Regeneration (ISR) to pre-render and cache
// Regenerate the page every hour (3600 seconds)
export const revalidate = 3600;

export const metadata = {
  title: 'NeedThisDone | Targeted Fixes & Automation Systems',
  description: 'Choose a $500 targeted website fix, or set up a supervised automation system that brings LLMs, agents, evidence, and approvals into one browser workspace.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'NeedThisDone | Targeted Fixes & Automation Systems',
    description: 'Two focused paths: fix one contained problem or set up the automation system around recurring work.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image' as const,
    title: 'NeedThisDone | Targeted Fixes & Automation Systems',
    description: 'Two focused paths: fix one contained problem or set up the automation system around recurring work.',
  },
};

// ============================================================================
// Content Fetching
// ============================================================================

// ============================================================================
// Page Component
// ============================================================================

export default function HomePage() {
  return <HomePageClient />;
}
