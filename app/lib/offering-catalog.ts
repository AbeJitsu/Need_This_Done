export type OfferingKind = 'website_improvement' | 'ai_operator';

export interface Offering {
  slug: string;
  name: string;
  kind: OfferingKind;
  description: string;
  /** A public fixed price is optional; proposal-based work remains null. */
  priceCents: number | null;
  billingPeriod: null;
  included: readonly string[];
  paymentLinkEnv: null;
  customWorkFallback: '/contact';
}

export const OFFERING_CATALOG: readonly Offering[] = [
  {
    slug: 'website-improvement',
    name: 'Website Fix',
    kind: 'website_improvement',
    description: 'A focused $500 review and one agreed website fix.',
    priceCents: 50000,
    billingPeriod: null,
    included: [
      'Focused review of one website problem',
      'One agreed page, component, accessibility, SEO, performance, or conversion fix',
      'A clear before-and-after handoff',
      'Manual 50/50 invoicing: $250 to begin and $250 on delivery',
    ],
    paymentLinkEnv: null,
    customWorkFallback: '/contact',
  },
  {
    slug: 'ai-operator',
    name: 'Managed Automation',
    kind: 'ai_operator',
    description: 'A human-run 30-day pilot for one repeated task, priced by proposal.',
    priceCents: null,
    billingPeriod: null,
    included: [
      'One repeated task and one clear outcome',
      'A human-run 30-day pilot',
      'One short weekly brief',
      'Human review before important action',
    ],
    paymentLinkEnv: null,
    customWorkFallback: '/contact',
  },
];

export function publicOfferings() {
  return OFFERING_CATALOG.map((offering) => ({ ...offering, paymentLink: null }));
}

export function resolveOffering(slug: string) {
  const offering = OFFERING_CATALOG.find((candidate) => candidate.slug === slug);
  return offering ? { ...offering, paymentLink: null } : null;
}
