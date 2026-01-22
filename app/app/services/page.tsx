import { getDefaultContent } from '@/lib/default-page-content';
import type { ServicesPageContent } from '@/lib/page-content-types';
import ServicesPageClient from '@/components/services/ServicesPageClient';
import { AllServicesJsonLd } from '@/components/seo/JsonLd';

// ============================================================================
// Services Page - Decision Accelerator
// ============================================================================
// Redesigned to help visitors pick the right service through:
// 1. Scenario matching ("Does this sound like you?")
// 2. Side-by-side comparison table
// 3. Deep-dive content (reusing modal content)
// 4. Low-friction CTA for undecided visitors
//
// Content is defined in lib/page-config.ts - edit there to change page content.

export const metadata = {
  title: 'Services - NeedThisDone',
  description:
    'Three ways to grow: Website Builds, Automation Setup, and Managed AI Services. Each tier builds on the last.',
};

// ============================================================================
// Page Component
// ============================================================================

export default function ServicesPage() {
  const content = getDefaultContent('services') as ServicesPageContent;

  return (
    <>
      <AllServicesJsonLd />
      <ServicesPageClient content={content} />
    </>
  );
}
