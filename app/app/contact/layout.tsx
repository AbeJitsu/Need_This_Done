import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us - NeedThisDone',
  description: 'Get in touch with NeedThisDone. Submit a project inquiry or book a consultation. Orlando-based professional project services.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact Us - NeedThisDone',
    description: 'Submit a project inquiry or book a consultation. Orlando-based professional project services.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us - NeedThisDone',
    description: 'Submit a project inquiry or book a consultation. Orlando-based professional project services.',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
