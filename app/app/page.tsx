import HomePageClient from '@/components/home/HomePageClient';
import { PUBLIC_BRAND_TITLE, PUBLIC_CORE_PROMISE } from '@/lib/public-copy';

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
  title: `${PUBLIC_BRAND_TITLE} | Need This Done`,
  description: PUBLIC_CORE_PROMISE,
  alternates: { canonical: '/' },
  openGraph: {
    title: `${PUBLIC_BRAND_TITLE} | Need This Done`,
    description: PUBLIC_CORE_PROMISE,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image' as const,
    title: `${PUBLIC_BRAND_TITLE} | Need This Done`,
    description: PUBLIC_CORE_PROMISE,
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
