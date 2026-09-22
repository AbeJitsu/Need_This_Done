import { PUBLIC_CORE_PROMISE } from '@/lib/public-copy';

export const PUBLIC_OFFER_IDS = ['website-improvement', 'ai-operator'] as const;

export type PublicOfferId = (typeof PUBLIC_OFFER_IDS)[number];

export interface PublicOffer {
  id: PublicOfferId;
  name: string;
  serviceName: string;
  contactHref: '/contact?offer=website-fix' | '/contact?offer=managed-automation';
  detailHref: string;
  fit: string;
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
    detailHref: '/website-fix',
    name: 'Website Fix',
    serviceName: 'Website Fix',
    contactHref: '/contact?offer=website-fix',
    summary: `${PUBLIC_CORE_PROMISE} For Website Fix, I review the issue, agree on one correction with you, and show what changed.`,
    fit: 'One website problem getting in the way.',
    price: '$500 total',
  },
  'ai-operator': {
    id: 'ai-operator',
    detailHref: '/managed-automation',
    name: 'Managed Automation',
    serviceName: 'Managed Automation',
    contactHref: '/contact?offer=managed-automation',
    summary: `${PUBLIC_CORE_PROMISE} For Managed Automation, I review one repeated task and outline the work in a written proposal.`,
    fit: 'One repeated task taking time.',
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
