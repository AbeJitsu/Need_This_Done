import { getDefaultContent } from '@/lib/default-page-content';
import type { PricingPageContent } from '@/lib/page-content-types';
import PricingPageClient from '@/components/pricing/PricingPageClient';

export const dynamic = 'force-dynamic';

// ============================================================================
// Pricing Page - Service Pricing Tiers
// ============================================================================
// Displays pricing options for different service levels.
// Content is fetched from the database (if customized) or uses defaults.
//
// INLINE EDITING: This page supports inline editing for admins.
// Click the floating pencil button to open the edit sidebar,
// then click on any section to edit its content directly.

export const metadata = {
  title: 'Pricing - NeedThisDone',
  description: 'Pick your perfect fit. Every project is different, so here\'s a starting point.',
};

// ============================================================================
// Content Fetching
// ============================================================================

async function getContent(): Promise<PricingPageContent> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/page-content/pricing`, {
      next: { revalidate: 60 },
    });

    if (response.ok) {
      const data = await response.json();
      return data.content as PricingPageContent;
    }
  } catch (error) {
    console.error('Failed to fetch pricing content:', error);
  }

  return getDefaultContent('pricing') as PricingPageContent;
}

// ============================================================================
// Page Component
// ============================================================================

export default async function PricingPage() {
  const content = await getContent();

  return <PricingPageClient content={content} />;
}
