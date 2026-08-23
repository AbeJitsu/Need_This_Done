import { Metadata } from 'next';
import WorkPageClient from '@/components/work/WorkPageClient';

// ============================================================================
// Work Page - /work
// ============================================================================
// Honest process examples. Paid outcomes are added only after delivery proof.

export const metadata: Metadata = {
  title: 'Work | NeedThisDone',
  description:
    'Process examples for a contained Website Fix and an outcome-focused Managed Automation engagement.',
  alternates: { canonical: '/work' },
  openGraph: {
    title: 'Work | NeedThisDone',
    description: 'Process examples that show clear scope, a defined better state, and a useful handoff.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Work | NeedThisDone',
    description: 'Process examples that show clear scope, a defined better state, and a useful handoff.',
  },
};

export default function WorkPage() {
  return <WorkPageClient />;
}
