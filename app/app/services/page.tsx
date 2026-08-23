import { Metadata } from 'next';
import { seoConfig } from '@/lib/seo-config';
import ServicesPageClient from '@/components/services/ServicesPageClient';

// ============================================================================
// Services Page - /services (Server Component)
// ============================================================================
// Keeps metadata server-rendered for SEO. All JSX + animations in client component.

export const metadata: Metadata = {
  title: 'Website Fix & Managed Automation | NeedThisDone',
  description:
    'Choose a $500 Website Fix or a human-run 30-day Managed Automation pilot for one repeated task.',
  alternates: { canonical: '/services' },
  openGraph: {
    title: 'Website Fix & Managed Automation | NeedThisDone',
    description:
      'Two focused, human-led paths with clear scope and a useful handoff.',
    url: `${seoConfig.baseUrl}/services`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Website Fix & Managed Automation | NeedThisDone',
    description:
      'Two focused, human-led paths with clear scope and a useful handoff.',
  },
};

export default function ServicesPage() {
  return <ServicesPageClient />;
}
