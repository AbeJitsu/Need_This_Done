import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Start a Project | NeedThisDone',
  description: 'Choose a $500 website improvement or a proposal-based managed AI operator pilot and share the context needed to scope it.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Start a Project | NeedThisDone',
    description: 'Choose a focused website improvement or a human-led managed AI operator pilot.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Start a Project | NeedThisDone',
    description: 'Choose a focused website improvement or a human-led managed AI operator pilot.',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
