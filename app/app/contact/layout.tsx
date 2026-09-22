import { Metadata } from 'next';
import { PUBLIC_CORE_PROMISE } from '@/lib/public-copy';

export const metadata: Metadata = {
  title: 'Start a Conversation | NeedThisDone',
  description: PUBLIC_CORE_PROMISE,
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Start a Conversation | NeedThisDone',
    description: PUBLIC_CORE_PROMISE,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Start a Conversation | NeedThisDone',
    description: PUBLIC_CORE_PROMISE,
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
