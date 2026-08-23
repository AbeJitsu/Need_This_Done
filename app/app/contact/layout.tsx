import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact | NeedThisDone',
  description: 'Tell us what is stuck. We confirm one outcome and the scope before work starts.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact | NeedThisDone',
    description: 'Tell us what is stuck. We confirm one outcome and the scope before work starts.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact | NeedThisDone',
    description: 'Tell us what is stuck. We confirm one outcome and the scope before work starts.',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
