import { getDefaultContent } from '@/lib/default-page-content';
import type { ServicesPageContent } from '@/lib/page-content-types';
import ServicesPageClient from '@/components/services/ServicesPageClient';

export const dynamic = 'force-dynamic';

// ============================================================================
// Services Page - Decision Accelerator
// ============================================================================
// Redesigned to help visitors pick the right service through:
// 1. Scenario matching ("Does this sound like you?")
// 2. Side-by-side comparison table
// 3. Deep-dive content (reusing modal content)
// 4. Low-friction CTA for undecided visitors
//
// INLINE EDITING: This page supports inline editing for admins.
// Click the floating pencil button to open the edit sidebar,
// then click on any section to edit its content directly.

export const metadata = {
  title: 'Services - NeedThisDone',
  description:
    'Three ways to grow: Website Builds, Automation Setup, and Managed AI Services. Each tier builds on the last.',
};

// ============================================================================
// Content Fetching
// ============================================================================

async function getContent(): Promise<ServicesPageContent> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/page-content/services`, {
      next: { revalidate: 60 },
    });

    if (response.ok) {
      const data = await response.json();
      return data.content as ServicesPageContent;
    }
  } catch (error) {
    console.error('Failed to fetch services content:', error);
  }

  return getDefaultContent('services') as ServicesPageContent;
}

// ============================================================================
// Page Component
// ============================================================================

export default async function ServicesPage() {
  const content = await getContent();

  return <ServicesPageClient content={content} />;
}
