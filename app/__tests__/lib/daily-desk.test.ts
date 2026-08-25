import { describe, expect, it } from 'vitest';
import {
  DAILY_DESK_BUDGETS,
  dailyDeskBudgetAllows,
  renderDailyDeskGraphic,
  selectDailyDeskTextModel,
  validateDailyDeskProspectBatch,
} from '@/lib/daily-desk';

const qualityApproved = [
  { taskId: 'classify-public-evidence', qualityScore: 0.94, toolUseScore: 0.96, failed: false, repairRequired: false },
  { taskId: 'draft-approved-message', qualityScore: 0.92, toolUseScore: 0.95, failed: false, repairRequired: false },
  { taskId: 'summarize-weekly-brief', qualityScore: 0.91, toolUseScore: 0.94, failed: false, repairRequired: false },
];

describe('Daily Desk model policy', () => {
  it('selects only quality-approved, price-known candidates and freezes the provider privacy policy', () => {
    const route = selectDailyDeskTextModel({
      candidates: [
        {
          id: 'provider/expensive',
          availability: 'available',
          supportedParameters: ['tools', 'response_format'],
          pricing: { prompt: 0.000002, completion: 0.000003, request: 0.001, webSearch: 0.01 },
        },
        {
          id: 'provider/affordable',
          availability: 'available',
          supportedParameters: ['tools', 'response_format'],
          pricing: { prompt: 0.0000002, completion: 0.0000003, request: 0.0001, webSearch: 0.001 },
        },
      ],
      evaluations: [
        ...qualityApproved.map((record) => ({ ...record, providerModelId: 'provider/expensive' })),
        ...qualityApproved.map((record) => ({ ...record, providerModelId: 'provider/affordable' })),
      ],
      dailyCommittedUsd: 0,
      monthlyCommittedUsd: 0,
    });

    expect(route).toMatchObject({
      modelId: 'provider/affordable',
      providerPolicy: {
        require_parameters: true,
        data_collection: 'deny',
        zdr: true,
        allow_fallbacks: false,
      },
    });
    expect(route?.estimatedCostUsd).toBeGreaterThan(0);
    expect(route?.rationale).toMatch(/quality-approved/i);
  });

  it('fails closed for missing prices, incomplete quality evidence, and concurrent budget pressure', () => {
    const candidate = {
      id: 'provider/missing-price',
      availability: 'available' as const,
      supportedParameters: ['tools', 'response_format'],
      pricing: { prompt: null, completion: 0, request: 0, webSearch: 0 },
    };
    expect(selectDailyDeskTextModel({
      candidates: [candidate],
      evaluations: qualityApproved.map((record) => ({ ...record, providerModelId: candidate.id })),
      dailyCommittedUsd: 0,
      monthlyCommittedUsd: 0,
    })).toBeNull();

    expect(selectDailyDeskTextModel({
      candidates: [{ ...candidate, id: 'provider/incomplete', pricing: { prompt: 0, completion: 0, request: 0, webSearch: 0 } }],
      evaluations: [{ ...qualityApproved[0], providerModelId: 'provider/incomplete' }],
      dailyCommittedUsd: 0,
      monthlyCommittedUsd: 0,
    })).toBeNull();

    expect(dailyDeskBudgetAllows({ dailyCommittedUsd: DAILY_DESK_BUDGETS.dailyUsd, monthlyCommittedUsd: 0, proposedUsd: 0.0001 })).toBe(false);
    expect(dailyDeskBudgetAllows({ dailyCommittedUsd: 0, monthlyCommittedUsd: DAILY_DESK_BUDGETS.monthlyUsd, proposedUsd: 0.0001 })).toBe(false);
  });
});

describe('Daily Desk research and social artifacts', () => {
  const batch = {
    prospects: [
      {
        companyName: 'Northstar Operations',
        officialWebsite: 'https://northstar.example',
        role: 'Operations consultant',
        contactPath: 'https://northstar.example/contact',
        observedEvidence: [{ claim: 'The firm serves local service businesses.', citationUrls: ['https://northstar.example/about'] }],
        citations: [{ url: 'https://northstar.example/about', title: 'About Northstar', excerpt: 'Local operations consulting.' }],
        draftSubject: 'A quick conversion-clarity idea',
        draftBody: 'This is a manual draft only.',
      },
      {
        companyName: 'Harbor Business Systems',
        officialWebsite: 'https://harbor.example',
        role: 'Business consultant',
        contactPath: 'https://harbor.example/contact',
        observedEvidence: [{ claim: 'The firm advises nearby owner-led teams.', citationUrls: ['https://harbor.example/services'] }],
        citations: [{ url: 'https://harbor.example/services', title: 'Services', excerpt: 'Business systems consulting.' }],
        draftSubject: 'A contained website-fix thought',
        draftBody: 'This is a manual draft only.',
      },
    ],
  };

  it('requires exactly two distinct public-HTTPS, citation-backed prospect cards or an explicit shortfall', () => {
    expect(validateDailyDeskProspectBatch(batch)).toMatchObject({ prospects: batch.prospects });
    expect(() => validateDailyDeskProspectBatch({ ...batch, prospects: [batch.prospects[0], { ...batch.prospects[0], companyName: 'Duplicate' }] })).toThrow(/distinct/i);
    expect(() => validateDailyDeskProspectBatch({ prospects: [batch.prospects[0]] })).toThrow(/shortfall/i);
    expect(validateDailyDeskProspectBatch({ prospects: [batch.prospects[0]], shortfallReason: 'Only one local fit had sufficient public evidence.' })).toMatchObject({ shortfallReason: expect.any(String) });
    expect(() => validateDailyDeskProspectBatch({ ...batch, prospects: [{ ...batch.prospects[0], officialWebsite: 'http://unsafe.example' }, batch.prospects[1]] })).toThrow(/HTTPS/i);
  });

  it('renders a deterministic, neutral 4:5 graphic with escaped approved copy', () => {
    const input = {
      headline: 'A clearer next step',
      supportingText: 'for local business owners',
      footer: 'NeedThisDone',
    };
    const first = renderDailyDeskGraphic(input);
    const second = renderDailyDeskGraphic(input);
    expect(first).toBe(second);
    expect(first).toContain('width="1080"');
    expect(first).toContain('height="1350"');
    expect(renderDailyDeskGraphic({ ...input, headline: '<script>never</script>' })).not.toContain('<script>');
  });
});
