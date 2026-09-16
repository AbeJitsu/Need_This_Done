import { Metadata } from 'next';
import WorkPageClient from '@/components/work/WorkPageClient';
import { PUBLIC_CORE_PROMISE } from '@/lib/public-copy';

// ============================================================================
// Work Page - /work
// ============================================================================
// A real-project page that explains the practical skills used across NeedThisDone.

export const metadata: Metadata = {
  title: 'What I Build | NeedThisDone',
  description:
    PUBLIC_CORE_PROMISE,
  alternates: { canonical: '/work' },
  openGraph: {
    title: 'What I Build | NeedThisDone',
    description: PUBLIC_CORE_PROMISE,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'What I Build | NeedThisDone',
    description: PUBLIC_CORE_PROMISE,
  },
};

export default function WorkPage() {
  return <WorkPageClient />;
}
