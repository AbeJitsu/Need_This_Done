import { z } from 'zod';
import { isMovingOpenRouterModelAlias } from '@/lib/openrouter-model-config';
import { isPublicSourceUrl, normalizeWebsite } from '@/lib/prospecting';

export const DAILY_DESK_BUDGETS = {
  dailyUsd: 0.75,
  monthlyUsd: 25,
  historyDays: 90,
} as const;

export const DAILY_DESK_PROVIDER_POLICY = {
  require_parameters: true,
  data_collection: 'deny',
  zdr: true,
  allow_fallbacks: false,
} as const;

export const DAILY_DESK_MAX_PROMPT_TOKENS = 6_000;
export const DAILY_DESK_MAX_COMPLETION_TOKENS = 1_500;
export const DAILY_DESK_MAX_WEB_SEARCH_CALLS = 1;

export type DailyDeskCatalogCandidate = {
  id: string;
  availability: 'available' | 'unavailable';
  supportedParameters: string[];
  pricing: {
    prompt: number | null;
    completion: number | null;
    request: number | null;
    webSearch: number | null;
  };
};

export type DailyDeskEvaluation = {
  providerModelId: string;
  taskId: string;
  qualityScore: number;
  toolUseScore: number;
  failed: boolean;
  repairRequired: boolean;
};

export type DailyDeskTextModelRoute = {
  modelId: string;
  estimatedCostUsd: number;
  providerPolicy: typeof DAILY_DESK_PROVIDER_POLICY;
  rationale: string;
};

function finiteNonnegative(value: number | null): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

export function estimateDailyDeskTextCost(candidate: Pick<DailyDeskCatalogCandidate, 'pricing'>) {
  const { prompt, completion, request, webSearch } = candidate.pricing;
  if (!finiteNonnegative(prompt) || !finiteNonnegative(completion) || !finiteNonnegative(request) || !finiteNonnegative(webSearch)) return null;
  const cost = prompt * DAILY_DESK_MAX_PROMPT_TOKENS
    + completion * DAILY_DESK_MAX_COMPLETION_TOKENS
    + request
    + webSearch * DAILY_DESK_MAX_WEB_SEARCH_CALLS;
  return Number.isFinite(cost) && cost >= 0 ? cost : null;
}

export function dailyDeskBudgetAllows(input: {
  dailyCommittedUsd: number;
  monthlyCommittedUsd: number;
  proposedUsd: number;
}) {
  const values = [input.dailyCommittedUsd, input.monthlyCommittedUsd, input.proposedUsd];
  return values.every((value) => Number.isFinite(value) && value >= 0)
    && input.proposedUsd <= DAILY_DESK_BUDGETS.dailyUsd
    && input.dailyCommittedUsd + input.proposedUsd <= DAILY_DESK_BUDGETS.dailyUsd
    && input.monthlyCommittedUsd + input.proposedUsd <= DAILY_DESK_BUDGETS.monthlyUsd;
}

function qualityApproved(modelId: string, evaluations: readonly DailyDeskEvaluation[]) {
  const required = new Set([
    'classify-public-evidence',
    'draft-approved-message',
    'summarize-weekly-brief',
  ]);
  const records = evaluations.filter((record) => record.providerModelId === modelId && required.has(record.taskId));
  if (new Set(records.map((record) => record.taskId)).size !== required.size) return false;
  return records.every((record) => record.qualityScore >= 0.8
    && record.toolUseScore >= 0.9
    && !record.failed
    && !record.repairRequired);
}

/**
 * This is deliberately server-owned: callers may supply current catalog data,
 * but cannot choose an unmeasured, unpriced, alias, or privacy-weaker route.
 */
export function selectDailyDeskTextModel(input: {
  candidates: readonly DailyDeskCatalogCandidate[];
  evaluations: readonly DailyDeskEvaluation[];
  dailyCommittedUsd: number;
  monthlyCommittedUsd: number;
}): DailyDeskTextModelRoute | null {
  const candidates = input.candidates
    .map((candidate) => ({ candidate, estimatedCostUsd: estimateDailyDeskTextCost(candidate) }))
    .filter((entry): entry is { candidate: DailyDeskCatalogCandidate; estimatedCostUsd: number } => entry.estimatedCostUsd !== null)
    .filter(({ candidate }) => candidate.availability === 'available'
      && !isMovingOpenRouterModelAlias(candidate.id)
      && candidate.supportedParameters.includes('tools')
      && candidate.supportedParameters.includes('response_format')
      && qualityApproved(candidate.id, input.evaluations))
    .filter(({ estimatedCostUsd }) => dailyDeskBudgetAllows({
      dailyCommittedUsd: input.dailyCommittedUsd,
      monthlyCommittedUsd: input.monthlyCommittedUsd,
      proposedUsd: estimatedCostUsd,
    }))
    .sort((left, right) => left.estimatedCostUsd - right.estimatedCostUsd || left.candidate.id.localeCompare(right.candidate.id));

  const selected = candidates[0];
  if (!selected) return null;
  return {
    modelId: selected.candidate.id,
    estimatedCostUsd: selected.estimatedCostUsd,
    providerPolicy: DAILY_DESK_PROVIDER_POLICY,
    rationale: `Selected ${selected.candidate.id} because it is quality-approved, price-known, available, and fits the remaining Daily Desk budget.`,
  };
}

