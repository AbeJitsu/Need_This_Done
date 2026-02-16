import { Metadata } from 'next';
import QuoteAuthorizationClient from '@/components/quote/QuoteAuthorizationClient';
import { seoConfig } from '@/lib/seo-config';

// ============================================================================
// Quote Authorization Page - /quote
// ============================================================================
// Dedicated route for clients who already have a quote to authorize it
// and pay their 50% deposit. Linked from pricing page + footer.

export const metadata: Metadata = {
  title: 'Authorize Your Quote - NeedThisDone',
  description:
    'Have a quote from NeedThisDone? Enter your reference number to review and pay your 50% deposit to get your project started.',
  alternates: { canonical: '/quote' },
  openGraph: {
    title: 'Authorize Your Quote - NeedThisDone',
    description:
      'Enter your quote reference to review details and pay your deposit. Secure payment powered by Stripe.',
    url: `${seoConfig.baseUrl}/quote`,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Authorize Your Quote - NeedThisDone',
    description:
      'Enter your quote reference to review details and pay your deposit.',
  },
};

export default function QuotePage() {
  return <QuoteAuthorizationClient />;
}
