import { z } from 'zod';
import type { OpenRouterCitation } from '@/lib/openrouter-core';
import { isPublicSourceUrl, normalizeWebsite } from '@/lib/prospecting';

const citationSchema = z.object({
  url: z.string().url().max(2_000),
  title: z.string().trim().min(1).max(500),
  excerpt: z.string().trim().min(1).max(2_000),
}).strict();

const observedEvidenceSchema = z.object({
  claim: z.string().trim().min(1).max(1_200),
  citationUrls: z.array(z.string().url().max(2_000)).min(1).max(6),
}).strict();

const contactPathSchema = z.object({
  type: z.enum(['email', 'contact_form', 'phone', 'linkedin', 'other', 'unknown']),
  value: z.string().trim().min(1).max(1_000),
  email: z.string().email().max(320).optional(),
}).strict();

const suggestedOutreachSchema = z.object({
  subject: z.string().trim().min(1).max(300),
  body: z.string().trim().min(1).max(10_000),
}).strict();

export const prospectDossierSchema = z.object({
  companyName: z.string().trim().min(1).max(240),
  officialWebsite: z.string().url().max(2_000),
  icpReason: z.string().trim().min(1).max(2_000),
  observedEvidence: z.array(observedEvidenceSchema).min(1).max(12),
  citations: z.array(citationSchema).min(1).max(20),
  recommendedOfferAngle: z.string().trim().min(1).max(2_000),
  contactPath: contactPathSchema,
  suggestedOutreach: suggestedOutreachSchema,
}).strict();

export const prospectDossierBatchSchema = z.object({
  dossiers: z.array(prospectDossierSchema).min(1).max(2),
  shortfallReason: z.string().trim().min(1).max(2_000).optional(),
}).strict().superRefine((value, context) => {
  if (value.dossiers.length < 2 && !value.shortfallReason) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: 'A research shortfall needs a concrete reason.' });
  }
});

export type ProspectDossier = z.infer<typeof prospectDossierSchema>;
export type ProspectDossierBatch = z.infer<typeof prospectDossierBatchSchema>;

export class ProspectDossierValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProspectDossierValidationError';
  }
}

function normalizedCitationUrl(value: string) {
  try {
    const url = new URL(value);
    url.hash = '';
    return url.toString();
  } catch {
    return value;
  }
}

export function dossierDeduplicationKey(dossier: Pick<ProspectDossier, 'officialWebsite' | 'contactPath'>) {
  return dossier.contactPath.email?.trim().toLowerCase() || normalizeWebsite(dossier.officialWebsite);
}

function providerCitationMap(citations: readonly OpenRouterCitation[]) {
  const sources = new Map<string, OpenRouterCitation>();
  for (const citation of citations) {
    if (!isPublicSourceUrl(citation.url)) continue;
    sources.set(normalizedCitationUrl(citation.url), {
      url: normalizedCitationUrl(citation.url),
      title: citation.title.trim() || citation.url,
      excerpt: citation.excerpt.trim() || 'OpenRouter web-search source.',
    });
  }
  return sources;
}

/**
 * Parse a structured completion and replace model-supplied source text with
 * the actual OpenRouter web-search citations. Every evidence claim must point
 * to one of those public HTTPS sources.
 */
