import { Metadata } from 'next';
import WorkPageClient from '@/components/work/WorkPageClient';

// ============================================================================
// Work Page - /work
// ============================================================================
// Outcome-led examples that show the problems we take on and how we move them forward.

export const metadata: Metadata = {
  title: 'Examples | NeedThisDone',
  description:
    'Explore illustrative website, workflow, and early idea scenarios and the focused changes they could lead to.',
  alternates: { canonical: '/work' },
  openGraph: {
    title: 'Examples | NeedThisDone',
    description: 'Explore what a useful website or workflow change could look like.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Examples | NeedThisDone',
    description: 'Explore what a useful website or workflow change could look like.',
  },
};

export default function WorkPage() {
  return <WorkPageClient />;
}
