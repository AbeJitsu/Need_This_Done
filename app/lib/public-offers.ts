export const PUBLIC_OFFER_IDS = ['website-improvement', 'ai-operator'] as const;

export type PublicOfferId = (typeof PUBLIC_OFFER_IDS)[number];

export interface PublicOffer {
  id: PublicOfferId;
  name: string;
  serviceName: string;
  contactHref: '/contact?offer=website-fix' | '/contact?offer=managed-automation';
  summary: string;
  price: string;
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
    summary: 'We review one website problem and agree on one correction. You receive the fix and a clear record of what changed.',
    price: '$500 total',
  },
  'ai-operator': {
    id: 'ai-operator',
    name: 'Managed Automation',
    serviceName: 'Managed Automation',
    contactHref: '/contact?offer=managed-automation',
    summary: 'We look at one repeated task and agree on an improvement. A written proposal explains the work and how we will review it.',
    price: 'Priced by proposal',
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
