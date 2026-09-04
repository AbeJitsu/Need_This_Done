import { Metadata } from 'next';
import WorkPageClient from '@/components/work/WorkPageClient';

// ============================================================================
// Work Page - /work
// ============================================================================
// Honest representative examples. Paid outcomes are added only after delivery proof.

export const metadata: Metadata = {
  title: 'Work | NeedThisDone',
  description:
    'Hypothetical before-and-after examples of clearer websites and better ways of working—not client results.',
  alternates: { canonical: '/work' },
  openGraph: {
    title: 'Work | NeedThisDone',
    description: 'Representative examples of what better can look like—not client results.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Work | NeedThisDone',
    description: 'Representative examples of what better can look like—not client results.',
  },
};

export default function WorkPage() {
  return <WorkPageClient />;
}
