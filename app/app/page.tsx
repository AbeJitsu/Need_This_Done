import { getDefaultContent } from '@/lib/default-page-content';
import type { HomePageContent } from '@/lib/page-content-types';
import HomePageClient from '@/components/home/HomePageClient';
import { listBlogPosts } from '@/lib/blog-content';

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
  title: 'NeedThisDone | Your AI Growth Employee',
  description: 'A supervised AI Growth Employee that researches, prepares, prioritizes, and tracks growth work between three short daily check-ins.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'NeedThisDone | Your AI Growth Employee',
    description: 'Growth work moves forward between check-ins. You stay in control of every external action.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image' as const,
    title: 'NeedThisDone | Your AI Growth Employee',
    description: 'Growth work moves forward between check-ins. You stay in control of every external action.',
  },
};

// ============================================================================
// Content Fetching
// ============================================================================

function getContent(): HomePageContent {
  return getDefaultContent('home') as HomePageContent;
}

// ============================================================================
// Recent Blog Posts (for homepage "Latest from the Blog" section)
// ============================================================================

// ============================================================================
// Page Component
// ============================================================================

export default function HomePage() {
  const content = getContent();
  const recentPosts = listBlogPosts().slice(0, 3);

  // Render using the client component which supports inline editing
  return <HomePageClient content={content} recentBlogPosts={recentPosts} />;
}
