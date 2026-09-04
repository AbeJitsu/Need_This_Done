import { Metadata } from 'next';
import { seoConfig } from '@/lib/seo-config';
import ServicesPageClient from '@/components/services/ServicesPageClient';

// ============================================================================
// Services Page - /services (Server Component)
// ============================================================================
// Keeps metadata server-rendered for SEO. All JSX + animations in client component.

export const metadata: Metadata = {
  title: 'What We Do | NeedThisDone',
  description:
    'Bring the outcome you can see. NeedThisDone shapes a focused next step, with Website Fix and Managed Automation as concrete starting points.',
  alternates: { canonical: '/services' },
  openGraph: {
    title: 'What We Do | NeedThisDone',
    description:
      'Better websites and better ways of working, shaped around the result you want.',
    url: `${seoConfig.baseUrl}/services`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'What We Do | NeedThisDone',
    description:
      'Better websites and better ways of working, shaped around the result you want.',
  },
};

export default function ServicesPage() {
  return <ServicesPageClient />;
}
