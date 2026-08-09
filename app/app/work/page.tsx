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
    'Selected work, practical experience, and the delivery approach behind NeedThisDone.',
  alternates: { canonical: '/work' },
  openGraph: {
    title: 'Work | NeedThisDone',
    description:
      'Public conversion paths, private operator controls, and practical technical-operations delivery.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Work | NeedThisDone',
    description:
      'Public conversion paths, private operator controls, and practical technical-operations delivery.',
  },
};

export default function WorkPage() {
  return <WorkPageClient />;
}
