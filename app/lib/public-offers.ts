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
    summary: 'We review one website problem and agree on one correction. You receive the fix and a clear record of what changed.',
    fit: 'One website problem getting in the way.',
    price: '$500 total',
  },
  'ai-operator': {
    id: 'ai-operator',
    detailHref: '/managed-automation',
    name: 'Managed Automation',
    serviceName: 'Managed Automation',
    contactHref: '/contact?offer=managed-automation',
    summary: 'We look at one repeated task and agree on an improvement. A written proposal explains the work and how we will review it.',
    fit: 'One repeated task taking time.',
    price: 'Priced by proposal',
  },
};

export const PUBLIC_EXAMPLE_IDS = ['website-fix', 'managed-automation', 'first-step'] as const;

export type PublicExampleId = (typeof PUBLIC_EXAMPLE_IDS)[number];

export interface PublicExample {
  before: string;
  after: string;
  change: string;
  relatedOfferId?: PublicOfferId;
}

/** Keep example labels separate so each story record stays focused on its change. */
export const PUBLIC_EXAMPLE_TITLES: Record<PublicExampleId, string> = {
  'website-fix': 'A page people can act on',
  'managed-automation': 'A clearer path for repeated requests',
  'first-step': 'An idea with a useful first step',
};

/** Illustrative scenarios only; these are not customer results or case studies. */
export const PUBLIC_EXAMPLES: Record<PublicExampleId, PublicExample> = {
  'website-fix': {
    before: 'An important page makes it hard for people to know what to do next.',
    after: 'People can understand the page and take the next step.',
    change: 'The message, hierarchy, and next action are clearer on one focused page.',
    relatedOfferId: 'website-improvement',
  },
  'managed-automation': {
    before: 'Repeated requests move between messages, notes, and tools, so the next action is easy to miss.',
    after: 'Each request has a clearer path and a visible next step.',
    change: 'One repeatable flow makes the request, owner, and next action easier to follow.',
    relatedOfferId: 'ai-operator',
  },
  'first-step': {
    before: 'A promising idea is still broad, so it is hard to know what to do first.',
    after: 'The idea has a practical first step you can decide on.',
    change: 'The broad idea becomes one focused piece of work to explore.',
  },
};

export function getPublicExampleAnchor(exampleId: PublicExampleId): string {
  const relatedOfferId = PUBLIC_EXAMPLES[exampleId].relatedOfferId;
  return relatedOfferId ? PUBLIC_OFFERS[relatedOfferId].detailHref.slice(1) : exampleId;
}

export function getPublicExampleHref(exampleId: PublicExampleId): string {
  return `/work#${getPublicExampleAnchor(exampleId)}`;
}

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
