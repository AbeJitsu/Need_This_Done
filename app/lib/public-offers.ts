export const PUBLIC_OFFER_IDS = ['website-improvement', 'ai-operator'] as const;

export type PublicOfferId = (typeof PUBLIC_OFFER_IDS)[number];

export interface PublicOffer {
  id: PublicOfferId;
  name: string;
  serviceName: string;
  contactHref: '/contact?offer=website-fix' | '/contact?offer=managed-automation';
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
    name: 'Website Fix',
    serviceName: 'Website Fix',
    contactHref: '/contact?offer=website-fix',
    summary: 'We review one website problem, agree on one contained fix, and deliver it for $500.',
    payment: '50% by manual invoice to begin and 50% after the agreed fix is delivered.',
  },
  'ai-operator': {
    id: 'ai-operator',
    name: 'Managed Automation',
    serviceName: 'Managed Automation',
    contactHref: '/contact?offer=managed-automation',
    summary: 'A proposal-based way to improve one repeated problem at work.',
    payment: 'The proposal sets the problem, better result, scope, price, and payment terms.',
  },
};

export function isPublicOfferId(value: string | null | undefined): value is PublicOfferId {
  return Boolean(value && PUBLIC_OFFER_IDS.includes(value as PublicOfferId));
}

/** Accept the prior checkout handoff names without making them public offers. */
export function normalizePublicOfferId(value: string | null | undefined): PublicOfferId | null {
  if (value === 'website-fix') return 'website-improvement';
  if (value === 'managed-automation') return 'ai-operator';
  if (isPublicOfferId(value)) return value;
  if (value === 'ai-growth-employee-pilot' || value === 'managed-ai-growth-employee') return 'ai-operator';
  return null;
}
