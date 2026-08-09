import { Metadata } from 'next';
import WorkPageClient from '@/components/work/WorkPageClient';

// ============================================================================
// Work Page - /work
// ============================================================================
// Portfolio showcase following the About page's dark editorial pattern.
// Static content with ISR for performance. No CMS dependency.

export const metadata: Metadata = {
  title: 'Work | NeedThisDone',
  description:
    'Evidence of clear scope, coordinated systems, and reviewable delivery.',
  alternates: { canonical: '/work' },
  openGraph: {
    title: 'Work | NeedThisDone',
    description:
    'Evidence of durable workflows, browser-based coordination, and reviewable outcomes.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Work | NeedThisDone',
    description:
    'Evidence of durable workflows, browser-based coordination, and reviewable outcomes.',
  },
};

export default function WorkPage() {
  return <WorkPageClient />;
}
