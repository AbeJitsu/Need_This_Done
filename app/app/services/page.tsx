import { Metadata } from 'next';
import { seoConfig } from '@/lib/seo-config';
import ServicesPageClient from '@/components/services/ServicesPageClient';

// ============================================================================
// Services Page - /services (Server Component)
// ============================================================================
// Keeps metadata server-rendered for SEO. All JSX + animations in client component.

export const metadata: Metadata = {
  title: 'Targeted Fixes & Automation Setup | NeedThisDone',
  description:
    'Choose a $500 targeted website fix, or set up a supervised automation system using multiple LLMs and agents.',
  alternates: { canonical: '/services' },
  openGraph: {
    title: 'Targeted Fixes & Automation Setup | NeedThisDone',
    description:
      'Two focused paths with clear scope, visible work, and human approval boundaries.',
    url: `${seoConfig.baseUrl}/services`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Targeted Fixes & Automation Setup | NeedThisDone',
    description:
      'Two focused paths with clear scope, visible work, and human approval boundaries.',
  },
};

export default function ServicesPage() {
  return <ServicesPageClient />;
}
