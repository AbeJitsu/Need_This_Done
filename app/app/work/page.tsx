import { Metadata } from 'next';
import WorkPageClient from '@/components/work/WorkPageClient';
import { PUBLIC_CORE_PROMISE } from '@/lib/public-copy';

// ============================================================================
// Work Page - /work
// ============================================================================
// Portfolio page for the technical work behind NeedThisDone and related builds.

export const metadata: Metadata = {
  title: 'Selected Work | NeedThisDone',
  description:
    PUBLIC_CORE_PROMISE,
  alternates: { canonical: '/work' },
  openGraph: {
    title: 'Selected Work | NeedThisDone',
    description: PUBLIC_CORE_PROMISE,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Selected Work | NeedThisDone',
    description: PUBLIC_CORE_PROMISE,
  },
};

export default function WorkPage() {
  return <WorkPageClient />;
}
