import { Metadata } from 'next';
import { seoConfig } from '@/lib/seo-config';
import ServicesPageClient from '@/components/services/ServicesPageClient';

// ============================================================================
// Services Page - /services (Server Component)
// ============================================================================
// Keeps metadata server-rendered for SEO. All JSX + animations in client component.

export const metadata: Metadata = {
  title: 'What Your AI Growth Employee Handles | NeedThisDone',
  description:
    'Research, evidence-backed audits, prepared follow-up, prioritized decisions, and outcome tracking under human supervision.',
  alternates: { canonical: '/services' },
  openGraph: {
    title: 'What Your AI Growth Employee Handles | NeedThisDone',
    description:
      'A supervised growth role that prepares the work and keeps you in control.',
    url: `${seoConfig.baseUrl}/services`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'What Your AI Growth Employee Handles | NeedThisDone',
    description:
      'A supervised growth role that prepares the work and keeps you in control.',
  },
};

export default function ServicesPage() {
  return <ServicesPageClient />;
}