const citationSchema = z.object({
  url: z.string().url().max(2_000),
  title: z.string().trim().min(1).max(500),
  excerpt: z.string().trim().min(1).max(2_000),
}).strict();

const prospectSchema = z.object({
  companyName: z.string().trim().min(1).max(240),
  officialWebsite: z.string().url().max(2_000),
  role: z.string().trim().min(1).max(240),
  contactPath: z.string().url().max(2_000),
  observedEvidence: z.array(z.object({
    claim: z.string().trim().min(1).max(1_200),
    citationUrls: z.array(z.string().url().max(2_000)).min(1).max(8),
  }).strict()).min(1).max(12),
  citations: z.array(citationSchema).min(1).max(20),
  draftSubject: z.string().trim().min(1).max(300),
  draftBody: z.string().trim().min(1).max(10_000),
}).strict();

const prospectBatchSchema = z.object({
  prospects: z.array(prospectSchema).min(0).max(2),
  shortfallReason: z.string().trim().min(1).max(2_000).optional(),
}).strict().superRefine((value, context) => {
  if (value.prospects.length !== 2 && !value.shortfallReason) {
    context.addIssue({ code: 'custom', path: ['shortfallReason'], message: 'A research shortfall needs a concrete reason.' });
  }
  if (value.prospects.length === 2 && value.shortfallReason) {
    context.addIssue({ code: 'custom', path: ['shortfallReason'], message: 'A complete two-prospect result cannot include a shortfall.' });
  }
  const keys = new Set<string>();
  for (const [index, prospect] of value.prospects.entries()) {
    if (!isPublicSourceUrl(prospect.officialWebsite) || !isPublicSourceUrl(prospect.contactPath)) {
      context.addIssue({ code: 'custom', path: ['prospects', index], message: 'Prospect websites and contact paths must use public HTTPS URLs.' });
    }
    const key = normalizeWebsite(prospect.officialWebsite);
    if (keys.has(key)) {
      context.addIssue({ code: 'custom', path: ['prospects', index, 'officialWebsite'], message: 'Prospect cards must be distinct businesses.' });
    }
    keys.add(key);
    const citationUrls = new Set<string>();
    for (const citation of prospect.citations) {
      if (!isPublicSourceUrl(citation.url)) {
        context.addIssue({ code: 'custom', path: ['prospects', index, 'citations'], message: 'Citations must use public HTTPS URLs.' });
      }
      if (citationUrls.has(citation.url)) {
        context.addIssue({ code: 'custom', path: ['prospects', index, 'citations'], message: 'A prospect cannot repeat a citation.' });
      }
      citationUrls.add(citation.url);
    }
    for (const evidence of prospect.observedEvidence) {
      if (evidence.citationUrls.some((url) => !citationUrls.has(url))) {
        context.addIssue({ code: 'custom', path: ['prospects', index, 'observedEvidence'], message: 'Every observed claim must cite a listed citation.' });
      }
    }
  }
});

export type DailyDeskProspectBatch = z.infer<typeof prospectBatchSchema>;

export type DailyDeskProviderCitation = {
  url: string;
  title: string;
  excerpt: string;
};

/**
 * Parse a bounded research response and, when supplied, require every cited
 * source to have come from the provider's public-web citation set. This keeps
 * a plausible-looking model URL from becoming a Desk fact on its own.
 */
export function validateDailyDeskProspectBatch(value: unknown, providerCitations: readonly DailyDeskProviderCitation[] = []): DailyDeskProspectBatch {
  const parsed = prospectBatchSchema.safeParse(value);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || 'The Daily Desk research result is invalid.');
  if (providerCitations.length) {
    const providerUrls = new Set(providerCitations.map((citation) => citation.url));
    for (const prospect of parsed.data.prospects) {
      for (const citation of prospect.citations) {
        if (!providerUrls.has(citation.url)) {
          throw new Error('Every Daily Desk citation must come from the provider’s public-web research response.');
        }
      }
    }
  }
  return parsed.data;
}

export const dailyDeskProspectResponseJsonSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    prospects: {
      type: 'array',
      minItems: 0,
      maxItems: 2,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['companyName', 'officialWebsite', 'role', 'contactPath', 'observedEvidence', 'citations', 'draftSubject', 'draftBody'],
        properties: {
          companyName: { type: 'string' }, officialWebsite: { type: 'string' }, role: { type: 'string' }, contactPath: { type: 'string' },
          observedEvidence: {
            type: 'array', minItems: 1,
            items: { type: 'object', additionalProperties: false, required: ['claim', 'citationUrls'], properties: { claim: { type: 'string' }, citationUrls: { type: 'array', minItems: 1, items: { type: 'string' } } } },
          },
          citations: {
            type: 'array', minItems: 1,
            items: { type: 'object', additionalProperties: false, required: ['url', 'title', 'excerpt'], properties: { url: { type: 'string' }, title: { type: 'string' }, excerpt: { type: 'string' } } },
          },
          draftSubject: { type: 'string' }, draftBody: { type: 'string' },
        },
      },
    },
    shortfallReason: { type: 'string' },
  },
  required: ['prospects'],
} as const;

export function createDailyDeskResearchPrompt(input: {
  region: string;
  offer: string;
  targetSegment: string;
  painFocus: string;
}) {
  return [
    'Research public websites only. Do not send messages, publish content, use private data, or claim contact information that is not visibly public.',
    `Find exactly two distinct ${input.targetSegment} in ${input.region} when public evidence supports that fit.`,
    `The NeedThisDone offer is: ${input.offer}. The relevant pain focus is: ${input.painFocus}.`,
    'For each prospect, return its official HTTPS website, a public HTTPS contact path, role, one or more observed claims, and citations. Every observed claim must name one of its citation URLs.',
    'Draft a concise subject and body that a human may review and manually copy. Do not imply that anything will be sent automatically.',
    'If fewer than exactly two valid prospects can be verified, return at most one prospect and a concrete shortfallReason. Return only the requested JSON object.',
  ].join('\n\n');
}

function escapeXml(value: string) {
  return value.replace(/[<>&"']/g, (character) => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    '"': '&quot;',
    "'": '&apos;',
  })[character] || character);
}

function svgLines(value: string, maxLength: number) {
  const words = value.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxLength && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 4);
}

export function renderDailyDeskGraphic(input: {
  headline: string;
  supportingText: string;
  footer: string;
}) {
  const headline = svgLines(input.headline, 20);
  const supporting = svgLines(input.supportingText, 38);
  const headlineMarkup = headline.map((line, index) => `<tspan x="108" dy="${index === 0 ? 0 : 102}">${escapeXml(line)}</tspan>`).join('');
  const supportingMarkup = supporting.map((line, index) => `<tspan x="108" dy="${index === 0 ? 0 : 48}">${escapeXml(line)}</tspan>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350" role="img" aria-labelledby="title desc"><title id="title">${escapeXml(input.headline)}</title><desc id="desc">${escapeXml(input.supportingText)}</desc><rect width="1080" height="1350" fill="#f7f4ed"/><rect x="72" y="72" width="936" height="1206" rx="48" fill="#ffffff" stroke="#183229" stroke-opacity=".15" stroke-width="4"/><rect x="108" y="128" width="116" height="12" rx="6" fill="#d9b96e"/><text x="108" y="398" fill="#183229" font-family="Arial, Helvetica, sans-serif" font-size="102" font-weight="700" letter-spacing="-3">${headlineMarkup}</text><line x1="108" y1="816" x2="972" y2="816" stroke="#183229" stroke-opacity=".16" stroke-width="4"/><text x="108" y="904" fill="#50675e" font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="400">${supportingMarkup}</text><text x="108" y="1174" fill="#126b4e" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="700" letter-spacing="2">${escapeXml(input.footer).toUpperCase()}</text></svg>`;
}

export function dailyDeskSocialCopy(input: { region: string; offer: string }) {
  const region = input.region.trim() || 'your local market';
  const offer = input.offer.trim() || 'an evidence-based audit and one contained fix';
  const headline = 'A clearer next step';
  const supportingText = 'Less noise. More qualified conversations.';
  return {
    headline,
    supportingText,
    caption: `A clearer next step beats a noisier funnel. NeedThisDone helps local teams turn website attention into qualified conversations through ${offer}. Serving ${region}. This is a draft prepared for manual posting.`,
    altText: 'Neutral NeedThisDone graphic reading “A clearer next step” with the supporting line “Less noise. More qualified conversations.”',
    footer: 'NeedThisDone',
  };
}
