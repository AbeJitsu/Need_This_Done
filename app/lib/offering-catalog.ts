export type OfferingKind = 'pilot' | 'managed_service';

export interface Offering {
  slug: string;
  name: string;
  kind: OfferingKind;
  description: string;
  /** Pricing remains proposal-based while the internal pilot establishes cost. */
  priceCents: null;
  billingPeriod: null;
  included: readonly string[];
  paymentLinkEnv: null;
  customWorkFallback: '/contact';
}

export const OFFERING_CATALOG: readonly Offering[] = [
  {
    slug: 'ai-growth-employee-pilot',
    name: 'AI Growth Employee Pilot',
    kind: 'pilot',
    description: 'Design the role, establish guardrails, build the first workflows, and measure a supervised trial.',
    priceCents: null,
    billingPeriod: null,
    included: [
      'Growth discovery and operating brief',
      'Role, responsibilities, and prohibited actions',
      'Morning, midday, and end-of-day check-ins',
      'First evidence-backed workflows',
      'Measured pilot and recommendations',
    ],
    paymentLinkEnv: null,
    customWorkFallback: '/contact',
  },
  {
    slug: 'managed-ai-growth-employee',
    name: 'Managed AI Growth Employee',
    kind: 'managed_service',
    description: 'Ongoing operation, monitoring, improvement, reporting, and human support.',
    priceCents: null,
    billingPeriod: null,
    included: [
      'Managed daily decision queues',
      'Workflow operation and monitoring',
      'Outcome and time-saved reporting',
      'Continuous improvement from decisions',
      'Human support and guardrail reviews',
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
