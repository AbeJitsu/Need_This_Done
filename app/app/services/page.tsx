import { Metadata } from 'next';
import { seoConfig } from '@/lib/seo-config';
import ServicesPageClient from '@/components/services/ServicesPageClient';

// ============================================================================
// Services Page - /services (Server Component)
// ============================================================================
// Keeps metadata server-rendered for SEO. All JSX + animations in client component.

export const metadata: Metadata = {
  title: 'Web Development, Automation & AI Services | NeedThisDone',
  description:
    'Professional web development, workflow automation, and managed AI services. Custom websites from $500, automation from $150, AI solutions from $500/mo. Orlando-based, serving clients nationwide.',
  alternates: { canonical: '/services' },
  openGraph: {
    title: 'Web Development, Automation & AI Services | NeedThisDone',
    description:
      'Custom websites, workflow automation, and AI solutions built for your business. Transparent pricing, reliable delivery.',
    url: `${seoConfig.baseUrl}/services`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Web Development, Automation & AI Services | NeedThisDone',
    description:
      'Custom websites, workflow automation, and AI solutions built for your business.',
  },
};

export default function ServicesPage() {
  return <ServicesPageClient />;
}
