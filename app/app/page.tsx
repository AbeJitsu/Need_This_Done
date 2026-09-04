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
  title: 'Your Vision, Brought to Life | Need This Done',
  description: 'NeedThisDone helps owners and founders turn a vision for something better into a clear, focused result.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Your Vision, Brought to Life | Need This Done',
    description: 'Turn your vision for something better into a clear, focused result.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image' as const,
    title: 'Your Vision, Brought to Life | Need This Done',
    description: 'Turn your vision for something better into a clear, focused result.',
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
