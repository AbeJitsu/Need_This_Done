import { Metadata } from 'next';
import WorkPageClient from '@/components/work/WorkPageClient';

// ============================================================================
// Work Page - /work
// ============================================================================
// Portfolio showcase following the About page's dark editorial pattern.
// Static content with ISR for performance. No CMS dependency.

export const metadata: Metadata = {
  title: 'Work - Abe Reyes | Need This Done',
  description:
    'Portfolio showcasing full-stack applications, data automation, and AI integrations. See what I build and how I work.',
  alternates: { canonical: '/work' },
  openGraph: {
    title: 'Portfolio - Abe Reyes | Full Stack Developer',
    description:
      'Production e-commerce platform, Python automation pipelines, AI chatbot with RAG. See real projects with real impact.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Portfolio - Abe Reyes | Full Stack Developer',
    description:
      'Production e-commerce platform, Python automation pipelines, AI chatbot with RAG.',
  },
};

export default function WorkPage() {
  return <WorkPageClient />;
}