export function parseProspectDossierBatch(rawJson: string, providerCitations: readonly OpenRouterCitation[]): ProspectDossierBatch {
  let raw: unknown;
  try { raw = JSON.parse(rawJson); } catch { throw new ProspectDossierValidationError('The model did not return valid dossier JSON.'); }
  const parsed = prospectDossierBatchSchema.safeParse(raw);
  if (!parsed.success) throw new ProspectDossierValidationError(parsed.error.issues[0]?.message || 'The dossier JSON did not match the required shape.');

  const sources = providerCitationMap(providerCitations);
  if (!sources.size) throw new ProspectDossierValidationError('The model response did not include public OpenRouter web-search citations.');

  const batchKeys = new Set<string>();
  const dossiers = parsed.data.dossiers.map((dossier) => {
    if (!isPublicSourceUrl(dossier.officialWebsite)) {
      throw new ProspectDossierValidationError('A dossier official website must be a public HTTPS URL.');
    }
    const key = dossierDeduplicationKey(dossier);
    if (batchKeys.has(key)) throw new ProspectDossierValidationError('The response contains duplicate businesses.');
    batchKeys.add(key);

    const citationUrls = new Set<string>();
    const citations = dossier.citations.map((citation) => {
      if (!isPublicSourceUrl(citation.url)) throw new ProspectDossierValidationError('A dossier citation must be a public HTTPS URL.');
      const url = normalizedCitationUrl(citation.url);
      if (citationUrls.has(url)) throw new ProspectDossierValidationError('A dossier repeats a citation URL.');
      citationUrls.add(url);
      const source = sources.get(url);
      if (!source) throw new ProspectDossierValidationError('A dossier claim cites a source not returned by OpenRouter web search.');
      return source;
    });

    const supportedUrls = new Set(citations.map((citation) => citation.url));
    const observedEvidence = dossier.observedEvidence.map((evidence) => {
      const evidenceUrls = [...new Set(evidence.citationUrls.map(normalizedCitationUrl))];
      if (!evidenceUrls.length || evidenceUrls.some((url) => !supportedUrls.has(url))) {
        throw new ProspectDossierValidationError('Every observed claim must cite a returned public source.');
      }
      return { ...evidence, citationUrls: evidenceUrls };
    });

    if (dossier.contactPath.email && dossier.contactPath.type !== 'email') {
      throw new ProspectDossierValidationError('A contact email must be labeled as an email contact path.');
    }
    return { ...dossier, citations, observedEvidence };
  });
  return { dossiers, ...(parsed.data.shortfallReason ? { shortfallReason: parsed.data.shortfallReason } : {}) };
}

export const prospectDossierResponseJsonSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['dossiers'],
  properties: {
    dossiers: {
      type: 'array', minItems: 1, maxItems: 2,
      items: {
        type: 'object', additionalProperties: false,
        required: ['companyName', 'officialWebsite', 'icpReason', 'observedEvidence', 'citations', 'recommendedOfferAngle', 'contactPath', 'suggestedOutreach'],
        properties: {
          companyName: { type: 'string' },
          officialWebsite: { type: 'string' },
          icpReason: { type: 'string' },
          observedEvidence: {
            type: 'array', minItems: 1,
            items: { type: 'object', additionalProperties: false, required: ['claim', 'citationUrls'], properties: { claim: { type: 'string' }, citationUrls: { type: 'array', minItems: 1, items: { type: 'string' } } } },
          },
          citations: {
            type: 'array', minItems: 1,
            items: { type: 'object', additionalProperties: false, required: ['url', 'title', 'excerpt'], properties: { url: { type: 'string' }, title: { type: 'string' }, excerpt: { type: 'string' } } },
          },
          recommendedOfferAngle: { type: 'string' },
          contactPath: { type: 'object', additionalProperties: false, required: ['type', 'value'], properties: { type: { type: 'string', enum: ['email', 'contact_form', 'phone', 'linkedin', 'other', 'unknown'] }, value: { type: 'string' }, email: { type: 'string' } } },
          suggestedOutreach: { type: 'object', additionalProperties: false, required: ['subject', 'body'], properties: { subject: { type: 'string' }, body: { type: 'string' } } },
        },
      },
    },
    shortfallReason: { type: 'string' },
  },
} as const;

export type ProspectResearchContext = {
  targetMarket: string;
  geography: string;
  businessSize: string;
  painSignals: string[];
  exclusionRules: string[];
  offer: string;
  targetAcceptedDossiers: number;
};

export function createProspectResearchPrompt(context: ProspectResearchContext) {
  return [
    'Research public business information only. Never send messages, submit forms, log in, or claim facts that are not supported by an OpenRouter web-search citation.',
    `Find up to ${context.targetAcceptedDossiers} distinct businesses that fit this ICP: ${context.targetMarket}.`,
    `Geography: ${context.geography}. Business size/type: ${context.businessSize || 'not specified'}.`,
    `Pain signals to look for: ${context.painSignals.join('; ') || 'not specified'}.`,
    `Exclude: ${context.exclusionRules.join('; ') || 'none listed'}.`,
    `Recommended offer: ${context.offer}.`,
    'Use the official HTTPS website when identifiable. Each observed evidence claim must cite one or more URLs returned by web search. Include only a public contact path; do not infer or fabricate an email address.',
    'Return exactly the requested JSON schema. Return one dossier with shortfallReason if a second citation-backed business cannot be found; never fabricate a second result.',
  ].join('\n');
}
