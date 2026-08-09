import { Metadata } from 'next';
import { seoConfig } from '@/lib/seo-config';
import ServicesPageClient from '@/components/services/ServicesPageClient';

// ============================================================================
// Services Page - /services (Server Component)
// ============================================================================
// Keeps metadata server-rendered for SEO. All JSX + animations in client component.

export const metadata: Metadata = {
  title: 'Website Improvement & Managed AI Operator | NeedThisDone',
  description:
    'Choose a $500 website audit plus one contained fix, or a proposal-based 30-day managed AI operator pilot with weekly briefs.',
  alternates: { canonical: '/services' },
  openGraph: {
    title: 'Website Improvement & Managed AI Operator | NeedThisDone',
    description:
      'Two focused, human-led offers with clear scope and approval boundaries.',
    url: `${seoConfig.baseUrl}/services`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Website Improvement & Managed AI Operator | NeedThisDone',
    description:
      'Two focused, human-led offers with clear scope and approval boundaries.',
  },
};

export default function ServicesPage() {
  return <ServicesPageClient />;
}
