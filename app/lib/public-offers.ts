export const PUBLIC_OFFER_IDS = ['website-improvement', 'ai-operator'] as const;

export type PublicOfferId = (typeof PUBLIC_OFFER_IDS)[number];

export interface PublicOffer {
  id: PublicOfferId;
  name: string;
  serviceName: string;
  contactHref: `/contact?offer=${PublicOfferId}`;
  summary: string;
  payment: string;
}

/**
 * The public site has two intentionally bounded paths. Keep this small and
 * repository-owned so a CTA cannot silently drift from the intake it opens.
 */
export const PUBLIC_OFFERS: Record<PublicOfferId, PublicOffer> = {
  'website-improvement': {
    id: 'website-improvement',
    name: 'Website Improvement',
    serviceName: 'Website Improvement',
    contactHref: '/contact?offer=website-improvement',
    summary: 'A $500 audit plus one agreed, contained website fix.',
    payment: '50% by manual invoice to begin and 50% after the agreed fix is delivered.',
  },
  'ai-operator': {
    id: 'ai-operator',
    name: 'Managed AI Operator',
    serviceName: 'Managed AI Operator',
    contactHref: '/contact?offer=ai-operator',
    summary: 'A proposal-based 30-day pilot operated privately by Abe and Andrea, with weekly briefs.',
    payment: 'Pilot scope and payment terms are agreed in the proposal before work begins.',
  },
};

export function isPublicOfferId(value: string | null | undefined): value is PublicOfferId {
  return Boolean(value && PUBLIC_OFFER_IDS.includes(value as PublicOfferId));
}

/** Accept the prior checkout handoff names without making them public offers. */
export function normalizePublicOfferId(value: string | null | undefined): PublicOfferId | null {
  if (isPublicOfferId(value)) return value;
  if (value === 'ai-growth-employee-pilot' || value === 'managed-ai-growth-employee') return 'ai-operator';
  return null;
}
