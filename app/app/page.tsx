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
  title: 'NeedThisDone | Website Fix & Managed Automation',
  description: 'Fix one website problem for $500, or discuss a human-run 30-day pilot for one repeated task.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'NeedThisDone | Website Fix & Managed Automation',
    description: 'Two focused paths: one contained website fix or one human-run automation pilot.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image' as const,
    title: 'NeedThisDone | Website Fix & Managed Automation',
    description: 'Two focused paths: one contained website fix or one human-run automation pilot.',
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
