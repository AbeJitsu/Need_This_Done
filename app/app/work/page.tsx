import { Metadata } from 'next';
import WorkPageClient from '@/components/work/WorkPageClient';

// ============================================================================
// Work Page - /work
// ============================================================================
// Outcome-led examples that show the problems we take on and how we move them forward.

export const metadata: Metadata = {
  title: 'Work | NeedThisDone',
  description:
    'See how NeedThisDone turns stuck website, workflow, and business ideas into clear next steps and finished work.',
  alternates: { canonical: '/work' },
  openGraph: {
    title: 'Work | NeedThisDone',
    description: 'See how NeedThisDone moves a stuck problem toward a clear next step and finished work.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Work | NeedThisDone',
    description: 'See how NeedThisDone moves a stuck problem toward a clear next step and finished work.',
  },
};

export default function WorkPage() {
  return <WorkPageClient />;
}
