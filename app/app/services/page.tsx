import { Metadata } from 'next';
import { seoConfig } from '@/lib/seo-config';
import { PUBLIC_CORE_PROMISE } from '@/lib/public-copy';
import ServicesPageClient from '@/components/services/ServicesPageClient';

// ============================================================================
// Services Page - /services (Server Component)
// ============================================================================
// Keeps metadata server-rendered for SEO. All JSX + animations in client component.

export const metadata: Metadata = {
  title: 'Capabilities | NeedThisDone',
  description:
    PUBLIC_CORE_PROMISE,
  alternates: { canonical: '/services' },
  openGraph: {
    title: 'Capabilities | NeedThisDone',
    description: PUBLIC_CORE_PROMISE,
    url: `${seoConfig.baseUrl}/services`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Capabilities | NeedThisDone',
    description: PUBLIC_CORE_PROMISE,
  },
};

export default function ServicesPage() {
  return <ServicesPageClient />;
}
