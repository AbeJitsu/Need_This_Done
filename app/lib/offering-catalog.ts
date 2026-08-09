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
    name: 'Website Improvement',
    kind: 'website_improvement',
    description: 'A focused $500 audit and one agreed page- or component-level improvement.',
    priceCents: 50000,
    billingPeriod: null,
    included: [
      'Evidence-backed review of the selected website path',
      'A prioritized finding and a contained implementation plan',
      'One agreed page/component, accessibility, SEO, performance, or conversion fix',
      'A before/after handoff describing what changed',
      'Manual 50/50 invoicing: $250 to begin and $250 on delivery',
    ],
    paymentLinkEnv: null,
    customWorkFallback: '/contact',
  },
  {
    slug: 'ai-operator',
    name: 'Managed AI Operator',
    kind: 'ai_operator',
    description: 'A proposal-based 30-day pilot operated privately by Abe and Andrea, with weekly client briefs.',
    priceCents: null,
    billingPeriod: null,
    included: [
      'A written operating brief and explicit approval boundaries',
      'Private research, preparation, and queue operation by Abe and Andrea',
      'Human review before every external action',
      'Four weekly client briefs during the 30-day pilot',
      'Recorded outcomes and a recommendation for the next step',
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
