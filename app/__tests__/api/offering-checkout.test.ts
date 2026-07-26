import { afterEach, describe, expect, it } from 'vitest';
import { GET } from '@/app/api/offerings/[slug]/checkout/route';

const paymentLinkKey = 'STRIPE_PAYMENT_LINK_STARTER_SITE';
const priorPaymentLink = process.env[paymentLinkKey];

afterEach(() => {
  if (priorPaymentLink === undefined) delete process.env[paymentLinkKey];
  else process.env[paymentLinkKey] = priorPaymentLink;
});

describe('offering checkout handoff', () => {
  it('uses the project-request fallback until a Payment Link is configured', async () => {
    delete process.env[paymentLinkKey];

    const response = await GET(new Request('https://needthisdone.com/api/offerings/starter-site/checkout') as never, {
      params: Promise.resolve({ slug: 'starter-site' }),
    });

    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe('https://needthisdone.com/contact?offering=starter-site');
  });

  it('redirects only to a configured Stripe-hosted Payment Link', async () => {
    process.env[paymentLinkKey] = 'https://buy.stripe.com/test_123';

    const response = await GET(new Request('https://needthisdone.com/api/offerings/starter-site/checkout') as never, {
      params: Promise.resolve({ slug: 'starter-site' }),
    });

    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe('https://buy.stripe.com/test_123');
  });

  it('does not redirect an invalid configured value away from the contact fallback', async () => {
    process.env[paymentLinkKey] = 'https://example.com/not-a-payment-link';

    const response = await GET(new Request('https://needthisdone.com/api/offerings/starter-site/checkout') as never, {
      params: Promise.resolve({ slug: 'starter-site' }),
    });

    expect(response.headers.get('location')).toBe('https://needthisdone.com/contact?offering=starter-site');
  });
});
