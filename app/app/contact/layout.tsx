import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Share Your Vision | NeedThisDone',
  description: 'Tell NeedThisDone what you want to bring to life and the outcome you want—no technical brief required.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Share Your Vision | NeedThisDone',
    description: 'Tell us what you want to bring to life and the outcome you want.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Share Your Vision | NeedThisDone',
    description: 'Tell us what you want to bring to life and the outcome you want.',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
