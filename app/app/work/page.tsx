import { Metadata } from 'next';
import WorkPageClient from '@/components/work/WorkPageClient';
import { PUBLIC_CORE_PROMISE } from '@/lib/public-copy';

// ============================================================================
// Work Page - /work
// ============================================================================
// Outcome-led examples that show the problems we take on and how we move them forward.

export const metadata: Metadata = {
  title: 'Examples | NeedThisDone',
  description:
    PUBLIC_CORE_PROMISE,
  alternates: { canonical: '/work' },
  openGraph: {
    title: 'Examples | NeedThisDone',
    description: PUBLIC_CORE_PROMISE,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Examples | NeedThisDone',
    description: PUBLIC_CORE_PROMISE,
  },
};

export default function WorkPage() {
  return <WorkPageClient />;
}
